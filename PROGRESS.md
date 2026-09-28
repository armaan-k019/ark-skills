# Progress: skills-graph
Updated: 2026-09-28 05:18 EDT (from `date`)   Branch: feat/skills-graph (from origin/main cd423eb, upstream unset so nothing pushes to main)   Last commit: 0765695 (phase 3)

Every time in this file comes from `date`. An earlier version said "03:52" and "03:50"; those were not clock readings (the clock read 03:22 shortly after) and were removed after review gate 1 flagged them.

## SPEC summary
Static page in viz/ that visualizes this repo: every skill, agent, and hook as a node, clustered by family, with defer/reference edges, hook coverage, license origin, and eval status, all generated from files. Plus viz/MONITOR-EVAL.md, a vetted recommendation (no install) for a live Claude Code session monitor. Phases: 0 setup, 1 extractor, 2 tests, 3 page (function only), 4 STOP for visual design, 5 monitor evaluation. Review gates after phases 1 and 3.

## Now
Phase 4: STOPPED for the author, as the SPEC requires. Visual design is taste work and is not done unattended.

## Done and verified
- Phase 0: STANDING-DECISIONS.md and PROGRESS.md, commit 5b6105f.
- Phase 1: extractor and graph.json, commit f8964e8. Review gate 1 (dual: ts-reviewer and silent-failure-hunter roles) found HIGH issues; one fix round; 14 regression tests each shown to fail on the reviewed code.
- Phase 2: tests and fixtures, commit 66af38b.
- Phase 5: viz/MONITOR-EVAL.md, commit e72dbb9. Clones in /tmp/monitor-eval/ at ccboard c1a36a0, claude-agents-dashboard 320f553, agent-mission-control 50a805a. Nothing installed, built, or run from them.
- Q3 change: edge kinds and skill-agent / agent-agent edges, plus skipping node_modules in skill discovery, commit 3e4bddf. The four new Q3 tests were run against the phase 1 extractor and all four failed there.
- Final acceptance runs, 2026-09-28 05:14:33 to 05:14:35 EDT:
  - Phase 1: `python3 viz/scripts/build_graph.py` printed "30 nodes {'agent': 2, 'hook': 3, 'skill': 25}, 36 edges {'agent-agent': 1, 'skill-agent': 2, 'skill-hook': 2, 'skill-skill': 31}, 5 families", exit 0. Endpoints: 0 edges with a missing endpoint; validate() raised for an injected bad edge. `json.load` exit 0.
  - Phase 1 node count as written: `find . -name SKILL.md -not -path "./.git/*"` = 28, agents 2, hooks 3, sum 33, graph 30: MISMATCH. The 3 extra files are playwright-core's bundled skills in viz/node_modules (see Q6).
  - Phase 1 node count with node_modules excluded (Q6): 25 + 2 + 3 = 30, graph 30: MATCH.
  - Phase 2: `python3 -m unittest discover viz/scripts` printed "Ran 46 tests" and "OK", exit 0. Pass count 46 of 46.
  - Phase 3: `python3 -m http.server 8123 --bind 127.0.0.1 --directory viz` served the page; `node viz/scripts/smoke.mjs http://127.0.0.1:8123/` printed "OK: rendered 30 nodes and 36 edges (JSON 30 and 36), 5 families; clicked skill:phased-build, panel shows Outgoing (6) and Incoming (2); wrote .../viz/screenshot.png", exit 0. The smoke test also checked that no two family boxes overlap, that each filter hides exactly its members and restores them, and every field and edge of the clicked node's panel against graph.json. viz/screenshot.png: 149223 bytes. The screenshot was opened and looked at: five separate family boxes, edges with arrows, phased-build selected, panel filled.
  - Page tests without a browser: `npm test` in viz/ (test_app.cjs, test_panel.cjs, test_layout.cjs): 15 of 15 pass. test_panel.cjs runs the real app.js against a fake DOM, taps all 30 nodes, and catches four mutants of app.js; test_layout.cjs runs the real layout in headless Cytoscape and exits on its own (cy.destroy()).
- Review gate 2 (dual, same roles, CRITICAL and HIGH only): both FAIL.
  - silent-failure-hunter HIGH: smoke.mjs could pass with a wrong license origin (label-only check), a missing path, a mislabelled eval status, or swapped edge ends.
  - ts-reviewer HIGH: the built-in cose layout let family boxes overlap (8 or 9 of 10 pairs in its headless simulation), so the page was not visibly clustered by family.
  - Fix round 1: panel-check.cjs (one panel contract, used by smoke.mjs and test_panel.cjs; the four mutants fail it); per-family grid layout (headless check: 0 overlapping family pairs, 0 nodes outside their own box); smoke checks for family-box overlap and both filters; blank favicon link (a favicon 404 could fail the smoke test on a console error); decision record no longer calls window.cy an exact rendered count. No second reviewer pass was run.
  - A bug found by the browser run, not the reviewers: the first smoke run failed on the edge-kind filter. Cause: the smoke test read Cytoscape's visibility before the next frame applied the class. The page itself was correct (checked in the browser: 31 edges hidden). The smoke test now waits up to 5 s for the expected counts.
- Phase 3: page, scripts, vendor, decision record, commit 0765695.
- verify-before-done on the final state, 2026-09-28 05:16:36 to 05:16:39 EDT:

```
VERIFICATION
Build:     PASS   python3 viz/scripts/build_graph.py (exit 0; graph.json unchanged by the rebuild)
Typecheck: NOT RUN (no tsconfig or type checker is configured; the code is plain JS and Python)
Lint:      NOT RUN (no lint config in the repo)
Tests:     PASS (46/46)   python3 -m unittest discover viz/scripts
           PASS (15/15)   npm test (in viz/: test_app.cjs, test_panel.cjs, test_layout.cjs)
           PASS (26/26)   node hooks/test-hooks.js (the repo's own hook tests)
           PASS           node viz/scripts/smoke.mjs http://127.0.0.1:8123/ (exit 0)
Diff:      38 files changed vs origin/main (37 committed, plus README.md); all inside SCOPE
           (viz/, docs/decisions/, PROGRESS.md, STANDING-DECISIONS.md, one README.md section,
           LESSONS.md); unrequested changes: none

Verdict:   NOT DONE
Open issues:
1. Phase 1 acceptance as written counts playwright-core's three SKILL.md files in
   viz/node_modules (33 vs the graph's 30). Decision needed on Q6.
2. Phase 4 (visual design) waits for the author by design.
```

- capture-lessons: 9 entries written to LESSONS.md (one seen twice, eight new); one promotion proposed, not applied (a line in unattended-build Step 2 about clock-stamped times).
- Playwright (Q1): `npm install --save-dev --save-exact --ignore-scripts --cache ./.npm-cache playwright@1.63.0` in viz/ with PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1. 1.63.0 was chosen because its browsers.json names Chromium revision 1243, the one already cached. The lockfile resolves two packages (playwright, playwright-core), both 1.63.0, Apache-2.0, from registry.npmjs.org, no install scripts.

## In flight
- none

## Open questions
- Q6 (new): adding Playwright under viz/ (Q1) put three SKILL.md files inside viz/node_modules (playwright-core's playwright-cli, playwright-component-testing, playwright-trace). The phase 1 acceptance command as written counts them, so it no longer matches the graph (33 vs 30). The extractor skips node_modules, because a dependency's bundled skills are not this repo's skills. Changing the acceptance command to `find . -name SKILL.md -not -path "./.git/*" -not -path "*/node_modules/*"` would make it match (30), but changing an acceptance criterion is a stop-and-ask. Blocks: nothing. Raised: at this checkpoint.
- Q5 (open item for its own branch): vet-third-party/scripts/scan.py does not scan `.rs` files (TEXT_EXT has no `.rs`), so none of ccboard's 175 Rust files were scanned. Not fixed in this run, per the author. Recorded in LESSONS.md.
- Q1 to Q4: answered by the author on 2026-09-28; see STANDING-DECISIONS.md.

## Decisions
- Branch created with `git checkout -b feat/skills-graph origin/main` because local main was behind the PR #2 merge; upstream then unset so a bare `git push` cannot target main.
- A hook node is a script registered in hooks/settings.example.json. _input.js (shared helper) and test-hooks.js (test runner) are not hooks.
- Edge rules and node fields: documented in viz/README.md. An edge is a body (not frontmatter) naming another node as an exact, case-sensitive whole token; "ponytail" inside "ponytail-review" does not count. Edge kind is "<source kind>-<target kind>".
- graph.json is written with ensure_ascii=True: two source descriptions (recruiter-demo-writer, scroll-world) contain em dashes, stored as JSON unicode escapes, so the file has no literal em dash while staying faithful to the source. The page displays the source text as written.
- Fixture skills are named SKILL.fixture.md so the phase 1 acceptance `find . -name SKILL.md` counts only real skills.
- Graph library: Cytoscape.js 3.34.3, vendored (docs/decisions/0001). Layout: one cell per family, members placed with the built-in grid layout, animation off. Node size: square root of line count.
- Monitor recommendation: ccboard in terminal-UI mode (viz/MONITOR-EVAL.md), with agent-mission-control behind --token and a firewall rule as the browser fallback.

## Review nits recorded, not fixed (below the CRITICAL/HIGH floor)
- Gate 1: a hook registered under two events gets the first matching line for both coverage entries; a non-UTF-8 file fails the build without naming the file; a missing README.md puts every node in a top-level-directory family with no warning; the eval heuristic misses "8/8 passing" and "pass_rate 0.92"; the frontmatter parser keeps invalid escapes raw, ignores indentation indicators, and lets the last duplicate key win; origin and notice text is one physical line; license detection keeps the first token and misses ISC, MPL, Unlicense, and "BSD 3-Clause"; line counts and edge line numbers can differ on form feeds or U+2028 (none today); graph.json is not written atomically; unmatched ECC-LICENSE entries are ignored silently.
- Gate 2: the panel omits absent fields (a hook has no Description row; agents and hooks have no Eval status row) instead of saying "none"; test_app.cjs's parent and edge tests are weaker than their names (the stronger checks now live in test_panel.cjs); the load-error prefix also covers render errors; app.js never reads schema_version; ids are not checked for uniqueness in the page (the extractor does check); the status line stays at "Loading" if app.js itself fails to load; the detail panel keeps showing a node after its family is filtered out; the page's top-level functions become window globals.

## Lessons
Written to LESSONS.md at the repo root (Q2 approved).

## Next action
Wait for the author: Q6 (amend the phase 1 acceptance command to exclude node_modules?), and phase 4 (visual design of the page, from viz/screenshot.png). The branch stays unpushed.
