#!/usr/bin/env python3
"""Inventory Claude Code skills and agents and estimate their context cost.

Usage:
  python3 inventory.py [PATH ...] [--json]

Each PATH may be a skills directory, an agents directory, a repo containing
skills, or a single CLAUDE.md. Defaults to ~/.claude/skills, ~/.claude/agents,
~/.claude/CLAUDE.md, and ./.claude/skills if they exist.

Token figures are estimates (words x 1.3), not tokenizer counts.
Standard library only.
"""
import json
import os
import re
import sys
from pathlib import Path

SKILL_BODY_LINE_LIMIT = 500      # skill-creator guidance: keep SKILL.md under 500 lines
DESCRIPTION_CHAR_LIMIT = 1024    # frontmatter spec limit enforced by quick_validate.py
AGENT_DESC_WORD_FLAG = 60        # agent descriptions are always loaded; long ones cost every session
CLAUDE_MD_LINE_FLAG = 300


def est_tokens(text):
    return int(round(len(text.split()) * 1.3))


def frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    out, key = {}, None
    for line in m.group(1).splitlines():
        km = re.match(r"^([A-Za-z_-]+):\s*(.*)$", line)
        if km:
            key = km.group(1)
            out[key] = km.group(2).strip().strip('"').strip("'")
        elif key and line.startswith((" ", "\t")):
            out[key] = (out[key] + " " + line.strip()).strip()
    return out


def describe(path, kind):
    real = path.resolve()
    rec = {"kind": kind, "path": str(path), "flags": []}
    if path.is_symlink():
        rec["symlink_to"] = os.readlink(path)
        if not real.exists():
            rec["flags"].append("broken symlink")
            return rec
    text = real.read_text(encoding="utf-8", errors="replace")
    fm = frontmatter(text)
    desc = fm.get("description", "")
    rec.update(
        name=fm.get("name", path.parent.name if kind == "skill" else path.stem),
        lines=text.count("\n") + 1,
        est_tokens=est_tokens(text),
        desc_chars=len(desc),
        desc_words=len(desc.split()),
        desc_est_tokens=est_tokens(desc),
    )
    if not fm:
        rec["flags"].append("no frontmatter")
    if not desc:
        rec["flags"].append("no description")
    if len(desc) > DESCRIPTION_CHAR_LIMIT:
        rec["flags"].append(f"description > {DESCRIPTION_CHAR_LIMIT} chars")
    if kind == "skill" and rec["lines"] > SKILL_BODY_LINE_LIMIT:
        rec["flags"].append(f"SKILL.md > {SKILL_BODY_LINE_LIMIT} lines")
    if kind == "agent" and rec["desc_words"] > AGENT_DESC_WORD_FLAG:
        rec["flags"].append(f"agent description > {AGENT_DESC_WORD_FLAG} words")
    if kind == "claude_md" and rec["lines"] > CLAUDE_MD_LINE_FLAG:
        rec["flags"].append(f"CLAUDE.md > {CLAUDE_MD_LINE_FLAG} lines")
    return rec


def collect(target):
    target = Path(os.path.expanduser(target))
    found = []
    if target.is_file():
        if target.name == "SKILL.md":
            found.append(describe(target, "skill"))
        elif target.name == "CLAUDE.md":
            found.append(describe(target, "claude_md"))
        elif target.suffix == ".md":
            found.append(describe(target, "agent"))
        return found
    if not target.exists():
        return found
    is_agents_dir = target.name == "agents"
    for root, dirs, files in os.walk(target, followlinks=True):
        rel_depth = len(Path(root).relative_to(target).parts)
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "__pycache__")]
        if rel_depth >= 4:
            dirs[:] = []
        p = Path(root)
        if "SKILL.md" in files:
            found.append(describe(p / "SKILL.md", "skill"))
        elif (is_agents_dir or p.name == "agents") and rel_depth <= 1 and p.parent.name != "skill-creator":
            for f in sorted(files):
                if f.endswith(".md") and f.lower() != "readme.md":
                    found.append(describe(p / f, "agent"))
    # broken symlinks are not followed by os.walk; list them explicitly
    for entry in target.iterdir():
        if entry.is_symlink() and not entry.resolve().exists():
            found.append({"kind": "unknown", "path": str(entry), "symlink_to": os.readlink(entry), "flags": ["broken symlink"]})
    return found


def main(argv):
    as_json = "--json" in argv
    paths = [a for a in argv if a != "--json"]
    if not paths:
        paths = [p for p in ["~/.claude/skills", "~/.claude/agents", "~/.claude/CLAUDE.md", "./.claude/skills", "./CLAUDE.md"]
                 if Path(os.path.expanduser(p)).exists()]
    records = []
    for p in paths:
        records.extend(collect(p))

    names = {}
    for r in records:
        if "name" in r:
            names.setdefault((r["kind"], r["name"]), []).append(r["path"])
    for (kind, name), where in names.items():
        if len(where) > 1:
            for r in records:
                if r.get("name") == name and r["kind"] == kind:
                    r["flags"].append(f"duplicate name ({len(where)} copies)")

    if as_json:
        print(json.dumps({"scanned": paths, "items": records}, indent=2))
        return 0

    print("Scanned: " + ", ".join(paths))
    print()
    print("| Kind | Name | Lines | Est. tokens (body) | Desc words | Flags | Path |")
    print("|---|---|---:|---:|---:|---|---|")
    for r in sorted(records, key=lambda r: (r["kind"], -r.get("est_tokens", 0))):
        print(f"| {r['kind']} | {r.get('name','?')} | {r.get('lines','')} | {r.get('est_tokens','')} | "
              f"{r.get('desc_words','')} | {'; '.join(r['flags']) or ''} | {r['path']} |")
    skills = [r for r in records if r["kind"] == "skill" and "est_tokens" in r]
    agents = [r for r in records if r["kind"] == "agent" and "est_tokens" in r]
    print()
    print(f"Skills: {len(skills)}; always-loaded description cost ~{sum(r['desc_est_tokens'] for r in skills)} tokens; "
          f"full bodies if all loaded ~{sum(r['est_tokens'] for r in skills)} tokens")
    print(f"Agents: {len(agents)}; description cost ~{sum(r['desc_est_tokens'] for r in agents)} tokens")
    flagged = [r for r in records if r["flags"]]
    print(f"Flagged items: {len(flagged)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
