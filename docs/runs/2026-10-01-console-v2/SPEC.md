# Run: ark-console v2, metrics, skills graph, and control

Autonomous run with two human gates. Model: opus for design and review phases, sonnet for the rest;
say in PROGRESS.md which phase used which. Repos: ~/dev/ark-console (branch feat/console-v2) and
~/dev/ark-skills (PROGRESS.md and STANDING-DECISIONS.md in docs/runs/2026-10-01-console-v2/, branch
docs/console-v2-run). Skills: unattended-build (governs), visual-loop (governs every phase that
changes how the page looks), spec-writing, verify-before-done, adversarial-review, decision-records,
capture-lessons.

The design is decided and written down: **~/dev/ark-console/docs/UI.md**. Read it before Phase 2.
Build what it says. Where it is silent, keep what the page does today and list the gap in
PROGRESS.md rather than inventing a look.

## Precondition

The efficiency run (docs/runs/2026-10-01-efficiency/SPEC.md in ark-skills, or whatever date it
carries) must have produced the usage numbers in the indexer. If it has not run, stop here and say
so: Phases 3 and 4 have no data without it. Phases 1, 2, 5 and 6 can proceed.

## Scope

- ~/dev/ark-console: lib/, public/, scripts/, test/, docs/.
- ~/dev/ark-skills: only docs/runs/2026-10-01-console-v2/.
- Read-only elsewhere. Never write to ~/.claude. The one exception to read-only is Phase 5, and only
  as that phase defines it.

## Stop and ask

Any design decision UI.md does not cover. Any write outside SCOPE. Installing a dependency (the page
stays standard-library and vendored only). Binding anything but loopback. Any control action beyond
the two in Phase 5.

## Phase 1: tokens and shell (commit)

Implement section 1 and 2 of UI.md: the CSS custom properties for both modes, the type scale, the
spacing scale, and a theme toggle that writes `data-theme` and remembers the choice in
localStorage, defaulting to the OS setting. No layout change yet.

ACCEPTANCE: the page check asserts every token value per mode as a literal, asserts the toggle
switches modes and survives a reload, and that numeric cells use the monospace stack. Screenshots in
both modes.

## Phase 2: layout (commit)

Implement section 3 and 4: header bar, the two-column attention and usage region, the tab bar with
Sessions, Repos, Skills and Usage, and the components as specified. The existing tables move under
their tabs unchanged in content.

ACCEPTANCE: at 1440x900 the default state fits with no page scroll (assert scrollHeight is not
greater than clientHeight); at 1000px wide the columns stack with attention first; the running strip
shows at most five rows; every empty state renders its sentence. Assert the card padding, radius,
row height and the 2px warning border as literals.

## Phase 3: usage tab and charts (commit, needs the efficiency data)

Implement section 5: the four charts, each with a hover tooltip and a table toggle, plus the three
stat tiles. Use the series hexes in order. Draw them with inline SVG; no chart library, no
dependency.

ACCEPTANCE: each chart renders from the fixture snapshot with the asserted series colors; a single
series has no legend and two or more do; the 150k rule is drawn at the right x position with its
label; the table toggle shows the same numbers as the chart; a fixture with missing usage fields
renders "not recorded" with the missing count; an empty fixture renders each chart's empty sentence.

## Phase 4: skills tab (commit)

Render the skills graph in the Skills tab from ark-skills' generated data. Read
`viz/data/graph.json` by a configurable path (default ~/dev/ark-skills/viz/data/graph.json), read
only, and say in FORMAT.md that the console depends on that file. Reuse the vendored Cytoscape build
from ark-skills by copying it into ark-console's vendor directory with its license, or state why you
did not. Beneath the graph, the skills usage table from Phase 3.

ACCEPTANCE: the tab renders the same node and edge counts as the JSON; a missing or unreadable file
renders "graph not available: <reason>" and does not break the page; no write to ark-skills.

## Phase 5: control, the read-only exception (commit)

Two actions only.

**Kill a session.** POST /api/kill with a PID. The server refuses unless all of these hold: the PID
appears in the current snapshot as a Claude session process; the request carries a token that the
server reads at startup from a file it creates with 0600 permissions in its own data directory; the
Origin and Host headers are loopback; the method is POST. It never kills a process group, only the
PID given. Every attempt, accepted or refused, is appended to the console's own audit log with the
time, PID, project, and outcome. The page asks for confirmation naming project, branch and PID, with
Cancel focused, and warns differently when the session is busy rather than idle.

**Dismiss a session or a run.** Hides the row. Stored in the console's own state file, never in
~/.claude, and reversible by an undo that lasts 10 seconds and by a "show dismissed" control.

Update SECURITY.md: what changed, why the exception is bounded, and what an attacker on this machine
or in the browser could and could not do with it.

ACCEPTANCE (all tested, each test confirmed to fail on broken code):
  a GET to /api/kill is refused
  a POST with no token, a wrong token, or a non-loopback Origin or Host is refused, and each refusal
    is logged
  a POST naming a PID that is not in the snapshot is refused
  a POST naming a PID that is in the snapshot calls the kill path (prove with an injected killer in
    the test, never by killing a real session)
  the audit log contains one line per attempt, with no token value in it
  dismissal writes only to the console's state file, proven by a before and after listing of
    ~/.claude
  undo restores the row

## Phase 6: STOP

Regenerate the screenshots: default state in both modes, the Usage tab, the Skills tab, and the
confirm dialog. Post them with the counts, the list of anything UI.md did not cover, and what you
refused. Wait for me.

## Phase 7 (after my round): adversarial-review the whole diff, CRITICAL and HIGH only, one fix
round, then verify-before-done, capture-lessons, push both branches and open both PRs. Do not merge.

## Reporting

Observed values only. NOT RUN, NOT AVAILABLE, NOT MEASURED mean what they say. No em dashes anywhere
including commit messages. Never --no-verify. Per-phase commits, diff read before each.
