# Run: ark-console v3, readable by someone who did not build it

Autonomous run with one human gate (Phase 5). Model: opus for Phase 0, 4 and 7, sonnet for the
rest; say in PROGRESS.md which phase used which. Repos: ~/dev/ark-console (branch feat/console-v3,
based on docs/ui-v3-simple at bc38b4e, which carries UI.md v3 and all of v2) and ~/dev/ark-skills
(PROGRESS.md and STANDING-DECISIONS.md in docs/runs/2026-10-04-console-v3/, branch
docs/console-v3-run). Skills: unattended-build (governs), visual-loop (governs every phase that
changes how the page looks), verify-before-done, adversarial-review, decision-records,
capture-lessons.

The design is decided and written down: **~/dev/ark-console/docs/UI.md**, sections 2, 3, 4, 8, 9
and 10 are new or revised in v3. Read it before Phase 1. Build what it says. Where it is silent,
keep what the page does today and list the gap in PROGRESS.md rather than inventing a look.

Why this round exists, in the owner's words: the page is hard to read, it is written for someone
who built it, and some containers are too small to be usable. The fix is the information
architecture, not the paint.

## Precondition

`git -C ~/dev/ark-console log --oneline -1 docs/UI.md` names commit bc38b4e or a later one, and
`grep -c "## 9. Minimum sizes" ~/dev/ark-console/docs/UI.md` returns 1. main does not contain
UI.md, so a branch off main is the wrong base: stop and say so if that is where you are.

## Scope

- ~/dev/ark-console: lib/, public/, scripts/, test/, docs/.
- ~/dev/ark-skills: only docs/runs/2026-10-04-console-v3/.
- Read-only elsewhere. Never write to ~/.claude. No new dependency: the page stays standard-library
  and vendored only, and page checks stay on the Chrome DevTools Protocol driver already in
  scripts/.

## Stop and ask

Any design decision UI.md does not cover. Any write outside Scope. Installing a dependency. Binding
anything but loopback. Changing what the indexer collects, or any control action (kill, dismiss)
beyond moving the existing ones to the Sessions detail page. Deleting a check that fails: a failing
check is a finding, not an obstacle.

## Decide yourself

Element names, ids and class names. File layout inside public/ and scripts/. The wording of
explanation sentences, as long as each is at most 140 characters and uses no banned word. Which
plain-language phrase to use where UI.md section 8 gives a replacement. The order of rows within a
card, if UI.md does not fix it. How to structure the audit script. Commit granularity, as long as
each phase is at least one commit.

## Phase 0: audit before touching anything (commit)

Write `scripts/audit-ui.js`: drives the existing CDP page check against both fixtures
(`scripts/make-fixtures.js`) in both modes and at 1440, 1100 and 820 width, and reports every
violation of UI.md section 8 (banned words in visible text), section 9 (computed box floors, text
measure, hit targets) and the 4.5:1 contrast rule, as a table of observed values. It fixes nothing.

ACCEPTANCE: `node scripts/audit-ui.js` exits 1 and names at least one violation today (the current
page predates sections 8 and 9, so a clean run here means the audit is not looking). Paste its full
output into PROGRESS.md as the before state. Record the measured contrast ratio of every text token
against every surface it sits on, both modes, as numbers, not as pass or fail.

## Phase 1: two levels (commit)

Implement UI.md section 3. Home becomes full-width stacked cards: header sentence, Waiting on you,
Working right now, Usage this week, footer links. Sessions, Repos, Skills and Usage become detail
pages, each with a "Back to home" control. The tab strip is removed. No data code changes: the
tables and charts move, their content does not.

ACCEPTANCE: at 1440x900, both fixtures, home has no page scroll (scrollHeight not greater than
clientHeight) and contains no tab strip element. Each of the four detail pages is reachable from
home, shows its back control, returns to home, and keeps its sort and any expanded row across the
round trip (assert by reading the sorted column and the expanded row id before and after).
Keyboard: the back control is focusable and Enter activates it.

## Phase 2: type and rhythm (commit)

Implement UI.md section 2 as literals: 24/18/15/12/11 px plus the 34px big numeric, the monospace
stack on numeric and big, 36px rows, 24px home card padding, 20px detail card padding, 10px home
radius, 8px detail radius, text measure at most 76 characters.

ACCEPTANCE: the page check asserts each of those as a literal value read from the computed style,
not from the stylesheet source. Screenshots of home in both modes at 1440x900.

## Phase 3: plain language (commit)

Implement UI.md section 8. Replace every banned term on home with its replacement wording, add the
one explanation sentence per home card, and write every home number with its unit in words.
Technical vocabulary stays on the detail pages, each term glossed once in parentheses on first use.

ACCEPTANCE: the audit's banned-word check passes on home in both fixtures and both modes, and the
detail pages are exempt. Every home card has an explanation sentence of 1 to 140 characters. The
check reads visible text (`innerText` of the rendered home root), not markup, so a banned word in a
title attribute or an aria-label also fails.

## Phase 4: floors and contrast (commit)

Implement UI.md section 9. Enforce the floors; where a container cannot meet one at a given width,
render its summary number and a detail link instead of shrinking it. Compute every text-on-surface
contrast ratio; if `--text-3` or any other token is below 4.5:1, change the token value until it
passes, then write the new value and its measured ratio back into UI.md section 1 in the same
commit.

ACCEPTANCE: `node scripts/audit-ui.js` exits 0 for all three widths, both modes, both fixtures. No
horizontal scroll at 1100 or 820. Every ratio in the output is at or above 4.5. PROGRESS.md carries
the before and after tables side by side, as observed numbers.

## Phase 5: STOP

Do not continue past this point. In PROGRESS.md: the audit output before and after, the six
screenshots (home dark, home light, home at 820, Sessions detail, Usage detail, Skills detail), and
a list of every value you chose that UI.md left open, with the value you chose and why. Then stop
and wait. The type scale, the floors and the explanation sentences are proposals until this gate
passes; treat anything I change in review as a decided value and make it a literal assertion.

## Phase 6 (after my round): mutants (commit)

One mutant per bullet in UI.md section 10 under "Added in v3", seven in total. Each mutant is a
small edit that should break exactly one check: shrink a chart below 480x220, put "PID" back on
home, delete an explanation sentence, revert a text token to a sub-4.5 value, force a page scroll at
1440x900, break the detail-page round trip, and drop a unit word.

ACCEPTANCE: `node scripts/mutants.js` reports, for each mutant, the check that failed and that the
suite is green with the mutant reverted. A mutant that breaks no check, or breaks more than the one
it targets, is recorded as a finding in PROGRESS.md and the check is tightened before the phase
closes.

## Phase 7: adversarial-review the whole diff (commit)

CRITICAL and HIGH only, one fix round. Anything MEDIUM or below is recorded in PROGRESS.md and left
unfixed.

## Reporting

PROGRESS.md after every phase, every fix round, and every blocked question, so a cold session can
resume from it. Observed values only: NOT RUN, NOT AVAILABLE and NOT MEASURED are valid answers and
are better than a plausible number. If a phase cannot be done as written, say which line of this
SPEC blocks it and stop; refusing is a valid outcome.
