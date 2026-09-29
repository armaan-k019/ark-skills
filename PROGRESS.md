# Progress: wiring and gap skills
Updated: 2026-09-29 01:28 EDT (from `date`)   Branch: chore/wire-skill-references (from origin/main d6f266a)   Last commit: fc4695f
The previous run's log (skills-graph) is in the git history of this file.

## SPEC summary
Track A (chore/wire-skill-references): add one cross-reference sentence to each of nine SKILL.md files so the graph's 7 isolated nodes connect; one commit per file; acceptance by extractor, isolated count at most 2, new edges with file and line, 30 nodes, families.json untouched, all test suites; PR, not merged. Track B (feat/gap-skills, from main after Track A's PR is open): evidence-first skills, one at a time, stopping after each: B1 spec-writing, B2 visual-loop, B3 debugging (needs the author's Stage A session), B4 and B5 stop and ask.

## Now
Track A, step: gate passed; opening the PR

## Done and verified
- Starting state, 2026-09-29 01:16 EDT: PRs #2 to #5 merged; origin/main d6f266a has viz/. Extractor on main's files: 30 nodes, 36 edges, 7 isolated nodes (hook:block-no-verify, skill:experiment-discipline, skill:impeccable, skill:literature-review, skill:recruiter-demo-writer, skill:scroll-world, skill:vet-third-party). Components: one of 17 nodes, the ponytail six, and the 7 isolated.
- Main's committed viz/data/graph.json is stale: test_build_graph.RealRepo fails on main (PR #4 merged with a graph generated before PR #5 changed recruiter-demo-writer's description). Track A regenerates it.
- Track A cross-references: 61b63de (literature-review), 933823f (scholar-evaluation; it already named adversarial-review), 89c58db (query-to-corpus), 91a987f (experiment-discipline), 29eae4c (skill-audit), 87e4e13 (phased-build), 1cd8124 (verify-before-done), fbbf18e (recruiter-demo-writer), fca2cd8 (scroll-world); graph and screenshots 3d4b448.
- Gate review (fresh-context reviewer, 2026-09-29 01:22 EDT): PASS, no CRITICAL or HIGH. One fix round on four hand-off sentences whose wording misdescribed the target skill or missed its trigger: b7224de (verify-before-done: hooks enforce part of the rule), fcacb7b (phased-build: vet-third-party's scope), 4620e1d (skill-audit: updates and MCP servers), fc4695f (query-to-corpus: profiled, not scored). Graph unchanged by the fixes.
- Acceptance, 2026-09-29 01:27 EDT, after the last edit:
  - `python3 viz/scripts/build_graph.py`: exit 0; 30 nodes (25 skills, 2 agents, 3 hooks), 50 edges (43 skill-skill, 4 skill-hook, 2 skill-agent, 1 agent-agent), 8 families.
  - Isolated nodes: 7 before, 0 after.
  - New edges: 14, none removed; each new edge's file and line is the added sentence (reviewer checked all 14 against a fresh extraction of origin/main).
  - `git diff --quiet origin/main -- viz/scripts/families.json`: identical.
  - `python3 -m unittest discover viz/scripts`: 54 tests OK. `cd viz && npm test`: 26 pass, 0 fail. `node hooks/test-hooks.js`: all 26 passed.
  - `node viz/scripts/smoke.mjs http://127.0.0.1:8123/`: exit 0; 30 nodes and 50 edges rendered, 13 edges bent around unconnected nodes, smallest label 13.7 px, largest empty rectangle 7.0%. Screenshots byte-identical to 3d4b448.
  - Em dashes: 0 in added lines, 0 in commit messages.
- capture-lessons: merged the http.server PID leak into the process-stopping lesson (count 2); new lesson on a generated file going stale across parallel branches.

## In flight
- none

## Open questions
- Q1: scroll-world is vendored (README: from oso95/scroll-world at 71cc36d3). A7's line makes it drift from upstream, and README.md line 12 does not say so. Updating the README is outside Track A's scope. Triggered by: "Any change to another skill's content beyond the one-line cross-references" and "Anything not in the SPEC". Blocks: nothing. Raised: Track A PR.
- Q2: Track B branches from main, which does not have Track A's regenerated graph.json. Both branches regenerate the same file, so whichever merges second must regenerate it after the first. Triggered by: SPEC ordering. Blocks: nothing. Raised: Track A PR.
- Promotion proposed (not applied): the process-stopping lesson reached count 2; this repo has no CLAUDE.md, so the one-line rule would be "Start a background process as its own statement, keep `$!`, and stop only that PID."

## Reviewer nits (below the severity floor, not fixed)
- recruiter-demo-writer: the hand-off sits under "New demos" but says "any demo page"; handing "color" to impeccable sits near the keep-the-accent-color advice.
- Placement: scroll-world's impeccable hand-off could sit in Step 7; experiment-discipline's decision-records hand-off could sit in Step 1.
- experiment-discipline: "build, test, and lint" half-lists verify-before-done's checks; "around a run" is vague.
- scholar-evaluation: could read as supplying citations for someone else's paper; "first" has no reference point.
- literature-review: partly repeats its own no-softening rule; honest-refusal's frontmatter scopes it to the discovery engine.

## Decisions
- Track A branch created from origin/main (all four earlier PRs are merged, so main has viz/); upstream unset.
- LESSONS.md is written at the end of each track because the run prompt says to run capture-lessons there.
- The gate's fix round went only to hand-off sentences that sent the reader to the wrong skill or missed a trigger; the rest are listed above.

## Next action
Push chore/wire-skill-references with an explicit refspec and open its PR against main; then create feat/gap-skills from origin/main for B1.
