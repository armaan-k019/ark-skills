# Run: ark-console, a local read-only console for my agent sessions

Autonomous overnight run. Model: opus. Skills: unattended-build (governs this run), spec-writing,
verify-before-done, adversarial-review, decision-records, capture-lessons. Follow them; do not
restate them.

Two repos are involved:
- ~/dev/ark-skills: holds this SPEC and this run's PROGRESS.md. Nothing else in it may change.
- ~/dev/ark-console: NEW repo you create in Phase 1. All product code goes here.

Write PROGRESS.md and STANDING-DECISIONS.md to
~/dev/ark-skills/docs/runs/2026-09-30-agent-console/ (beside this SPEC), so I can read them from
the planning session. Commit them in ark-skills on branch docs/agent-console-run. Everything else
is committed in ark-console on main.

## Goal

A console I run locally that answers, without me opening six windows: what sessions are running,
on what project and branch, with what model, what each is doing now, which of my runs are waiting
on me, and what is queued. Read-only in this run: it observes, it never sends input to a session,
never writes to another repo, and never touches ~/.claude.

## Questions for me (answer in PROGRESS.md as open, do not guess)

1. What Orca does not do that you need. I said "specific and different needs" and did not say what.
   Build the observation layer below, which is needed under any answer, and list what you would
   need to know before building anything beyond it.
2. Whether control (sending a message to a running session) is ever wanted, since that changes the
   security model.
3. Whether it should be reachable from a phone, which changes binding and auth.

## Scope

- Create and write only under ~/dev/ark-console.
- In ~/dev/ark-skills: write only docs/runs/2026-09-30-agent-console/.
- Read-only everywhere else, including ~/.claude and any other repo under ~/dev.
- Never write, move, or delete anything under ~/.claude. Never kill a process. Never call gh, git
  push, or any network call from the console's own code.
- The server binds 127.0.0.1 only, with no auth, because it is local and read-only.

## Decide yourself

Language and stack for the console (prefer no dependencies beyond Node's standard library and what
ark-skills already vendors; if you need one dependency, record it with decision-records and say
why), file layout, schema field names, test framework, polling interval, and the wording of docs.

## Stop and ask

- Any write outside SCOPE, any delete, any network call, any install beyond one recorded dependency.
- Anything that would need my ~/.claude to be modified.
- Any visual or aesthetic decision beyond plain defaults (see Phase 6).
- If the on-disk session data turns out not to contain something the console needs: report it as
  NOT AVAILABLE and carry on with what exists. Do not infer it.

## Phase 1: repo and format discovery (commit)

Create ~/dev/ark-console (git init, main, MIT LICENSE, README stub, .gitignore).

Then discover, by reading, what is actually on disk:
- What Claude Code writes under ~/.claude (sessions, transcripts, settings, history), the directory
  layout, file naming, and the fields of a transcript line. Do not assume a schema; sample several
  files, including a long session and a short one.
- What `ps` shows for running claude processes, and how to get each one's working directory without
  elevated permissions.
- What a run leaves in a repo: docs/runs/<slug>/SPEC.md and PROGRESS.md in ark-skills, and whatever
  the other repos under ~/dev use.

Write docs/FORMAT.md in ark-console recording exactly what you found: paths, fields, which fields
are reliably present, which are sometimes missing, and which of the console's wanted facts have no
source at all. Quote real file paths and field names. This file is the evidence base; everything
later reads from it.

ACCEPTANCE:
  docs/FORMAT.md exists and names at least: the session directory path, the transcript file naming,
  and per field, whether it was present in every sample you read.
  Report the number of session files and projects found.

## Phase 2: the indexer (commit)

A module that turns what Phase 1 found into one normalized snapshot, as JSON:

  sessions: id, project path, project name, git branch if the repo has one, model if recorded,
            started at, last activity at, message count, last tool used, whether a process for it
            is running now, and token usage if and only if it is recorded on disk
  runs:     for each docs/runs/<slug>/ found under ~/dev: the slug, the repo, whether PROGRESS.md
            exists, its last heading or status line, and whether it is waiting on a human (a STOP
            or a question section)
  repos:    for each repo under ~/dev: current branch, dirty or clean, ahead or behind counts if an
            upstream exists, using read-only git commands

Rules: read-only; never run git commands that write; skip anything unreadable and record why; every
field that cannot be derived is omitted, never guessed. A field that is sometimes missing is null
with a reason in a parallel "unknown" map.

ACCEPTANCE:
  `node <indexer> --json` exits 0 and prints valid JSON
  it reports the same session count as a direct count of the files on disk (show both numbers)
  running it twice with no activity in between produces identical output apart from timestamps
  it completes in under 5 seconds on the current machine state (report the measured time)
  it does not write anything: prove it by comparing a recursive listing with mtimes of ~/.claude
  before and after the run

## Phase 3: tests (commit)

Unit tests against fixtures you create from real files with paths and content anonymized: a normal
session, a truncated or malformed transcript line, a session with no model recorded, a repo with no
upstream, a docs/runs directory with a SPEC and no PROGRESS, and one waiting on a human.

Every test must be confirmed to fail on the pre-fix code, per LESSONS.md. State which.

ACCEPTANCE: the test command exits 0 and the pass count is reported; each test's failure on broken
code is stated.

## Phase 4: server and API (commit)

A local HTTP server: binds 127.0.0.1 on a port from an env var (default 7777), serves the static
page and one endpoint returning the Phase 2 snapshot. It refuses to start if asked to bind anything
other than loopback. No writes, no proxying, no outbound calls.

ACCEPTANCE:
  start it, curl the endpoint, get valid JSON matching the indexer's output, stop it, all scripted
  attempting to bind 0.0.0.0 exits non-zero with a message (test this)
  a request to any path outside the served directory returns 404 and cannot escape the directory
  (test with ../ traversal)

## Phase 5: the page, function only (commit)

One page, plain defaults, no palette, no animation: a list of sessions (project, branch, model,
state, last activity, last tool), a panel of runs waiting on me, and a repo list with dirty or
behind flags. It polls the endpoint. Sort by last activity, newest first. Show counts. Anything the
data does not contain is shown as "not recorded", never blank and never invented.

ACCEPTANCE:
  a headless check loads the page against a fixture snapshot, asserts the rendered row count equals
  the JSON, asserts that a session with no model shows "not recorded", and writes a screenshot
  the page works with an empty snapshot (no sessions) without errors

## Phase 6: STOP

Do not style anything. Post: the screenshot, the counts, docs/FORMAT.md's list of what has no
source on disk, the answers you have for my three questions, and what you refused. Then wait.

## Phase 7 (only if Phase 6 is reached before you run out of work): hardening, not features

Adversarial-review the whole diff with a severity floor of CRITICAL and HIGH, one fix round. Then
write docs/SECURITY.md in ark-console: what the console reads, what it never does, why it binds
loopback, and what would have to change if control or phone access were ever added.

## Reporting

Observed values only; NOT RUN means not run; NOT AVAILABLE means the data does not exist on disk.
No em dashes anywhere, including commit messages. Never use --no-verify. Per-phase commits with a
diff read before each. Run verify-before-done before Phase 6 and capture-lessons at the end. Leave
both repos unpushed; ark-console has no remote.
