#!/usr/bin/env python3
"""Find leads for checks that cannot fail in a repository.

Usage:
    python3 scan_checks.py REPO [--json]

Reads package.json scripts, shell scripts, Makefiles, justfiles, GitHub
workflow files, and test files. Reports, with file and line:

HIGH (a failing check can read as a pass)
  pipe-masks-exit   a check command piped into tail, head, tee, grep, sort,
                    cat, or less, in a file that never sets pipefail
  or-fallback       a check command followed by `||` and a fallback that
                    exits 0 (`|| true`, `|| :`, `|| echo`, `|| cat log`)
  continue-on-error continue-on-error: true on a workflow step that runs a
                    check (MEDIUM when the step names no check word)
  pass-no-tests     --passWithNoTests or --pass-with-no-tests
  stub-test-script  a package.json "test" script that only echoes and does
                    not exit non-zero
  only-focus        .only( in a test file, which silently skips its siblings
                    in runners that honor it

MEDIUM (coverage is reduced, maybe on purpose)
  skipped-test      .skip(, xit(, xdescribe(, test.todo(, { skip: true },
                    @pytest.mark.skip, @unittest.skip
  set-plus-e        set +e in a shell script

Exit 1 when there is any HIGH lead, 0 otherwise, 2 on a usage error. A lead
is not a defect until a mutant proves the check misses a real break.

Standard library only.
"""

import argparse
import json
import os
import re
import sys

SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", "coverage", "vendor",
    "third_party", "__pycache__", ".venv", "venv", ".turbo",
}

CHECK_WORDS = (
    r"(?:\btest\b|\btests\b|\btsc\b|\blint\b|\beslint\b|\bcheck\b|\bpytest\b|\bunittest\b"
    r"|\bvitest\b|\bjest\b|\bplaywright\b|--test\b|\bbuild\b|\btypecheck\b|\bverify\b|\bsmoke\b)"
)
CHECK = re.compile(CHECK_WORDS)
PIPE_MASK = re.compile(r"(?<!\|)\|(?!\|)\s*(?:tail|head|tee|grep|sort|cat|less)\b")
OR_FALLBACK = re.compile(
    r"\|\|\s*\(?\s*(?:(?:true|echo|printf|cat|tail|head)\b|:(?=\s|$|;|\))|exit\s+0\b|return\s+0\b)"
)
STILL_FAILS = re.compile(r"\bexit\s+[1-9]|\bfalse\b|\breturn\s+[1-9]")
CONTINUE = re.compile(r"^\s*continue-on-error:\s*true\b")
PASS_NO_TESTS = re.compile(r"--passWithNoTests\b|--pass-with-no-tests\b")
PIPEFAIL = re.compile(r"pipefail")
ONLY = re.compile(r"\b(?:it|test|describe|suite|context)\.only\s*\(")
SKIP = re.compile(
    r"\b(?:it|test|describe|suite|context)\.(?:skip|todo)\s*\(|\bx(?:it|describe|test)\s*\("
    r"|\bskip\s*:\s*true\b|@pytest\.mark\.skip|@unittest\.skip"
)
SET_PLUS_E = re.compile(r"^\s*set\s+\+e\b")

TEST_FILE = re.compile(
    r"(?:\.(?:test|spec)\.[cm]?[jt]sx?$)|(?:^test_.*\.py$)|(?:_test\.py$)|(?:\.test\.py$)"
)
SCRIPT_NAMES = {"makefile", "gnumakefile", "justfile"}


def kind_of(path):
    """Classify a file as package, workflow, script, test, or None."""
    name = os.path.basename(path)
    lower = name.lower()
    parts = path.replace(os.sep, "/").split("/")
    if name == "package.json":
        return "package"
    if lower.endswith((".yml", ".yaml")) and ".github" in parts and "workflows" in parts:
        return "workflow"
    if lower.endswith((".sh", ".bash", ".zsh")) or lower in SCRIPT_NAMES or lower.endswith(".mk"):
        return "script"
    if TEST_FILE.search(name):
        return "test"
    return None


def walk(repo):
    for root, dirs, files in os.walk(repo):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            path = os.path.join(root, name)
            kind = kind_of(os.path.relpath(path, repo))
            if kind:
                yield path, kind


def read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as handle:
            return handle.read()
    except OSError:
        return None


def command_leads(lines, has_pipefail, rel, is_workflow):
    """Leads in lines that run commands (scripts, workflow run steps)."""
    leads = []
    for index, (number, line) in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("#"):
            continue
        if is_workflow and CONTINUE.search(line):
            severity = "HIGH" if CHECK.search(step_text(lines, index)) else "MEDIUM"
            leads.append(lead(severity, "continue-on-error", rel, number, stripped))
            continue
        if PASS_NO_TESTS.search(line):
            leads.append(lead("HIGH", "pass-no-tests", rel, number, stripped))
        if not CHECK.search(line):
            continue
        if PIPE_MASK.search(line) and not has_pipefail:
            leads.append(lead("HIGH", "pipe-masks-exit", rel, number, stripped))
        fallback = OR_FALLBACK.search(line)
        if fallback and not STILL_FAILS.search(line[fallback.end() :]):
            leads.append(lead("HIGH", "or-fallback", rel, number, stripped))
    return leads


def step_text(lines, index):
    """The workflow step or job around lines[index]: from its `- ` item to the next."""
    indent = len(lines[index][1]) - len(lines[index][1].lstrip())
    start = index
    while start > 0:
        text = lines[start][1]
        if text.lstrip().startswith("- ") and len(text) - len(text.lstrip()) < indent:
            break
        start -= 1
    end = index + 1
    while end < len(lines):
        text = lines[end][1]
        if text.strip() and len(text) - len(text.lstrip()) < indent:
            break
        end += 1
    return "\n".join(text for _, text in lines[start:end])


def lead(severity, rule, path, line, text):
    return {"severity": severity, "rule": rule, "file": path, "line": line, "text": text[:160]}


def package_leads(text, rel):
    """Leads in package.json scripts, located by line in the raw text."""
    try:
        data = json.loads(text)
    except ValueError:
        return [lead("MEDIUM", "unparsed-package-json", rel, 1, "package.json is not valid JSON")]
    scripts = data.get("scripts") if isinstance(data, dict) else None
    if not isinstance(scripts, dict):
        return []
    raw_lines = text.splitlines()
    leads = []
    for name, command in scripts.items():
        if not isinstance(command, str):
            continue
        number = locate(raw_lines, name)
        shown = f'"{name}": {command}'
        # The script name joins the command so that "test": "x | tail" counts as a check.
        found = command_leads([(number, f"{name} {command}")], False, rel, False)
        for item in found:
            item["text"] = shown[:160]
        leads.extend(found)
        if name == "test" and is_stub(command):
            leads.append(lead("HIGH", "stub-test-script", rel, number, shown))
    return leads


def is_stub(command):
    """True for a test script that only echoes and never exits non-zero."""
    parts = [p.strip() for p in re.split(r"&&|;|\|\|", command) if p.strip()]
    if not parts:
        return True
    return all(p.startswith(("echo", "printf", "true", ":")) for p in parts)


def locate(raw_lines, script_name):
    key = re.compile(r'"' + re.escape(script_name) + r'"\s*:')
    for number, line in enumerate(raw_lines, start=1):
        if key.search(line):
            return number
    return 1


def test_file_leads(lines, rel):
    leads = []
    for number, line in lines:
        if ONLY.search(line):
            leads.append(lead("HIGH", "only-focus", rel, number, line.strip()))
        elif SKIP.search(line):
            leads.append(lead("MEDIUM", "skipped-test", rel, number, line.strip()))
    return leads


def scan(repo):
    leads = []
    counts = {"package": 0, "workflow": 0, "script": 0, "test": 0}
    for path, kind in walk(repo):
        text = read(path)
        if text is None:
            continue
        counts[kind] += 1
        rel = os.path.relpath(path, repo)
        numbered = list(enumerate(text.splitlines(), start=1))
        if kind == "package":
            leads.extend(package_leads(text, rel))
        elif kind == "test":
            leads.extend(test_file_leads(numbered, rel))
        else:
            has_pipefail = bool(PIPEFAIL.search(text))
            leads.extend(command_leads(numbered, has_pipefail, rel, kind == "workflow"))
            if kind == "script":
                for number, line in numbered:
                    if SET_PLUS_E.search(line):
                        leads.append(lead("MEDIUM", "set-plus-e", rel, number, line.strip()))
    order = {"HIGH": 0, "MEDIUM": 1}
    leads.sort(key=lambda x: (order[x["severity"]], x["file"], x["line"]))
    return counts, leads


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("repo")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    if not os.path.isdir(args.repo):
        print(f"scan_checks.py: not a directory: {args.repo}", file=sys.stderr)
        return 2

    counts, leads = scan(args.repo)
    high = sum(1 for x in leads if x["severity"] == "HIGH")
    if args.json:
        print(json.dumps({"files_read": counts, "leads": leads}, indent=2))
    else:
        read_summary = ", ".join(f"{v} {k}" for k, v in counts.items())
        print(f"files read: {read_summary}")
        print(f"leads: {high} HIGH, {len(leads) - high} MEDIUM")
        for x in leads:
            print(f"  {x['severity']:<6} {x['rule']:<18} {x['file']}:{x['line']}")
            print(f"         {x['text']}")
    return 1 if high else 0


if __name__ == "__main__":
    sys.exit(main())
