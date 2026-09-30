# Progress: ark-console v2, metrics, skills graph, and control
Updated: 2026-09-30 15:48 EDT (from `date`)   Branch: ark-console feat/console-v2; ark-skills docs/console-v2-run   Last commit: ark-console 9746a2c

## SPEC summary
Build docs/UI.md in ark-console: Phase 1 tokens, type scale, spacing, theme toggle; Phase 2 layout (header bar, attention and usage columns, tabs); Phase 3 the Usage tab's four charts and three tiles (inline SVG); Phase 4 the Skills tab (ark-skills' graph.json with a vendored Cytoscape); Phase 5 two control actions (kill a session with a token, loopback Origin and Host, audit log; dismiss with undo); Phase 6 STOP with screenshots; Phase 7 after the author's round: review, verify, lessons, push and open PRs.

## Now
Phase 2 (SPEC "Phase 2", UI.md sections 3 and 4), step: a sonnet subagent is building it from the brief; the main session will verify.

## Done and verified
- Precondition, 2026-09-30 15:27 EDT: the efficiency run produced the usage numbers in the indexer (ark-console feat/efficiency d603781 and d6cb492: lib/usage.js and the snapshot's `usage` field; `bash scripts/accept-usage.sh` passed at 15:22 EDT). Phases 3 and 4 have data.
- Premises: ark-console/docs/UI.md present (untracked, 8,279 bytes, written 14:03 EDT); ark-skills viz/vendor/cytoscape.min.js (Cytoscape 3.34.3 per viz/README.md) with viz/vendor/cytoscape-LICENSE (MIT); ark-skills main's viz/data/graph.json has 32 nodes and 66 edges; ark-console has a remote (origin) and main is in sync with it.

- ark-console 20ff9be: docs/UI.md committed unchanged (sha256 af789ff6ab3c6935..., first 16 hex).
- Phase 1, ark-console 9746a2c (UI.md sections 1, 2, and the focus ring, transitions, and reduced motion of section 6): built by a sonnet subagent from a written brief (148,133 tokens, 38 tool uses, 697 s by its completion notice); checked by the main session: every one of UI.md's 30 color values (7 surface and ink per mode, 4 series per mode, 4 status) found in the check's literals by a script that reads UI.md; `node scripts/check-page.js` at 15:41 EDT: 395 checks passed (six mode scenarios, each by localStorage and reload; the toggle flips and survives a reload; numeric cells in the stack with tabular figures; type scale; reduced motion; the keyboard focus ring); tests 55 of 55; 15 single-value mutants (a dark hex under each dark rule, a light ink, a status hex, two series swapped, the data-theme guard removed, the numeric stack, tabular figures, th size, header weight, focus width and offset, reduced motion, transition time, the toggle not stored) each fail the check. Screenshots: docs/screenshot.png (dark) and docs/screenshot-light.png. Earlier literals replaced by UI.md: numeric font "monospace" to the stack (UI.md line 49); column headers 13px to 12px (line 47).

## In flight
- none

## Open questions
- none yet

## Decisions
- Readings of the SPEC (models, branches, UI.md, README and .gitignore, the data directory, reviews, chart windows, days) are in STANDING-DECISIONS.md.

## Models used
- Main session: claude-opus-5-5 (orchestration, briefs, review of each diff, checks, commits).
- Phase 1 builder: sonnet (claude-sonnet-5 family), per the SPEC.
- Phase 2 builder: sonnet, per the SPEC.

## Gaps: what UI.md does not decide (kept as the page does today unless noted)
- Section 6 has no phase in the SPEC; its focus ring, transitions, and reduced motion were built in Phase 1 (token-level), and its stale-snapshot rule goes with the header bar in Phase 2.
- The theme toggle's text: "theme", UI.md's own word in its header diagram, with an aria-label naming the mode it switches to.
- The stored theme applies when app.js runs (deferred; CSP allows no inline script), so a stored light choice on a dark OS can show the dark page for a moment on load.
- The 12px gray status line (round 1, V5) and the 12px gray notes (rounds 2 and 3) keep the CSS keyword gray; UI.md does not map them to a token.
- Planned for Phase 2 (UI.md silent, minimal choices, listed for the author): the running strip's empty sentence "Nothing is running."; its count link "Show all <n> running"; the attention card's "waiting" age measured from the run file's last modification; the "Not matched or not read" list at the bottom of the Sessions tab; the refresh button's glyph from the diagram with aria-label "Refresh now".

## Next action
When the Phase 2 builder returns: read its diff, run the check and tests, run single-value mutants of its literals, look at both modes at 1440x900 and 1000px, then commit.
