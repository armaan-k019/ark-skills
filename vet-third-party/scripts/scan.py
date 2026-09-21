#!/usr/bin/env python3
"""Static first-pass scan of a third-party skill, hook, agent, plugin, or MCP config.

Usage:
  python3 scan.py PATH [--json]

Finds leads for a human or agent to read: hidden Unicode, prompt-injection
phrasing, install-time scripts, sensitive-path access, persistence changes,
network calls, and code execution. A hit is not a verdict; many are legitimate
(a design tool may run a local server). Every HIGH hit must be read in context.

Exit code: 1 if any HIGH finding, else 0. Standard library only.
"""
import json
import os
import re
import sys
from pathlib import Path

TEXT_EXT = {".md", ".txt", ".json", ".yaml", ".yml", ".toml", ".js", ".mjs", ".cjs", ".ts",
            ".tsx", ".jsx", ".py", ".sh", ".bash", ".zsh", ".ps1", ".html", ".css", ".rb", ".go"}
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}
MAX_BYTES = 2_000_000

HIDDEN = re.compile("[​‌‍⁠﻿‪-‮⁦-⁩\U000e0000-\U000e007f]")

RULES = [
    # (severity, category, regex, applies_to)  applies_to: "md", "code", or "all"
    ("HIGH", "prompt-injection phrasing",
     r"(?i)ignore (all |any )?(previous|prior|above) (instructions|rules)|disregard (the |your )?(system|previous)|"
     r"do not (tell|inform|show) the user|without (asking|telling) the user|you are now in|developer mode|"
     r"override (your|the) (rules|instructions|guidelines)", "all"),
    ("MEDIUM", "HTML comment in markdown (invisible when rendered)", r"<!--[\s\S]{0,400}?-->", "md"),
    ("HIGH", "sensitive path or secret access",
     r"~/\.ssh|/\.ssh/|id_rsa|id_ed25519|~/\.aws|/\.aws/credentials|(?<![\w.])\.env\b|Keychain|security find-generic-password|"
     r"ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|gh auth token", "all"),
    ("HIGH", "agent or shell config change",
     r"\.claude/settings(\.local)?\.json|enableAllProjectMcpServers|ANTHROPIC_BASE_URL|dangerously-skip-permissions|dangerously-bypass|"
     r"bypassPermissions|\.zshrc|\.bashrc|\.bash_profile|crontab|launchctl|LaunchAgents", "all"),
    ("HIGH", "pipe to shell", r"(curl|wget)[^\n|]*\|\s*(ba|z)?sh\b", "all"),
    ("MEDIUM", "code execution",
     r"child_process|\bexecSync\b|(?<![.\w])exec\(|\bspawn(Sync)?\(|(?<![.\w])eval\(|new Function\(|\bsubprocess\.|os\.system\(|shell=True", "code"),
    ("MEDIUM", "network call",
     r"\bfetch\(|XMLHttpRequest|WebSocket\(|\baxios\b|https?\.request\(|\brequests\.(get|post|put)|urllib\.request|"
     r"\b(curl|wget|nc|ncat|scp|ssh)\s", "all"),
    ("MEDIUM", "destructive file operation", r"rm -rf|\brmSync\(|shutil\.rmtree|fs\.rm\(|unlinkSync\(", "all"),
    ("MEDIUM", "large encoded blob", r"(base64,|atob\(|b64decode)|[A-Za-z0-9+/]{300,}={0,2}", "all"),
]
URL = re.compile(r"https?://([A-Za-z0-9.-]+)")


def kind_of(path):
    return "md" if path.suffix.lower() in {".md", ".txt"} else "code"


def scan(root):
    root = Path(root).expanduser()
    findings, domains, files_scanned = [], {}, 0
    paths = [root] if root.is_file() else []
    if root.is_dir():
        for dp, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                paths.append(Path(dp) / f)
    for p in paths:
        if p.suffix.lower() not in TEXT_EXT and p.name != "package.json":
            continue
        try:
            if p.stat().st_size > MAX_BYTES:
                findings.append(("INFO", "file too large to scan", str(p), 0, ""))
                continue
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            findings.append(("INFO", f"unreadable: {e}", str(p), 0, ""))
            continue
        files_scanned += 1
        rel = str(p.relative_to(root)) if root.is_dir() else str(p)
        lines = text.splitlines()
        for i, line in enumerate(lines, 1):
            if HIDDEN.search(line):
                cps = sorted({f"U+{ord(c):04X}" for c in HIDDEN.findall(line)})
                findings.append(("HIGH", "hidden unicode " + ",".join(cps), rel, i, line.strip()[:120]))
            for m in URL.finditer(line):
                domains.setdefault(m.group(1).lower(), set()).add(rel)
        k = kind_of(p)
        for sev, cat, rx, applies in RULES:
            if applies != "all" and applies != k:
                continue
            for m in re.finditer(rx, text):
                ln = text.count("\n", 0, m.start()) + 1
                snippet = lines[ln - 1].strip()[:120] if ln - 1 < len(lines) else ""
                findings.append((sev, cat, rel, ln, snippet))
        if p.name == "package.json":
            try:
                scripts = json.loads(text).get("scripts", {}) or {}
            except (ValueError, AttributeError):
                scripts = {}
            for hook in ("preinstall", "install", "postinstall", "prepare"):
                if hook in scripts:
                    findings.append(("HIGH", f"npm lifecycle script '{hook}' runs on install", rel, 0, str(scripts[hook])[:120]))
    return files_scanned, findings, {d: sorted(v) for d, v in sorted(domains.items())}


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 2
    as_json = "--json" in argv
    target = [a for a in argv if a != "--json"][0]
    n, findings, domains = scan(target)
    order = {"HIGH": 0, "MEDIUM": 1, "INFO": 2}
    findings.sort(key=lambda f: (order[f[0]], f[1], f[2], f[3]))
    if as_json:
        print(json.dumps({"target": target, "files_scanned": n,
                          "findings": [dict(zip(("severity", "category", "file", "line", "snippet"), f)) for f in findings],
                          "domains": domains}, indent=2))
    else:
        print(f"Scanned {n} files under {target}")
        counts = {s: sum(1 for f in findings if f[0] == s) for s in order}
        print(f"HIGH: {counts['HIGH']}  MEDIUM: {counts['MEDIUM']}  INFO: {counts['INFO']}\n")
        by_cat = {}
        for f in findings:
            by_cat.setdefault((f[0], f[1]), []).append(f)
        for (sev, cat), items in by_cat.items():
            print(f"[{sev}] {cat}: {len(items)}")
            for f in items[:15]:
                loc = f"{f[2]}:{f[3]}" if f[3] else f[2]
                print(f"    {loc}  {f[4]}")
            if len(items) > 15:
                print(f"    ... {len(items) - 15} more (use --json for all)")
        print("\nDomains referenced:")
        for d, files in domains.items():
            print(f"    {d}  ({len(files)} files)")
    return 1 if any(f[0] == "HIGH" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
