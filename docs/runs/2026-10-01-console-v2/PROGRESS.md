# Progress: ark-console v2, metrics, skills graph, and control
Updated: 2026-09-30 15:27 EDT (from `date`)   Branch: ark-console feat/console-v2; ark-skills docs/console-v2-run   Last commit: none yet

## SPEC summary
Build docs/UI.md in ark-console: Phase 1 tokens, type scale, spacing, theme toggle; Phase 2 layout (header bar, attention and usage columns, tabs); Phase 3 the Usage tab's four charts and three tiles (inline SVG); Phase 4 the Skills tab (ark-skills' graph.json with a vendored Cytoscape); Phase 5 two control actions (kill a session with a token, loopback Origin and Host, audit log; dismiss with undo); Phase 6 STOP with screenshots; Phase 7 after the author's round: review, verify, lessons, push and open PRs.

## Now
Phase 1 (SPEC "Phase 1", UI.md sections 1 and 2), step: committing UI.md, then the Phase 1 brief.

## Done and verified
- Precondition, 2026-09-30 15:27 EDT: the efficiency run produced the usage numbers in the indexer (ark-console feat/efficiency d603781 and d6cb492: lib/usage.js and the snapshot's `usage` field; `bash scripts/accept-usage.sh` passed at 15:22 EDT). Phases 3 and 4 have data.
- Premises: ark-console/docs/UI.md present (untracked, 8,279 bytes, written 14:03 EDT); ark-skills viz/vendor/cytoscape.min.js (Cytoscape 3.34.3 per viz/README.md) with viz/vendor/cytoscape-LICENSE (MIT); ark-skills main's viz/data/graph.json has 32 nodes and 66 edges; ark-console has a remote (origin) and main is in sync with it.

## In flight
- none

## Open questions
- none yet

## Decisions
- Readings of the SPEC (models, branches, UI.md, README and .gitignore, the data directory, reviews, chart windows, days) are in STANDING-DECISIONS.md.

## Models used
- Main session: claude-opus-5-5 (orchestration, briefs, review of each diff, checks, commits).

## Gaps: what UI.md does not decide (kept as the page does today unless noted)
- none listed yet

## Next action
Commit docs/UI.md unchanged on ark-console feat/console-v2; write the Phase 1 brief for a sonnet subagent.
