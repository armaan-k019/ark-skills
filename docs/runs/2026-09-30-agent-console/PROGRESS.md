# Progress: ark-console
Updated: 2026-09-30 00:39 EDT (from `date`)   Branch: ark-skills docs/agent-console-run; ark-console main   Last commit: ark-console b6b7242

## SPEC summary
A local, read-only console in a new repo ~/dev/ark-console: Phase 1 repo and format discovery (docs/FORMAT.md), Phase 2 indexer (sessions, runs, repos as one JSON snapshot), Phase 3 tests on anonymized fixtures, Phase 4 loopback-only server and API, Phase 5 plain page with a headless check, Phase 6 STOP for styling, Phase 7 review and docs/SECURITY.md. Nothing pushed.

## Now
Phase 2 (SPEC Phase 2), step: writing the indexer

## Done and verified
- Premises, 2026-09-30 00:32 EDT: ~/dev/ark-console did not exist; ~/.claude/projects has 11 entries and 204 .jsonl files (385M); /Applications/Google Chrome.app and ~/Library/Caches/ms-playwright/chromium_headless_shell-1243 exist; node v25.9.0; curl, sandbox-exec, lsof present.

- Phase 1, ark-console b6b7242: repo created (main, MIT LICENSE, README, .gitignore); docs/FORMAT.md and scripts/survey.js. Observed at 2026-09-30T04:37:05Z (`node scripts/survey.js`, 0.64 s): 11 project directories, 26 session transcripts (~/.claude/projects/<slug>/<sessionId>.jsonl; the file name equals every line's sessionId in 26 of 26), 181 subagent transcripts, 40,576 lines, 0 unparseable; 4 registry files (~/.claude/sessions/<pid>.json), all 4 PIDs running as `claude` processes, `lsof -d cwd` matched the registry cwd for all 4. FORMAT.md lists per-field presence and seven wanted facts with no source on disk.
- Found in Phase 1: one assistant message spans several transcript lines with identical usage (4,268 message ids), so token totals count each message.id once; ~/.claude/ide/*.lock holds an authToken and sessions/*.key may hold credentials, so the console never opens either; `git status` needs `--no-optional-locks` to avoid rewriting .git/index.

## In flight
- none

## Open questions
- Q1 (from the SPEC): what Orca does not do that the author needs. Not guessed; the answer goes here at Phase 6 with what would need to be known.
- Q2 (from the SPEC): whether control (sending input to a running session) is ever wanted.
- Q3 (from the SPEC): whether the console should be reachable from a phone.

## Decisions
- How five parts of the SPEC are read is in STANDING-DECISIONS.md (killing processes, the headless browser, the no-write proof, pre-fix tests, Phase 7 after Phase 6).

## Next action
Write lib/indexer.js in ark-console (sessions, runs, repos snapshot) and run the Phase 2 acceptance.
