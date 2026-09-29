# Progress: wiring and gap skills
Updated: 2026-09-29 01:17 EDT (from `date`)   Branch: chore/wire-skill-references (from origin/main d6f266a, upstream unset)   Last commit: d6f266a
The previous run's log (skills-graph) is in the git history of this file.

## SPEC summary
Track A (chore/wire-skill-references): add one cross-reference sentence to each of nine SKILL.md files so the graph's 7 isolated nodes connect; one commit per file; acceptance by extractor, isolated count at most 2, new edges with file and line, 30 nodes, families.json untouched, all test suites; PR, not merged. Track B (feat/gap-skills, from main after Track A's PR is open): evidence-first skills, one at a time, stopping after each: B1 spec-writing, B2 visual-loop, B3 debugging (needs the author's Stage A session), B4 and B5 stop and ask.

## Now
Track A, step: run files written; about to add the cross-references

## Done and verified
- Starting state, 2026-09-29 01:16 EDT: PRs #2 to #5 merged; origin/main d6f266a has viz/. Extractor on main's files: 30 nodes, 36 edges, 7 isolated nodes (hook:block-no-verify, skill:experiment-discipline, skill:impeccable, skill:literature-review, skill:recruiter-demo-writer, skill:scroll-world, skill:vet-third-party). Components: one of 17 nodes, the ponytail six, and the 7 isolated.
- Main's committed viz/data/graph.json is stale: test_build_graph.RealRepo fails on main (PR #4 merged with a graph generated before PR #5 changed recruiter-demo-writer's description). Track A regenerates it.

## In flight
- none

## Open questions
- scroll-world is vendored (README: from oso95/scroll-world; LICENSE: cyw). A7 adds a cross-reference to it, which makes it drift from upstream 71cc36d3; the run prompt names it explicitly, so it is done and flagged in the PR.

## Decisions
- Track A branch created from origin/main (all four earlier PRs are merged, so main has viz/); upstream unset.

## Next action
Add the Track A cross-references, one commit per file, then regenerate the graph and run the acceptance checks.
