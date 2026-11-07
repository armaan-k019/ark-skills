"""Tests for scan_checks.py. Run: python3 -m unittest discover check-audit/scripts"""

import contextlib
import io
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scan_checks  # noqa: E402


def scan(files):
    """Write files into a temp repo, scan it, return (exit code, rules by file)."""
    with tempfile.TemporaryDirectory() as repo:
        for rel, text in files.items():
            path = os.path.join(repo, rel)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as handle:
                handle.write(text)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = scan_checks.main([repo, "--json"])
        report = json.loads(out.getvalue())
        return code, [(x["severity"], x["rule"], x["file"], x["line"]) for x in report["leads"]]


CLEAN_PACKAGE = json.dumps(
    {"scripts": {"test": "node --test src/*.test.js", "build": "tsc -p ."}}, indent=2
)


class ScanChecksTest(unittest.TestCase):
    def test_clean_repo_has_no_leads(self):
        code, leads = scan(
            {
                "package.json": CLEAN_PACKAGE,
                "scripts/ci.sh": "#!/bin/sh\nset -e\nnpm test\n",
                "src/a.test.js": "test('adds', () => {})\n",
            }
        )
        self.assertEqual((code, leads), (0, []))

    def test_pipe_into_tail_masks_exit(self):
        code, leads = scan({"scripts/ci.sh": "npm test | tail -5\n"})
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "pipe-masks-exit", "scripts/ci.sh", 1), leads)

    def test_pipe_in_a_non_check_command_is_ignored(self):
        code, leads = scan({"scripts/list.sh": "ls -1 docs | head -3\n"})
        self.assertEqual((code, leads), (0, []))

    def test_commented_out_command_is_ignored(self):
        code, leads = scan({"scripts/ci.sh": "# npm test | tail -5\n"})
        self.assertEqual((code, leads), (0, []))

    def test_pipefail_clears_the_pipe_lead(self):
        code, leads = scan({"scripts/ci.sh": "set -o pipefail\nnpm test | tail -5\n"})
        self.assertEqual((code, leads), (0, []))

    def test_logical_or_is_not_a_pipe(self):
        code, leads = scan({"scripts/ci.sh": "npm test || exit 1\n"})
        self.assertEqual((code, leads), (0, []))

    def test_fallback_that_still_fails_is_clean(self):
        code, leads = scan({"scripts/ci.sh": "npm test || (echo failed; exit 1)\n"})
        self.assertEqual((code, leads), (0, []))

    def test_fallback_to_cat_masks_exit_and_is_not_a_pipe(self):
        code, leads = scan({"scripts/ci.sh": "npm test || tail -20 err.log\n"})
        self.assertEqual(code, 1)
        self.assertEqual(leads, [("HIGH", "or-fallback", "scripts/ci.sh", 1)])

    def test_or_true_in_package_script(self):
        package = json.dumps({"scripts": {"lint": "eslint . || true"}}, indent=2)
        code, leads = scan({"package.json": package})
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "or-fallback", "package.json", 3), leads)

    def test_stub_test_script_exiting_zero(self):
        package = json.dumps({"scripts": {"test": "echo \"no tests yet\""}}, indent=2)
        code, leads = scan({"package.json": package})
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "stub-test-script", "package.json", 3), leads)

    def test_npm_default_stub_that_exits_one_is_not_a_false_pass(self):
        package = json.dumps(
            {"scripts": {"test": "echo \"Error: no test specified\" && exit 1"}}, indent=2
        )
        code, leads = scan({"package.json": package})
        self.assertEqual((code, leads), (0, []))

    def test_continue_on_error_in_workflow(self):
        workflow = "jobs:\n  t:\n    steps:\n      - run: npm test\n        continue-on-error: true\n"
        code, leads = scan({".github/workflows/ci.yml": workflow})
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "continue-on-error", ".github/workflows/ci.yml", 5), leads)

    def test_continue_on_error_on_a_cache_step_is_medium(self):
        workflow = (
            "jobs:\n  t:\n    steps:\n      - run: npm run lint\n"
            "      - name: Cache downloads\n        continue-on-error: true\n        uses: ./cache\n"
            "      - run: npm test\n"
        )
        code, leads = scan({".github/workflows/ci.yml": workflow})
        self.assertEqual(code, 0)
        self.assertEqual(leads, [("MEDIUM", "continue-on-error", ".github/workflows/ci.yml", 6)])

    def test_condition_with_or_is_not_a_fallback(self):
        workflow = (
            "jobs:\n  t:\n    if: needs.test.result == 'success' || needs.test.result == 'failure'\n"
            "    steps:\n      - run: test \"$A\" != true || test \"$B\" = success\n"
        )
        code, leads = scan({".github/workflows/ci.yml": workflow})
        self.assertEqual((code, leads), (0, []))

    def test_only_is_high_and_skip_is_medium(self):
        code, leads = scan(
            {"src/a.test.ts": "it.only('a', () => {})\nit.skip('b', () => {})\n"}
        )
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "only-focus", "src/a.test.ts", 1), leads)
        self.assertIn(("MEDIUM", "skipped-test", "src/a.test.ts", 2), leads)

    def test_skip_alone_exits_zero(self):
        code, leads = scan({"tests/test_x.py": "@unittest.skip('slow')\ndef test_a(): pass\n"})
        self.assertEqual(code, 0)
        self.assertEqual(leads, [("MEDIUM", "skipped-test", "tests/test_x.py", 1)])

    def test_pass_with_no_tests(self):
        package = json.dumps({"scripts": {"test": "jest --passWithNoTests"}}, indent=2)
        code, leads = scan({"package.json": package})
        self.assertEqual(code, 1)
        self.assertIn(("HIGH", "pass-no-tests", "package.json", 3), leads)

    def test_node_modules_is_ignored(self):
        code, leads = scan({"node_modules/x/run.sh": "npm test | tail\n"})
        self.assertEqual((code, leads), (0, []))

    def test_not_a_directory_is_usage_error(self):
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            self.assertEqual(scan_checks.main(["/nonexistent/repo"]), 2)


if __name__ == "__main__":
    unittest.main()
