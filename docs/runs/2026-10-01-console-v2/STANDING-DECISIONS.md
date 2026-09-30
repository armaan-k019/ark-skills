# Standing decisions: ark-console v2, metrics, skills graph, and control
SPEC: docs/runs/2026-10-01-console-v2/SPEC.md   Branch: ark-console feat/console-v2 (from feat/efficiency d6cb492); ark-skills docs/console-v2-run (from main fee91b9)   Written: 2026-09-30 15:28 EDT

Class: machine-checkable up to Phase 6, because docs/UI.md fixes the values the checks assert as literals. Anything UI.md does not decide is not machine-checkable: it keeps what the page does today and goes to PROGRESS.md as a gap, or to Open questions when a phase cannot proceed without it. Phase 6 is a STOP for the author's round; Phase 7 waits for it.

## Decide yourself
- Implementation approach within a phase, file layout and naming inside lib/, public/, scripts/, test/, docs/
- Refactors confined to files the phase already touches
- Adding tests, fixtures, and checks; fixing bugs in code the build owns
- Up to two fix rounds per phase
- Creating a new branch from HEAD, including stacked branches
- Turning a UI.md value into a literal in scripts/check-page.js, and replacing an earlier round's literal where UI.md sets a new value for the same property (the author's newer decision); each replacement is listed in PROGRESS.md

## Stop and ask
- Any design decision UI.md does not cover (the look is kept as it is today, and the gap listed)
- Any write outside SCOPE (ark-console: lib/, public/, scripts/, test/, docs/; ark-skills: docs/runs/2026-10-01-console-v2/ only); never ~/.claude
- Installing or adding a dependency (standard library and vendored files only)
- Binding anything but loopback
- Any control action beyond Phase 5's two (kill a session, dismiss a session or run)
- Killing any real process; tests use an injected killer
- Weakening, skipping, or deleting a test or acceptance criterion, including an earlier round's literal that UI.md does not replace
- Anything irreversible in git: stash, reset, checkout of an existing branch, force push, history rewriting, deleting tracked files
- Merging; pushing and opening PRs before the author's round (Phase 7 does that after it)
- Anything not in the SPEC

## Readings of the SPEC (recorded because the SPEC does not settle them)
- **Models.** The SPEC says opus for design and review phases and sonnet for the rest. This session runs on claude-opus-5-5 and cannot change its own model, so the building in Phases 1 to 5 is delegated to subagents started with model sonnet, each given the UI.md sections, the acceptance, and the constraints. The main session (opus) writes the briefs, reads each diff, runs the checks itself, does the mutation proofs, and commits. PROGRESS.md lists every subagent and its model.
- **Branches.** ark-console feat/console-v2 is stacked on feat/efficiency, because Phases 3 and 4 need the usage report that branch adds. Its PR (Phase 7) will be based on feat/efficiency, or on main after feat/efficiency merges.
- **UI.md** is untracked in ark-console, written by the author. It is committed unchanged as the branch's first commit, so every check can cite it.
- **README.md and .gitignore** are outside the listed scope. They are not edited; README changes the new features need are listed in the report for the author.
- **Phase 5's data directory** ("a file it creates with 0600 permissions in its own data directory") has no location in the SPEC or UI.md. The server takes `ARK_CONSOLE_DATA_DIR`; its default is `~/.local/state/ark-console` (created 0700), outside every repo so the token can never be committed (the repo's .gitignore is out of scope). Every server this run starts (tests, checks, screenshots) uses a directory under ark-console/tmp/, so the run writes nothing outside SCOPE. The default is raised as a question.
- **Gate reviews.** The SPEC sets one review, Phase 7, after the author's round. Phase 5 turns a read-only console into one that can kill processes, so it also gets one fresh-context security review (opus) before the Phase 6 STOP; findings are fixed under the two-round cap.
- **Windows for the charts.** UI.md fixes chart 1 at 14 days and the tiles' context line at "last 24h"; it does not name a window for charts 2 to 4. They use the last 7 days, named in each chart's title, and the choice is listed as a gap.
- **Days** for chart 1 are calendar days in the machine's local time zone, computed from the same fixed report time as the rest of the usage report.
