"""Tests for overlap.py. Run: python3 -m unittest discover feature-teardown/scripts"""

import contextlib
import io
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import overlap  # noqa: E402

DONOR = """\
function scheduleRedraw(field, nodes) {
  const pending = nodes.filter((node) => node.dirty && !node.hidden);
  for (const node of pending) {
    field.context.drawNodeWithGlow(node, field.palette.accent);
  }
  field.lastFrameTimestamp = performance.now();
  return pending.length;
}
"""

REWRITE = """\
export function redrawChanged(canvas, items) {
  let count = 0;
  items.forEach((item) => {
    if (!item.changed || item.invisible) return;
    canvas.paint(item);
    count += 1;
  });
  canvas.stamp = Date.now();
  return count;
}
"""

BOILERPLATE = """\
}
}
return;
  }
"""


def run(donor_text, candidate_text, *extra):
    with tempfile.TemporaryDirectory() as tmp:
        donor = os.path.join(tmp, "donor.js")
        candidate = os.path.join(tmp, "candidate.js")
        with open(donor, "w") as handle:
            handle.write(donor_text)
        with open(candidate, "w") as handle:
            handle.write(candidate_text)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = overlap.main([donor, candidate, "--json", *extra])
        return code, json.loads(out.getvalue())


class OverlapTest(unittest.TestCase):
    def test_copied_block_is_flagged(self):
        candidate = "// my file\n" + DONOR.replace("  ", "    ")
        code, report = run(DONOR, candidate)
        self.assertEqual(code, 1)
        self.assertEqual(len(report["runs"]), 1)
        self.assertEqual(report["runs"][0]["significant_lines"], 6)

    def test_independent_rewrite_is_clean(self):
        code, report = run(DONOR, REWRITE)
        self.assertEqual(code, 0)
        self.assertEqual(report["runs"], [])
        self.assertEqual(report["long_lines"], [])

    def test_boilerplate_never_matches(self):
        code, report = run(BOILERPLATE * 3, BOILERPLATE * 3)
        self.assertEqual(code, 0)

    def test_single_long_line_is_flagged(self):
        line = "  const pending = nodes.filter((node) => node.dirty && !node.hidden);\n"
        code, report = run(DONOR, REWRITE + line)
        self.assertEqual(code, 1)
        self.assertEqual(report["runs"], [])
        self.assertEqual(len(report["long_lines"]), 1)

    def test_two_separate_copied_blocks_are_two_runs(self):
        candidate = DONOR + REWRITE + DONOR
        code, report = run(DONOR, candidate)
        self.assertEqual(code, 1)
        self.assertEqual(len(report["runs"]), 2)

    def test_missing_path_is_usage_error(self):
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            code = overlap.main(["/nonexistent/donor", "/nonexistent/candidate"])
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
