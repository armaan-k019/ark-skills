# Progress: skills-graph
Updated: 2026-09-28 21:04 EDT (from `date`)   Branch: feat/skills-graph (from origin/main cd423eb, upstream unset, not pushed)   Last commit: 5a99a26 (F2, F3), before the review-fix commit

Every time in this file comes from `date`.

## SPEC summary
Static page in viz/ that visualizes this repo: every skill, agent, and hook as a node, clustered by family, with reference edges, hook coverage, license origin, and eval status, all generated from files. Plus viz/MONITOR-EVAL.md, a vetted recommendation (no install) for a live Claude Code session monitor. Second round (author's message of 2026-09-28): Q6 recorded, F1 family taxonomy, F2 encoding, F3 legibility, one review pass over the whole branch with at most one fix round, then stop again for styling.

## Now
Phase 4: STOPPED again for the author. Styling is taste work and is the author's.

## Done and verified
- Phases 0 to 3 and 5: commits 5b6105f, f8964e8, 66af38b, e72dbb9, 3e4bddf, 0765695, 1114514 (see git log).
- Q6: docs/decisions/0002 records why the phase 1 count skips node_modules; commit 2579fdc. The fixture test that a node_modules SKILL.md is excluded already existed and fails on the pre-fix extractor.
- F1: viz/scripts/families.json, seven families; the build fails on an unmapped node, a stale name, a name listed twice, or a malformed or missing file; commit eafbee0. Each of the three family guards was removed in a mutant copy and its test failed.
- F2 and F3: kind colors (d3 category10 defaults), measured-eval outline, legend, labels below nodes at 17 px wrapping at hyphens, column choice fitted to the viewport, fit on load; commit 5a99a26.
- Clones deleted: /tmp/monitor-eval/ccboard, claude-agents-dashboard, agent-mission-control. The scan outputs and vetting reports that MONITOR-EVAL.md points to are still in /tmp/monitor-eval/.
- Timestamp line: branch docs/unattended-build-clock-times at b806f4a, one commit on origin/main, built with git plumbing (no checkout). Not pushed, no PR yet.
- Review pass over `git diff origin/main..HEAD` (dual: ts-reviewer and silent-failure-hunter roles, CRITICAL and HIGH only): both FAIL.
  - ts-reviewer HIGH: (1) edges were drawn straight through unrelated nodes (8 exact centre crossings), so the page showed references that do not exist, such as capture-lessons -> no-em-dash reading as block-no-verify -> no-em-dash; (2) the eval outline was never tested on a scored node (a selector typo passed everything).
  - silent-failure-hunter HIGH: (3) panel-check did not compare the origin's cited line or label, and checked hook coverage by substring; (4) only one family and one edge kind were exercised, so a closure bug in the edge-kind filter passed; (5) a hook registered under two events got the first line for both. It also found that the first scored skill would fail the smoke test on correct code, because the 4 px outline pushed the circle into the label margin.
  - Fix round (the one allowed): edges are bent around nodes they do not connect, checked against Cytoscape's drawn path; the measured label margin grows by the outline width; panel-check compares License origin, License notice, and Hook coverage as whole strings; smoke exercises every family and every edge kind by exact hidden sets plus a combined case, checks edge crossings with its own path sampling, and checks the outline on a copy of the data with one scored skill; each hook registration cites its own line (two-event fixture); checkGraph rejects duplicate ids and unknown kinds; the column-choice test is strict; stale fixture and README text corrected.
  - Evidence the fixes are real: the hook-line test fails on the reviewed extractor; the three reviewer panel mutants are caught by test_panel.cjs; five app.js mutants run through the browser smoke test were all caught (the reviewed app.js without routing; routing skipped but reported clean, caught by the independent crossing check; the edge-kind closure bug; the outline selector typo; the outline without the margin fix).
- Final runs, 2026-09-28 21:02:33 to 21:02:37 EDT:
  - Build: `python3 viz/scripts/build_graph.py` printed "30 nodes {'agent': 2, 'hook': 3, 'skill': 25}, 36 edges {'agent-agent': 1, 'skill-agent': 2, 'skill-hook': 2, 'skill-skill': 31}, 7 families", exit 0; graph.json unchanged by the rebuild.
  - Phase 1 count with the Q6 command: `find . -name SKILL.md -not -path "./.git/*" -not -path "*/node_modules/*"` = 25, agents 2, hooks 3, sum 30, graph 30: MATCH. Endpoints: 0 missing; validate() raised for an injected bad edge; json.load exit 0.
  - Phase 2: `python3 -m unittest discover viz/scripts`: Ran 52 tests, OK.
  - Page tests: `npm test` in viz/: 22 of 22 pass.
  - Repo hooks: `node hooks/test-hooks.js`: all 26 passed.
  - Phase 3: `node viz/scripts/smoke.mjs http://127.0.0.1:8123/` printed "OK: rendered 30 nodes and 36 edges (JSON 30 and 36), 7 families; clicked skill:phased-build, panel shows Outgoing (6) and Incoming (2); smallest label 12.2 px, 0 labels over circles, 0 label pairs overlapping each other; 0 edges over unconnected nodes (9 bent around them); filters exact for 7 families and 4 edge kinds; outline drawn on skill:adversarial-review in a scored copy", exit 0. viz/screenshot.png: 196388 bytes, opened and looked at.

## In flight
- none

## Open questions
- Styling (phase 4): the author's.
- The family mapping in viz/scripts/families.json is a judgment call (for example ponytail-review and ponytail-audit under review-and-honesty, honest-refusal under review-and-honesty, vet-third-party and capture-lessons under skill-management). The author may want to move entries.
- No node has a measured eval today: no SKILL.md states a pass rate or score in its own text, so the outline shows nowhere on the real data. It is proved on a scored copy in the smoke test.
- Push and PR for docs/unattended-build-clock-times: waiting, because the author's message said not to push yet.
- Q5 (for its own branch): vet-third-party/scripts/scan.py does not scan `.rs` files.

## Decisions
- Family taxonomy lives in viz/scripts/families.json; the extractor has no fallback family.
- Kind colors are the first three colors of d3's category10 scheme, a default for distinguishable categories, not a palette.
- Labels wrap at hyphens via zero-width spaces written as a JavaScript escape, so no invisible character is committed.
- An edge is bent only when its straight line would pass over a node it does not connect; the bend is chosen by trying growing offsets on alternate sides and re-reading Cytoscape's drawn control points.
- Earlier decisions (branch, hook definition, edge rules, em dashes in source descriptions, fixture filenames, Cytoscape, monitor recommendation) are unchanged; see git history of this file.

## Review nits recorded, not fixed (below the CRITICAL/HIGH floor)
- License origin reads only the SKILL.md body or frontmatter, so skill-creator, scroll-world, and the ponytail sub-skills show "not stated in the file" though a LICENSE file sits beside them (the rule the spec set).
- A frontmatter license is attached to a body origin line that does not state it (no case today).
- A non-UTF-8 file (for example a .DS_Store in agents/) fails the build without naming the file; the output write is not guarded.
- Edge lines and the merged-license case are covered only by the real-repo snapshot test.
- The skill/hook and agent/hook ambiguity pairs have no test; an agent whose file stem differs from its name is matched only by name.
- An indented `---` inside a block scalar closes frontmatter; duplicate JSON keys in families.json are last-wins; `_unquote` keeps malformed quoted scalars; license-notice entries on continuation lines or matching no node are dropped silently.
- The page reports render errors under "Could not load data/graph.json"; the legend's outline swatch is not compared with the drawn outline; label-to-label overlap is counted but not asserted; the smallest label is 12.2 px against a 12 px floor, so one more member in a family may trip it.
- Edges to ponytail include mentions of the plugin name in a config path and a URL (ponytail-help lines 53 and 71) and the `ponytail:` comment marker (ponytail-debt), consistent with the documented token rule.
- The vendored cytoscape.min.js contains a literal U+200B from upstream; a repo-wide hidden-Unicode scan would flag it.
- Two source descriptions (recruiter-demo-writer, scroll-world) contain em dashes, which the page displays as written (recorded decision; the author may choose otherwise).
- Earlier gate nits are in the git history of this file.

## Lessons
LESSONS.md at the repo root.

## Next action
Wait for the author: styling (phase 4), the family mapping, and whether to push docs/unattended-build-clock-times and open its PR. feat/skills-graph stays unpushed.
