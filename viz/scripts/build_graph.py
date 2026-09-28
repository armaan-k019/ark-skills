#!/usr/bin/env python3
"""Build viz/data/graph.json from the files in this repo.

Standard library only. Every value in the output is read from a file; a field
that cannot be derived from a file is omitted. The rules are documented in
viz/README.md.

Usage:
    python3 viz/scripts/build_graph.py [--root PATH] [--out PATH]
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

SKILL_FILENAME = "SKILL.md"
HOOK_SETTINGS = Path("hooks") / "settings.example.json"
LICENSE_NOTICE = Path("licenses") / "ECC-LICENSE"

BLOCK_SCALAR = {">", "|", ">-", "|-", ">+", "|+"}
ORIGIN_MD = re.compile(r"^(Adapted from|Vendored from|Written for this repo)\b")
ORIGIN_JS = re.compile(r"^\s*//\s*((?:Adapted from|Idea from)\b.*)$")
LICENSE_TOKEN = re.compile(r"\b(MIT|Apache(?: License)?[ -]2\.0|BSD-\d-Clause|GPL-\d(?:\.\d)?)\b")
EVAL_SCORE = re.compile(
    r"\b(?:pass rate|scored|score)\b\s*(?:[:=]|of|was|is)?\s*(\d+(?:\.\d+)?\s*(?:/\s*\d+|%))",
    re.IGNORECASE,
)
FENCE = re.compile(r"^ {0,3}(```|~~~)")
BOLD_BULLET = re.compile(r"^- ((?:\*\*[^*]+\*\*(?:,\s*)?)+)")
BOLD_NAME = re.compile(r"\*\*([^*]+)\*\*")
HEADING = re.compile(r"^(#{2,3})\s+(.*?)\s*$")
HOOK_REF = re.compile(r"hooks/([A-Za-z0-9_.-]+)")
SCRIPT_SUFFIXES = {".js", ".mjs", ".cjs", ".sh", ".py"}
# Scripts in hooks/ that are support code, not hooks: the shared input helper and the test runner.
NON_HOOK_SCRIPTS = {"_input.js", "test-hooks.js"}


class GraphError(Exception):
    """A problem that makes the graph wrong; the script exits non-zero."""


def read(path):
    """Read a text file; utf-8-sig drops a leading BOM so frontmatter still parses."""
    return path.read_text(encoding="utf-8-sig")


def token_pattern(name):
    """Match `name` as a whole token: not inside a longer name-like token.

    A hyphen followed by a letter or digit continues the token, so
    "ponytail" does not match inside "ponytail-review".
    """
    return re.compile(
        r"(?<![A-Za-z0-9_-])" + re.escape(name) + r"(?![A-Za-z0-9_])(?!-[A-Za-z0-9])"
    )


def _unquote(value):
    if len(value) >= 2 and value[0] == value[-1] == '"':
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value[1:-1]
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1].replace("''", "'")
    return value


def parse_frontmatter(text):
    """Return (fields, body_start) for a file that may open with YAML frontmatter.

    body_start is the 0-based index of the first line after the closing ---.
    Only the subset of YAML used by SKILL.md files is understood: plain,
    quoted, and block (> or |) scalars. Other values are skipped.
    """
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, 0
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        raise GraphError("frontmatter opens with --- but never closes")

    fields = {}
    i = 1
    while i < end:
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", lines[i])
        if not match:
            i += 1
            continue
        key, value = match.group(1), match.group(2).strip()
        cont = []
        j = i + 1
        while j < end and (lines[j].startswith((" ", "\t")) or not lines[j].strip()):
            cont.append(lines[j])
            j += 1
        if value in BLOCK_SCALAR:
            if value.startswith("|"):
                stripped = [c for c in cont if c.strip()]
                indent = min((len(c) - len(c.lstrip()) for c in stripped), default=0)
                fields[key] = "\n".join(c[indent:] for c in cont).strip()
            else:
                paragraphs, current = [], []
                for c in cont:
                    if c.strip():
                        current.append(c.strip())
                    elif current:
                        paragraphs.append(" ".join(current))
                        current = []
                if current:
                    paragraphs.append(" ".join(current))
                fields[key] = "\n".join(paragraphs)
        elif value:
            extra = " ".join(c.strip() for c in cont if c.strip())
            fields[key] = _unquote((value + " " + extra).strip() if extra else value)
        i = j
    return fields, end + 1


def find_origin(lines, start, pattern):
    """First line at or after `start` that states an origin, with any license token."""
    for idx in range(start, len(lines)):
        match = pattern.match(lines[idx])
        if match:
            text = (match.group(1) if pattern is ORIGIN_JS else lines[idx]).strip()
            origin = {"from": "body", "text": text, "line": idx + 1}
            lic = LICENSE_TOKEN.search(text)
            if lic:
                origin["license"] = lic.group(1)
            return origin
    return None


def find_eval(lines, start):
    """First score statement outside fenced code, as 'measured: <score>'."""
    in_fence = False
    for idx in range(start, len(lines)):
        if FENCE.match(lines[idx]):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        match = EVAL_SCORE.search(lines[idx])
        if match:
            score = re.sub(r"\s+", "", match.group(1))
            return f"measured: {score}", idx + 1
    return "unmeasured", None


def parse_license_notice(root):
    """Map each entry listed in licenses/ECC-LICENSE to its line and license."""
    path = root / LICENSE_NOTICE
    if not path.exists():
        return {}
    lines = read(path).split("\n")
    license_name = None
    for line in lines:
        match = re.match(r"^(MIT|Apache) License\b", line.strip())
        if match:
            license_name = match.group(1)
            break
    entries = {}
    for idx, line in enumerate(lines):
        if not line.startswith("- "):
            continue
        head = line[2:].split(" (", 1)[0]
        for entry in (e.strip() for e in head.split(",")):
            if entry:
                notice = {"file": LICENSE_NOTICE.as_posix(), "line": idx + 1, "text": line.strip()}
                if license_name:
                    notice["license"] = license_name
                entries[entry] = notice
    return entries


def parse_readme_families(root):
    """Map a bold bullet name in README.md to (heading label, heading line)."""
    path = root / "README.md"
    if not path.exists():
        return {}
    families = {}
    heading = None
    for idx, line in enumerate(read(path).split("\n")):
        match = HEADING.match(line)
        if match:
            heading = (match.group(2).replace("`", ""), idx + 1)
            continue
        match = BOLD_BULLET.match(line)
        if match and heading:
            for name in BOLD_NAME.findall(match.group(1)):
                families.setdefault(name.strip(), heading)
    return families


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def walk_files(top, root, name=None):
    """Files under `top` from directory listings (real on-disk names, exact case).

    Skips only the repo's top-level .git, like `find . -not -path "./.git/*"`.
    Path.rglob is not used: on a case-insensitive filesystem a literal pattern
    such as "SKILL.md" also matches "skill.md".
    """
    found = []
    for dirpath, dirnames, filenames in os.walk(top):
        if Path(dirpath) == root and ".git" in dirnames:
            dirnames.remove(".git")
        found.extend(Path(dirpath) / f for f in filenames if name is None or f == name)
    return sorted(found)


def discover_skills(root, skill_filename):
    return walk_files(root, root, skill_filename)


def discover_agents(root):
    agent_dir = root / "agents"
    return walk_files(agent_dir, root) if agent_dir.is_dir() else []


def independent_node_count(root, skill_filename):
    """Recount the node sources a second way, mirroring the acceptance commands.

    Uses pathlib iteration where discovery uses os.walk. Skills: files whose real
    name is exactly `skill_filename`, outside the top-level .git (like
    `find . -name SKILL.md -not -path "./.git/*"`). Agents: every file under
    agents/, recursively (like `find agents -type f`). Hooks: distinct
    hooks/<file> references in the raw settings text, not the parsed JSON, so a
    registration the JSON walk skips makes the counts differ.
    """
    def files(top):
        stack, out = [top], []
        while stack:
            for entry in stack.pop().iterdir():
                if entry.is_dir() and not entry.is_symlink():
                    if not (entry.parent == root and entry.name == ".git"):
                        stack.append(entry)
                elif not entry.is_dir():
                    out.append(entry)
        return out

    skills = sum(1 for p in files(root) if p.name == skill_filename)
    agent_dir = root / "agents"
    agents = len(files(agent_dir)) if agent_dir.is_dir() else 0
    hooks = len(set(HOOK_REF.findall(read(root / HOOK_SETTINGS))))
    return skills + agents + hooks


def registered_hooks(root):
    """Hook scripts registered in hooks/settings.example.json, with coverage.

    Any shape other than {"hooks": {event: [{"matcher"?, "hooks": [{"command"}]}]}},
    or a command that names no script under hooks/, is an error.
    """
    path = root / HOOK_SETTINGS
    where = HOOK_SETTINGS.as_posix()
    if not path.exists():
        raise GraphError(f"{where} not found")
    text = read(path)
    try:
        settings = json.loads(text)
    except json.JSONDecodeError as err:
        raise GraphError(f"{where} is not valid JSON: {err}") from err
    events = settings.get("hooks") if isinstance(settings, dict) else None
    if not isinstance(events, dict) or not events:
        raise GraphError(f'{where}: expected a non-empty "hooks" object')
    lines = text.split("\n")
    hooks = {}
    for event, groups in events.items():
        if not isinstance(groups, list):
            raise GraphError(f"{where}: hooks.{event} must be a list")
        for group in groups:
            if not isinstance(group, dict) or not isinstance(group.get("hooks"), list):
                raise GraphError(f'{where}: each hooks.{event} entry needs a "hooks" list')
            for hook in group["hooks"]:
                command = hook.get("command") if isinstance(hook, dict) else None
                if not isinstance(command, str):
                    raise GraphError(f"{where}: a hooks.{event} entry has no command string")
                match = HOOK_REF.search(command)
                if not match:
                    raise GraphError(f"{where}: command names no script under hooks/: {command}")
                filename = match.group(1)
                line_no = next(
                    (i + 1 for i, l in enumerate(lines) if f"hooks/{filename}" in l), None
                )
                entry = {"event": event, "file": HOOK_SETTINGS.as_posix()}
                if group.get("matcher") is not None:
                    entry["matcher"] = group["matcher"]
                if line_no:
                    entry["line"] = line_no
                hooks.setdefault(filename, []).append(entry)
    return hooks


def build_graph(root, skill_filename=SKILL_FILENAME):
    root = Path(root).resolve()
    notices = parse_license_notice(root)
    readme = parse_readme_families(root)
    families = {}
    nodes = []
    sources = {}  # node id -> (lines, body_start, kind)

    def add_family(fid, label, rule, file=None, line=None):
        if fid not in families:
            fam = {"id": fid, "label": label, "rule": rule}
            if file:
                fam["file"] = file
            if line:
                fam["line"] = line
            families[fid] = fam
        return fid

    def family_for(key, rel_path, suite=None):
        if suite is not None:
            return add_family(f"suite:{suite}", suite, "suite-directory", file=suite)
        if key in readme:
            label, line = readme[key]
            return add_family(f"readme:{slug(label)}", label, "readme-section", "README.md", line)
        top = rel_path.parts[0]
        return add_family(f"dir:{top}", top, "top-level-directory", file=top)

    # Skills
    skill_files = discover_skills(root, skill_filename)
    parents = {}
    for path in skill_files:
        parents.setdefault(path.parent.parent, []).append(path)
    for path in skill_files:
        rel = path.relative_to(root)
        text = read(path)
        try:
            fields, body_start = parse_frontmatter(text)
        except GraphError as err:
            raise GraphError(f"{rel.as_posix()}: {err}") from err
        if body_start == 0:
            raise GraphError(f"{rel.as_posix()}: no frontmatter; a skill needs a name")
        name = fields.get("name")
        if not name:
            raise GraphError(f"{rel.as_posix()}: frontmatter has no name")
        lines = text.split("\n")
        suite_dir = path.parent.parent
        suite = None
        if suite_dir != root and len(parents.get(suite_dir, [])) >= 2:
            suite = suite_dir.relative_to(root).as_posix()
        node = {
            "id": f"skill:{name}",
            "kind": "skill",
            "name": name,
            "path": rel.as_posix(),
            "lines": len(text.splitlines()),
        }
        if fields.get("description"):
            node["description"] = fields["description"]
        node["family"] = family_for(name, rel, suite)
        origin = find_origin(lines, body_start, ORIGIN_MD)
        if fields.get("license"):
            if origin is None:
                origin = {"from": "frontmatter", "license": fields["license"]}
            else:
                origin.setdefault("license", fields["license"])
        if origin:
            node["origin"] = origin
        notice = notices.get(name)
        if notice:
            node["license_notice"] = notice
        status, eval_line = find_eval(lines, body_start)
        node["eval_status"] = status
        if eval_line:
            node["eval_line"] = eval_line
        nodes.append(node)
        sources[node["id"]] = (lines, body_start, "skill")

    # Agents: every file in agents/
    agent_files = discover_agents(root)
    for path in agent_files:
        rel = path.relative_to(root)
        text = read(path)
        try:
            fields, body_start = parse_frontmatter(text)
        except GraphError as err:
            raise GraphError(f"{rel.as_posix()}: {err}") from err
        lines = text.split("\n")
        name = fields.get("name")
        node = {
            "id": f"agent:{name or path.stem}",
            "kind": "agent",
            "path": rel.as_posix(),
            "lines": len(text.splitlines()),
        }
        if name:
            node["name"] = name
        if fields.get("description"):
            node["description"] = fields["description"]
        node["family"] = family_for(name or path.stem, rel)
        origin = find_origin(lines, body_start, ORIGIN_MD)
        if origin:
            node["origin"] = origin
        notice = notices.get(rel.as_posix())
        if notice:
            node["license_notice"] = notice
        nodes.append(node)
        sources[node["id"]] = (lines, body_start, "agent")

    # Hooks: scripts registered in hooks/settings.example.json
    hooks = registered_hooks(root)
    hook_dir = root / "hooks"
    if hook_dir.is_dir():
        unregistered = sorted(
            p.name for p in hook_dir.iterdir()
            if p.is_file() and p.suffix in SCRIPT_SUFFIXES and p.name not in hooks
            and p.name not in NON_HOOK_SCRIPTS
        )
        if unregistered:
            print(
                "build_graph: warning: scripts in hooks/ not registered in "
                f"{HOOK_SETTINGS.as_posix()}, so not graphed: {', '.join(unregistered)}",
                file=sys.stderr,
            )
    hook_names = {}
    for filename in sorted(hooks):
        path = root / "hooks" / filename
        if not path.is_file():
            raise GraphError(f"hook registered in {HOOK_SETTINGS.as_posix()} not found: hooks/{filename}")
        rel = path.relative_to(root)
        text = read(path)
        lines = text.split("\n")
        stem = path.stem
        node = {
            "id": f"hook:{stem}",
            "kind": "hook",
            "name": stem,
            "path": rel.as_posix(),
            "lines": len(text.splitlines()),
            "family": family_for(filename, rel),
            "coverage": hooks[filename],
        }
        origin = find_origin(lines, 0, ORIGIN_JS)
        if origin:
            node["origin"] = origin
        notice = notices.get(rel.as_posix())
        if notice:
            node["license_notice"] = notice
        nodes.append(node)
        hook_names[stem] = node["id"]

    # Unique ids and unique skill names, or references are ambiguous
    ids = [n["id"] for n in nodes]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        raise GraphError(f"duplicate node ids: {', '.join(dupes)}")
    skill_names = {n["name"]: n["id"] for n in nodes if n["kind"] == "skill"}

    # Edges: a body naming another node, one edge per (source, target, kind)
    targets = {
        "skill": [("defer", skill_names), ("names-hook", hook_names)],
        "agent": [("agent-names-skill", skill_names)],
    }
    patterns = {name: token_pattern(name) for name in list(skill_names) + list(hook_names)}
    edges = []
    for node in nodes:
        if node["id"] not in sources:
            continue
        lines, body_start, kind = sources[node["id"]]
        for edge_kind, names in targets[kind]:
            for name, target in sorted(names.items()):
                if target == node["id"]:
                    continue
                hits = [
                    idx + 1
                    for idx in range(body_start, len(lines))
                    if patterns[name].search(lines[idx])
                ]
                if hits:
                    edges.append({
                        "id": f"{node['id']}->{target}:{edge_kind}",
                        "source": node["id"],
                        "target": target,
                        "kind": edge_kind,
                        "file": node["path"],
                        "line": hits[0],
                        "lines": hits,
                    })

    used = {n["family"] for n in nodes}
    graph = {
        "schema_version": 1,
        "generated_by": "viz/scripts/build_graph.py",
        "families": [families[f] for f in sorted(used)],
        "nodes": nodes,
        "edges": edges,
    }
    validate(graph, expected_nodes=independent_node_count(root, skill_filename))
    return graph


def validate(graph, expected_nodes=None):
    """Raise GraphError unless every edge endpoint and node family exists."""
    ids = {n["id"] for n in graph["nodes"]}
    missing = [
        e["id"] for e in graph["edges"] if e["source"] not in ids or e["target"] not in ids
    ]
    if missing:
        raise GraphError(f"edge endpoints missing from nodes: {', '.join(missing)}")
    family_ids = {f["id"] for f in graph["families"]}
    orphans = [n["id"] for n in graph["nodes"] if n.get("family") not in family_ids]
    if orphans:
        raise GraphError(f"nodes with unknown family: {', '.join(orphans)}")
    if expected_nodes is not None and len(graph["nodes"]) != expected_nodes:
        raise GraphError(f"node count {len(graph['nodes'])} != {expected_nodes} discovered files")


def main(argv=None):
    here = Path(__file__).resolve().parent
    default_root = here.parent.parent
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=default_root)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args(argv)
    out = args.out or (args.root / "viz" / "data" / "graph.json")
    try:
        graph = build_graph(args.root)
    except (GraphError, OSError, UnicodeDecodeError) as err:
        print(f"build_graph: error: {err}", file=sys.stderr)
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(graph, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    kinds = {}
    for node in graph["nodes"]:
        kinds[node["kind"]] = kinds.get(node["kind"], 0) + 1
    edge_kinds = {}
    for edge in graph["edges"]:
        edge_kinds[edge["kind"]] = edge_kinds.get(edge["kind"], 0) + 1
    print(
        f"wrote {out}: {len(graph['nodes'])} nodes {dict(sorted(kinds.items()))}, "
        f"{len(graph['edges'])} edges {dict(sorted(edge_kinds.items()))}, "
        f"{len(graph['families'])} families"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
