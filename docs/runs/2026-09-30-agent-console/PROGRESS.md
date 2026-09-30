# Progress: ark-console
Updated: 2026-09-30 00:56 EDT (from `date`)   Branch: ark-skills docs/agent-console-run; ark-console main   Last commit: ark-console 8672420

## SPEC summary
A local, read-only console in a new repo ~/dev/ark-console: Phase 1 repo and format discovery (docs/FORMAT.md), Phase 2 indexer (sessions, runs, repos as one JSON snapshot), Phase 3 tests on anonymized fixtures, Phase 4 loopback-only server and API, Phase 5 plain page with a headless check, Phase 6 STOP for styling, Phase 7 review and docs/SECURITY.md. Nothing pushed.

## Now
Phase 5 (SPEC Phase 5), step: writing the page

## Done and verified
- Premises, 2026-09-30 00:32 EDT: ~/dev/ark-console did not exist; ~/.claude/projects has 11 entries and 204 .jsonl files (385M); /Applications/Google Chrome.app and ~/Library/Caches/ms-playwright/chromium_headless_shell-1243 exist; node v25.9.0; curl, sandbox-exec, lsof present.

- Phase 1, ark-console b6b7242: repo created (main, MIT LICENSE, README, .gitignore); docs/FORMAT.md and scripts/survey.js. Observed at 2026-09-30T04:37:05Z (`node scripts/survey.js`, 0.64 s): 11 project directories, 26 session transcripts (~/.claude/projects/<slug>/<sessionId>.jsonl; the file name equals every line's sessionId in 26 of 26), 181 subagent transcripts, 40,576 lines, 0 unparseable; 4 registry files (~/.claude/sessions/<pid>.json), all 4 PIDs running as `claude` processes, `lsof -d cwd` matched the registry cwd for all 4. FORMAT.md lists per-field presence and seven wanted facts with no source on disk.
- Found in Phase 1: one assistant message spans several transcript lines with identical usage (4,268 message ids), so token totals count each message.id once; ~/.claude/ide/*.lock holds an authToken and sessions/*.key may hold credentials, so the console never opens either; `git status` needs `--no-optional-locks` to avoid rewriting .git/index.

- Phase 2, ark-console 651a182: lib/indexer.js. `bash scripts/accept-phase2.sh` at 00:42 EDT: exit 0, valid JSON, 0.97 s; session files on disk 26, reported 26; two runs identical apart from generated_at (0 lines); the only ~/.claude file that changed while it ran was this session's own transcript, 0 in a control interval of the same length; under sandbox-exec denying writes to ~/.claude and ~/dev, output matched except the ps step (sandbox-exec cannot launch setuid /bin/ps, so running was null with its reason), and the same rule refused a probe write under ~/dev. The first sandbox run found a bug (a spawn error failed the whole snapshot); run() now records it.
- Phase 3, ark-console 6f1142f: 17 tests on fixtures made from real files (scripts/make-fixtures.js; leak check: no user name or /Users/ path). `node --test test/indexer.test.js` at 00:49 EDT: 17 of 17. `node scripts/mutants.js`: each test fails under at least one named mutant (listed in the script's output); the first run showed one surviving mutant (resolved questions counted as open) and a missing mid-line Resolved fixture line, now added.
- Phase 4, ark-console 8672420: lib/server.js and test/server.test.js (8 tests); mutants now 26, all caught. `ARK_CONSOLE_PORT=7778 node scripts/accept-phase4.js` at 00:55 EDT: HTTP 200 and valid JSON; 0 differences from the indexer before and after apart from generated_at; server.close() and the port was free; 0.0.0.0 and :: exit 2 with "refusing to bind"; 9 ../ paths 404. The server also refuses non-loopback Host headers (DNS rebinding).

## In flight
- none

## Open questions
- Q4: a hung process of this run is still alive. The first version of scripts/accept-phase4.js ran curl with spawnSync, which blocked the Node process whose in-process server curl was waiting on, so neither can finish: node PID 57324 (listening on 127.0.0.1:7777) and its curl child PID 57699, started 2026-09-30 00:53 EDT. The SPEC says never kill a process, so they are left running; they are loopback-only and serve nothing. Blocks: port 7777 for this run's checks (they use 7778). Raised: not yet.
- Q1 (from the SPEC): what Orca does not do that the author needs. Not guessed; the answer goes here at Phase 6 with what would need to be known.
- Q2 (from the SPEC): whether control (sending input to a running session) is ever wanted.
- Q3 (from the SPEC): whether the console should be reachable from a phone.

## Decisions
- How five parts of the SPEC are read is in STANDING-DECISIONS.md (killing processes, the headless browser, the no-write proof, pre-fix tests, Phase 7 after Phase 6).

## Next action
Write public/index.html, app.js, and the headless check (Chrome command-line, fixture snapshot, empty snapshot) for Phase 5.
