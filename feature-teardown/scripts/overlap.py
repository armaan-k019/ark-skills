#!/usr/bin/env python3
"""Report text the candidate code shares with the donor code.

Usage:
    python3 overlap.py DONOR CANDIDATE [--window N] [--long-line N] [--json]

DONOR and CANDIDATE are each a file or a directory. The script reports:

- runs of WINDOW (default 4) consecutive significant lines that appear in the
  same order in both, after whitespace is collapsed, and
- single significant lines of LONG_LINE (default 60) characters or more that
  appear in both.

A significant line has at least 6 letters or digits, so lone braces, `return;`
and blank lines never match. Exit 0 when nothing is shared, 1 when anything
is, 2 on a usage error. A hit is a lead for a person to read, not a verdict:
common boilerplate can match.

Standard library only.
"""

import argparse
import json
import os
import re
import sys

SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "__pycache__", "vendor"}
MAX_BYTES = 2 * 1024 * 1024
MIN_ALNUM = 6
WS = re.compile(r"\s+")
ALNUM = re.compile(r"[A-Za-z0-9]")


def iter_files(path):
    """Yield every readable text file under path (or path itself)."""
    if os.path.isfile(path):
        yield path
        return
    for root, dirs, files in os.walk(path):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            yield os.path.join(root, name)


def read_lines(path):
    """Return the file's lines, or None for binary, huge, or unreadable files."""
    try:
        if os.path.getsize(path) > MAX_BYTES:
            return None
        with open(path, "rb") as handle:
            data = handle.read()
    except OSError:
        return None
    if b"\0" in data:
        return None
    return data.decode("utf-8", errors="replace").splitlines()


def significant(lines):
    """List (line_number, normalized_text) for lines that can carry meaning."""
    out = []
    for number, raw in enumerate(lines, start=1):
        text = WS.sub(" ", raw).strip()
        if len(ALNUM.findall(text)) >= MIN_ALNUM:
            out.append((number, text))
    return out


def load(path):
    """Map each file under path to its significant lines."""
    table = {}
    for file in iter_files(path):
        lines = read_lines(file)
        if lines is not None:
            table[file] = significant(lines)
    return table


def donor_index(donor, window, long_line):
    """Index donor windows and long lines to their first location."""
    windows, longs = {}, {}
    for file, sig in donor.items():
        texts = [text for _, text in sig]
        for i in range(len(texts) - window + 1):
            windows.setdefault(tuple(texts[i : i + window]), (file, sig[i][0]))
        for number, text in sig:
            if len(text) >= long_line:
                longs.setdefault(text, (file, number))
    return windows, longs


def find_runs(candidate, windows, window):
    """Merge overlapping matched windows in each candidate file into runs."""
    runs = []
    for file, sig in candidate.items():
        texts = [text for _, text in sig]
        hits = [i for i in range(len(texts) - window + 1) if tuple(texts[i : i + window]) in windows]
        start = None
        for pos, i in enumerate(hits):
            if start is None:
                start = i
            last = pos == len(hits) - 1
            if last or hits[pos + 1] > i + window:
                end = i + window - 1
                donor_file, donor_line = windows[tuple(texts[start : start + window])]
                runs.append(
                    {
                        "candidate": file,
                        "candidate_lines": [sig[start][0], sig[end][0]],
                        "donor": donor_file,
                        "donor_first_line": donor_line,
                        "significant_lines": end - start + 1,
                    }
                )
                start = None
    return runs


def find_long_lines(candidate, longs):
    """List candidate lines that repeat a long donor line exactly."""
    found = []
    for file, sig in candidate.items():
        for number, text in sig:
            if text in longs:
                donor_file, donor_line = longs[text]
                found.append(
                    {
                        "candidate": file,
                        "candidate_line": number,
                        "donor": donor_file,
                        "donor_line": donor_line,
                        "text": text[:120],
                    }
                )
    return found


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("donor")
    parser.add_argument("candidate")
    parser.add_argument("--window", type=int, default=4)
    parser.add_argument("--long-line", type=int, default=60)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    for path in (args.donor, args.candidate):
        if not os.path.exists(path):
            print(f"overlap.py: no such path: {path}", file=sys.stderr)
            return 2
    if args.window < 2 or args.long_line < 1:
        print("overlap.py: --window must be 2 or more, --long-line 1 or more", file=sys.stderr)
        return 2

    donor = load(args.donor)
    candidate = load(args.candidate)
    windows, longs = donor_index(donor, args.window, args.long_line)
    runs = find_runs(candidate, windows, args.window)
    long_lines = find_long_lines(candidate, longs)

    report = {
        "donor_files": len(donor),
        "candidate_files": len(candidate),
        "window": args.window,
        "long_line": args.long_line,
        "runs": runs,
        "long_lines": long_lines,
    }
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"donor files: {len(donor)}, candidate files: {len(candidate)}")
        print(f"shared runs of {args.window}+ significant lines: {len(runs)}")
        for run in runs:
            a, b = run["candidate_lines"]
            print(
                f"  {run['candidate']}:{a}-{b} ({run['significant_lines']} lines)"
                f" matches {run['donor']}:{run['donor_first_line']}"
            )
        print(f"shared lines of {args.long_line}+ characters: {len(long_lines)}")
        for hit in long_lines:
            print(f"  {hit['candidate']}:{hit['candidate_line']} matches {hit['donor']}:{hit['donor_line']}")
            print(f"    {hit['text']}")
    return 1 if runs or long_lines else 0


if __name__ == "__main__":
    sys.exit(main())
