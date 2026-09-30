# Progress: ark-console
Updated: 2026-09-30 00:33 EDT (from `date`)   Branch: ark-skills docs/agent-console-run; ark-console main (not created yet)   Last commit: none yet

## SPEC summary
A local, read-only console in a new repo ~/dev/ark-console: Phase 1 repo and format discovery (docs/FORMAT.md), Phase 2 indexer (sessions, runs, repos as one JSON snapshot), Phase 3 tests on anonymized fixtures, Phase 4 loopback-only server and API, Phase 5 plain page with a headless check, Phase 6 STOP for styling, Phase 7 review and docs/SECURITY.md. Nothing pushed.

## Now
Phase 1 (SPEC Phase 1), step: run files written; creating ~/dev/ark-console

## Done and verified
- Premises, 2026-09-30 00:32 EDT: ~/dev/ark-console did not exist; ~/.claude/projects has 11 entries and 204 .jsonl files (385M); /Applications/Google Chrome.app and ~/Library/Caches/ms-playwright/chromium_headless_shell-1243 exist; node v25.9.0; curl, sandbox-exec, lsof present.

## In flight
- none

## Open questions
- Q1 (from the SPEC): what Orca does not do that the author needs. Not guessed; the answer goes here at Phase 6 with what would need to be known.
- Q2 (from the SPEC): whether control (sending input to a running session) is ever wanted.
- Q3 (from the SPEC): whether the console should be reachable from a phone.

## Decisions
- How five parts of the SPEC are read is in STANDING-DECISIONS.md (killing processes, the headless browser, the no-write proof, pre-fix tests, Phase 7 after Phase 6).

## Next action
Create ~/dev/ark-console (git init -b main, LICENSE, README, .gitignore), then read ~/.claude, ps, and ~/dev for docs/FORMAT.md.
