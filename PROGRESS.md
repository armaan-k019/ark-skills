# Progress: skills-graph
Updated: 2026-09-28 04:39 EDT (from `date`)   Branch: feat/skills-graph (from origin/main cd423eb, upstream unset so nothing pushes to main)   Last commit: 66af38b (phase 2)

Every time in this file comes from `date`. An earlier version said "03:52" and "03:50"; those were not clock readings (the clock read 03:22 shortly after) and were removed after review gate 1 flagged them.

## SPEC summary
Static page in viz/ that visualizes this repo: every skill, agent, and hook as a node, clustered by family, with defer/reference edges, hook coverage, license origin, and eval status, all generated from files. Plus viz/MONITOR-EVAL.md, a vetted recommendation (no install) for a live Claude Code session monitor. Phases: 0 setup, 1 extractor, 2 tests, 3 page (function only), 4 STOP for visual design, 5 monitor evaluation. Review gates after phases 1 and 3.

## Now
Phase 5 (monitor evaluation), step: committing; then phase 3 review gate 2

## Done and verified
- Phase 0 reading: 25 SKILL.md files, 2 files in agents/, 5 .js files in hooks/ of which 3 are registered in hooks/settings.example.json (config-protection, no-em-dash, block-no-verify); _input.js is a shared helper and test-hooks.js is the test runner. licenses/ECC-LICENSE lists the ECC-derived files.
- Phase 0: STANDING-DECISIONS.md and PROGRESS.md, commit 5b6105f.
- Phase 1: extractor and graph.json, commit f8964e8.
- Phase 2: tests and fixtures, commit 66af38b.
- Phase 1 acceptance, re-run after gate 1 fixes, 2026-09-28 04:33:06 EDT:
  - `python3 viz/scripts/build_graph.py` printed "wrote .../viz/data/graph.json: 30 nodes {'agent': 2, 'hook': 3, 'skill': 25}, 33 edges {'defer': 31, 'names-hook': 2}, 5 families", exit 0.
  - Node count: graph nodes=30; `find . -name SKILL.md -not -path "./.git/*" | wc -l` = 25; `find agents -type f | wc -l` = 2; distinct `hooks/<file>` references in hooks/settings.example.json = 3; sum 30.
  - Endpoints: independent check found 0 edges with a missing endpoint; `validate()` raised "edge endpoints missing from nodes: x" for an injected bad edge; main() returns 1 on any GraphError (covered by test_main_exits_nonzero_and_writes_nothing_on_error).
  - `python3 -c "import json;json.load(open('viz/data/graph.json'))"` exit 0.
- Review gate 1 (dual, adversarial-review mode A; reviewers followed agents/ts-reviewer.md and agents/silent-failure-hunter.md; severity floor CRITICAL and HIGH): both FAIL.
  - ts-reviewer HIGH: (1) literal em dash in viz/README.md:68; (2) a SKILL.md with no frontmatter, no name, or a BOM silently lost its incoming edges; (3) malformed hook settings silently dropped hooks, and the node-count check was tautological; (4) the invented timestamps above.
  - silent-failure-hunter HIGH: (H1) node-count check tautological, plus two cases it missed: Path.rglob("SKILL.md") matches a lowercase skill.md on this case-insensitive filesystem, and agents/ was read non-recursively while the acceptance command is recursive; (H2) settings shapes and non-.js hooks dropped silently; (H3) BOM, a leading blank line, `name :`, or no name silently lost data.
  - Fix round 1 (one round, both reviews merged): read files as utf-8-sig; a SKILL.md without frontmatter or name fails the build; settings shape and command checks fail the build; hooks of any extension; discovery from directory listings with exact case; agents/ recursive; an independent recount by a different traversal plus hook references counted in the raw settings text; unregistered scripts in hooks/ are warned about; README em dash replaced; README rules updated; timestamps corrected.
  - Verification of the fixes: 14 regression tests built from the reviewers' repro cases (FailsLoudly, DiscoveryMatchesFind). Each was run against the reviewed (staged) build_graph.py and failed there, and passes now. Full suite 41 tests OK at 04:33:06 EDT. graph.json after the fixes is semantically identical to the reviewed one (only key order changed). No second reviewer pass was run.
- Phase 5 (monitor evaluation), done, not yet committed: three repos cloned into /tmp/monitor-eval/ at ccboard c1a36a0, claude-agents-dashboard 320f553, agent-mission-control 50a805a; scan.py run on each (exit 1, HIGH findings present: 96, 440, 8); one read-only vetting pass per repo; load-bearing claims re-read in source; viz/MONITOR-EVAL.md written. Nothing installed, built, or run.
- Phase 3 groundwork, not yet committed: Cytoscape.js 3.34.3 vendored in viz/vendor/ after the tarball's sha512 matched the registry integrity; docs/decisions/0001-graph-library-cytoscape.md and its index.

- Phase 2 acceptance, 2026-09-28 04:34:50 EDT: `python3 -m unittest discover viz/scripts` printed "Ran 41 tests in 0.108s" and "OK", exit 0. Pass count: 41 of 41. Required coverage: frontmatter parsing (folded, quoted, literal, none, unterminated, BOM), a skill with no description (test_skill_without_description_omits_field), a defer edge (test_defer_edge_carries_file_and_line), excluded false positives (test_hyphenated_longer_token_is_not_a_reference, test_capitalized_word_is_not_a_reference), eval status present and absent (test_eval_status_present, test_eval_status_absent, test_eval_ignores_fenced_templates_and_scoring_instructions). Fixture skills are named SKILL.fixture.md (see Decisions).

## In flight
- none

## Open questions
- Q1: Playwright is not available to this repo. Triggered by: stop-and-ask "a dev-only Playwright ... ask first if it is not already available", plus "touching the portfolio repo". Observed: no global npm package, no python package, no `playwright` on PATH; Chromium 1243 browsers are cached in ~/Library/Caches/ms-playwright; the only npm copy is ~/dev/my-portfolio/node_modules/playwright. Options: (a) approve `npm install -D playwright` under viz/ (network, adds viz/package.json and a lockfile); (b) approve importing the portfolio's copy (touches the portfolio repo); (c) something else. Blocks: phase 3 acceptance (smoke.mjs run and viz/screenshot.png), so phase 4 materials will lack the screenshot. Raised: not yet.
- Q2: capture-lessons writes LESSONS.md at the repo root, which is outside SCOPE. Triggered by: stop-and-ask "any change to files outside SCOPE". Plan: lessons are recorded in this file under Lessons; move them to LESSONS.md if approved. Blocks: nothing. Raised: not yet.
- Q3: Skill-to-agent and agent-to-agent references exist but are not emitted. Triggered by: "Anything not in the SPEC" (the SPEC lists skill-to-skill, skill-to-hook, agent-to-skill). Observed: phased-build/SKILL.md names ts-reviewer (line 59) and silent-failure-hunter (line 60); agents/ts-reviewer.md names silent-failure-hunter (line 33). Blocks: nothing. Raised: not yet.
- Q4: ponytail-gain quotes published benchmark medians for ponytail (lines 16 to 36). Under the eval rule no skill is marked measured. Should ponytail show those medians as its eval status? Triggered by: product decision about what the eval field means. Blocks: nothing. Raised: not yet.
- Q5: vet-third-party/scripts/scan.py does not scan `.rs` files (its TEXT_EXT set has no `.rs`), so none of ccboard's 175 Rust files were scanned and every serious ccboard finding came from reading, not the scanner. Fixing it means editing vet-third-party/, which is outside SCOPE. Blocks: nothing. Raised: not yet.

## Decisions
- Branch created with `git checkout -b feat/skills-graph origin/main` because local main was behind the PR #2 merge; upstream then unset so a bare `git push` cannot target main.
- A hook node is a script registered in hooks/settings.example.json. _input.js (shared helper) and test-hooks.js (test runner) are not hooks. So the phase 1 node-count check is 25 skills + 2 agents + 3 hooks = 30.
- File layout and edge rules: documented in viz/README.md. Defer edge = body (not frontmatter) names another skill as an exact, case-sensitive whole token; "ponytail" inside "ponytail-review" does not count.
- graph.json is written with ensure_ascii=True: two source descriptions (recruiter-demo-writer, scroll-world) contain em dashes, stored as JSON unicode escapes, so the file has no literal em dash while staying faithful to the source. The page will display the source text as written.
- Fixture skills are named SKILL.fixture.md so the phase 1 acceptance `find . -name SKILL.md` still counts only real skills; changing that command would weaken an acceptance criterion.
- Graph library: Cytoscape.js (docs/decisions/0001). React Flow would add React and ReactDOM, dependencies beyond the graph library.
- Monitor recommendation: ccboard in terminal-UI mode (viz/MONITOR-EVAL.md), with the browser fallback agent-mission-control behind --token and a firewall rule.

## Review nits recorded, not fixed (below the CRITICAL/HIGH floor)
- A hook registered under two events gets the first matching line for both coverage entries.
- A non-UTF-8 file (for example a Finder .DS_Store in agents/) fails the build with a decode error that does not name the file.
- A missing README.md puts every node in a top-level-directory family with no warning; a missing licenses/ECC-LICENSE drops notices (a true omission).
- Eval heuristic misses "8/8 passing" and "pass_rate 0.92"; fences indented 4+ spaces are not treated as code.
- Frontmatter parser: `_unquote` keeps invalid escapes as raw text; indentation indicators such as `|2` are not recognised; duplicate keys, last wins.
- Origin and license-notice text is one physical line, so wrapped statements are cut (for example "(MIT, see").
- License detection keeps only the first token, does not recognise ISC, MPL, Unlicense, or "BSD 3-Clause" with a space, and a frontmatter license that conflicts with a body license is dropped.
- `lines` uses splitlines() while edge line numbers use split on newline; they differ only on files with form feeds, NEL, U+2028, or a lone carriage return (none today).
- graph.json is not written atomically.
- ECC-LICENSE entries that match no node are ignored without a message.

## Lessons (capture-lessons; LESSONS.md is out of scope, see Q2)
- Timestamps written from memory instead of `date`. Next time I write a time into a report, I will paste it from a `date` call in the same step. Evidence: PROGRESS.md said 03:52 when the clock read 03:22.
- Escape sequences in tool input are decoded. Next time I need a literal backslash-u escape in a file, I will write it through a script and scan every written file for dashes, not only the ones written through scripts. Evidence: viz/README.md:68 held a literal em dash.
- Substitutions by regex over source code can mangle it. Next time I bulk-edit code, I will compile it and read the diff before running it. Evidence: build_graph.py line 186 became `for idx, read(line in enumerate(path).split(...))`.
- A regression test must fail on the old code. Next time I add one for a review finding, I will run it against the reviewed version first. Evidence: the first BOM test passed on the old code because its fallback id equalled the directory name.

## Next action
Commit phase 5 (viz/MONITOR-EVAL.md), then stage phase 3 (page, smoke.mjs, test_app.cjs, vendor, docs/decisions) and run review gate 2.
