# viz: skills graph

A static page that shows every skill, agent, and hook in this repo as a node, clustered by family, with the references between them. The data in `data/graph.json` is generated from the files by `scripts/build_graph.py` and is never edited by hand.

- Regenerate the data: `python3 viz/scripts/build_graph.py` (from the repo root; standard library only).
- Run the extractor tests: `python3 -m unittest discover viz/scripts`.

## graph.json

```
schema_version  1
generated_by    "viz/scripts/build_graph.py"
families[]      id, label, rule, file, line (line only for README sections)
nodes[]         id, kind (skill | agent | hook), name, description, path, lines, family,
                origin, license_notice, eval_status, eval_line (skills), coverage (hooks)
edges[]         id, source, target, kind (defer | names-hook | agent-names-skill),
                file, line, lines
```

A field that cannot be derived from a file is omitted, never filled with a guess.

## Rules

### Which files are nodes

- **Skill:** every file named exactly `SKILL.md` (case-sensitive, read from directory listings) under the repo root, outside the top-level `.git/`. This is the same set as `find . -name SKILL.md -not -path "./.git/*"`. A skill must have frontmatter with a `name`; a SKILL.md without one fails the build, because its incoming edges would otherwise vanish without notice.
- **Agent:** every file under `agents/`, recursively (the same set as `find agents -type f`). An agent without a frontmatter `name` uses its file name.
- **Hook:** every script registered in `hooks/settings.example.json`, whatever its extension. `hooks/_input.js` (a shared helper) and `hooks/test-hooks.js` (the test runner) are not registered, so they are not nodes. Any other script in `hooks/` that is not registered is named in a warning on stderr and not graphed. A settings file that is not `{"hooks": {event: [{"matcher", "hooks": [{"command"}]}]}}`, or a command that names no script under `hooks/`, fails the build.
- The script recounts skills, agents, and hooks a second way (a different directory traversal, and hook references counted in the raw settings text rather than the parsed JSON) and fails if the node count differs.

### Node fields

Files are read as UTF-8; a leading byte-order mark is ignored.

- **name, description:** the frontmatter fields of the same names. Plain, quoted, and block (`>` or `|`) scalars are read.
- **lines:** the number of lines as Python's `str.splitlines()` counts them. This is one more than `wc -l` when a file has no trailing newline (for example `impeccable/SKILL.md`).
- **family**, first rule that applies:
  1. `suite-directory`: the skill sits at `<dir>/<name>/SKILL.md` and `<dir>` holds two or more skills (today only `ponytail/skills`).
  2. `readme-section`: README.md has a bullet that opens with the node's name in bold (`**name**`, or `**file.js**` for a hook). The family is the nearest `##` or `###` heading above it.
  3. `top-level-directory`: the node's top-level directory. No node uses this today.
- **origin:** the first body line that starts with "Adapted from", "Vendored from", or "Written for this repo" (hooks: a `// Adapted from` or `// Idea from` comment). `license` is the first license name in that line, matched as `MIT`, `Apache 2.0` (or `Apache License 2.0`), `BSD-<n>-Clause`, or `GPL-<n>`. If there is no such line but the frontmatter has a `license` field, origin is `{"from": "frontmatter", "license": ...}`. Otherwise it is omitted.
- **license_notice:** the line in `licenses/ECC-LICENSE` that lists the node by skill name or by path, with the license named in that file.
- **eval_status** (skills only): `measured: <score>` when a body line outside fenced code states a pass rate or score written as `N/M` or `N%`, for example "pass rate 8/8" or "scored 92%". Otherwise `unmeasured`. "Each criterion is scored 1 to 10" does not match, because "1 to 10" is not written as `N/M` or `N%`; a scoring instruction that is written that way ("scored 7/10 when it meets the bar") would match, so the rule is a heuristic. Today every skill is `unmeasured`. `ponytail-gain` quotes published benchmark medians for `ponytail`, but those are figures about another skill and are not written as a pass rate or score, so neither node is marked measured.
- **coverage** (hooks): the event and tool matcher each hook is registered for in `hooks/settings.example.json`.

### Edges

- **defer** (skill to skill): the body of one SKILL.md names another skill.
- **names-hook** (skill to hook): a skill body names a hook file, by its stem (`no-em-dash`) or file name (`no-em-dash.js`).
- **agent-names-skill** (agent to skill): an agent body names a skill. None exist today.

"Names" means, for all three kinds:

- Body only. Frontmatter is excluded, so a name in a description does not count.
- An exact, case-sensitive whole-token match. The name must not be preceded by a letter, digit, `_`, or `-`, and must not be followed by a letter, digit, `_`, or a `-` that continues the token.
- A node never has an edge to itself.
- There is one edge per (source, target, kind). `line` is the first match, and `lines` lists every matching line in the source file.

False positives excluded by this rule:

- A name inside a longer hyphenated token: `ponytail-review` does not create an edge to `ponytail`.
- A different case: a capitalized word such as "Impeccable" at the start of a sentence does not name the `impeccable` skill.

Known limits:

- `lines` lists every token match, so it can include a line where the name is followed by a space and another word. For example, the "ponytail gain" scoreboard header on `ponytail-gain` line 27 is listed as evidence for the edge to `ponytail`. That edge also has prose evidence on lines 30, 32, 33, and 50.
- Skill-to-agent references (`phased-build` names `ts-reviewer` and `silent-failure-hunter`) and agent-to-agent references (`ts-reviewer` names `silent-failure-hunter`) are not emitted, because the specification lists only the three kinds above.

### Em dashes

`graph.json` is written with ASCII escapes. Two source descriptions (`recruiter-demo-writer`, `scroll-world`) contain em dashes; the file stores them as `\u2014` escapes, so it contains no literal em dash. The page shows the source text as written.
