# Standing decisions: ark-console
SPEC: docs/runs/2026-09-30-agent-console/SPEC.md   Branches: ark-skills docs/agent-console-run (from main fee91b9); ark-console main (new repo)   Written: 2026-09-30

Task class (Step 0): machine-checkable for Phases 1 to 5 and 7 (every acceptance item is a command or a scripted check); Phase 6 is a STOP for taste (styling), not done in this run.

## Decide yourself
- Language and stack for the console: Node's standard library only, unless one dependency is recorded with decision-records
- File layout, schema field names, test framework, polling interval, wording of docs
- Implementation approach within a phase; adding tests and fixtures; fixing bugs in code the run owns
- Up to two fix rounds per phase; one fix round in Phase 7's review, as the SPEC says
- Creating new branches from HEAD or from origin/main

## Stop and ask
- Any write outside SCOPE, any delete, any network call, any install beyond one recorded dependency
- Anything that would need ~/.claude to be modified
- Any visual or aesthetic decision beyond plain defaults
- Weakening, skipping, or deleting any test or acceptance criterion
- Anything irreversible in git: stash, reset, checkout of an existing branch, force push, history rewriting, deleting tracked files
- Pushing either repo; creating a remote for ark-console
- Anything not in the SPEC

## Scope
- Create and write only under ~/dev/ark-console, and in ~/dev/ark-skills only under docs/runs/2026-09-30-agent-console/.
- Read-only everywhere else, including ~/.claude and every other repo under ~/dev.
- Never write, move, or delete anything under ~/.claude. Never kill a process. The console's own code never calls gh, git push, or anything over the network, and never runs a git command that writes (`git --no-optional-locks` for status, because a plain `git status` may rewrite .git/index).
- Missing data is reported as NOT AVAILABLE or omitted with a reason, never inferred.
- Transcripts hold conversation content. FORMAT.md records paths, field names, and presence counts, never content values; fixtures are anonymized; no secret value is printed or written.

## How this run reads parts of the SPEC (found by checking it with spec-writing before starting)
- "Never kill a process" and Phase 4's "start it, curl the endpoint, ..., stop it": the scripted check starts the server inside a Node process, calls curl against it, and closes it with `server.close()`, so no process is killed. The page check's browser runs to completion on its own.
- Phase 5's headless check needs a browser. Playwright would be a dependency, and installing it is a network call (stop-and-ask). The check uses a Chrome binary already on disk in headless command-line mode (Playwright's cached chromium_headless_shell-1243, else /Applications/Google Chrome.app), with background networking disabled and its profile under ark-console/tmp (gitignored). If no binary is found, the check reports NOT RUN.
- Phase 2's no-write proof: this session, and any other live session, append to their own transcripts under ~/.claude/projects during the run, so the before-and-after listing also gets a control interval of the same length without the indexer, and the indexer is run once more under `sandbox-exec` with every file write denied.
- Phase 3's "fail on the pre-fix code": the code is new, so each test is confirmed to fail against a named change to the implementation.
- Phase 7 "only if Phase 6 is reached": the Phase 6 report is written to PROGRESS.md first; then the Phase 7 review and docs/SECURITY.md, which are machine-checkable, run; no styling.
- SPEC.md is committed on docs/agent-console-run with the two run files; it is in the one ark-skills directory this run may write.
- "Never kill a process" and command timeouts: the indexer ends its own ps, lsof, or git child if it is still running after 4 seconds (execFile's timeout), so one hung command cannot stall every snapshot; the page check does the same for its own headless Chrome after 60 seconds. It never signals a process it did not start. Recorded in ark-console docs/SECURITY.md. The two check processes of this run that hung were not killed (PROGRESS.md Q4).
- capture-lessons writes LESSONS.md at a repo root. In ark-skills this run may write only its run folder, so the lessons are in ark-console/LESSONS.md, and merging the recurring ones into ark-skills' LESSONS.md is a question (Q5).
