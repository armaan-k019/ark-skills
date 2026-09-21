---
name: phased-build
description: Run a coding task as gated phases (intake, research, plan, implement, review, verify, commit) where each phase writes one file the next phase reads, with two human approval gates. Use for any feature, change, bug fix, or refactor that touches more than one file or involves a real design choice, when orchestrating subagents or parallel sessions, or when asked to "plan this out", "build this properly", or "run the full pipeline".
---

# Phased Build

Big tasks fail in the seams: a plan that was never written down, a subagent that answered the literal question but not the real one, a review that read a summary instead of the diff. This skill makes each phase produce one artifact on disk, makes the next phase start from that artifact, and puts a human gate before code is written and before it is committed.

Adapted from ECC's `orch-pipeline` and `orch-*` skills, the orchestration section of ECC's longform guide, and its `iterative-retrieval` skill (MIT, see `licenses/ECC-LICENSE`). ECC's version delegates to ECC's own agents; this one uses the skills and agents in this repo.

## Step 0: Classify the operation and the size

State both in one line at the start so the user can override them.

**Operation** (decides the first move in Implement):

| Operation | When | First move |
|---|---|---|
| add | the capability does not exist yet | write a failing test for the new behavior, then build to green |
| change | it works, but the desired behavior is different | update the existing tests to the new spec first, then change the code |
| fix | behavior is wrong or crashes | reproduce the bug as a failing test before touching the fix |
| refactor | behavior stays, structure improves | confirm tests are green, restructure, keep them green throughout |

If the project has no test setup, say so, and replace "failing test" with a written reproduction (exact command, input, and observed output) that you re-run after the change.

**Size** (decides which phases run). Take the highest tier any signal reaches:

| Size | Files | New dependency or public contract | Design ambiguity | Phases |
|---|---|---|---|---|
| trivial | 1, a few lines | no | none | Implement, Verify, Commit |
| small | 1 file or function | no | clear after reading the code | light Research, Implement, Verify, Commit |
| standard | 2 to 5 | maybe an internal module | one real choice | all phases |
| large | many, cross-cutting | new external dependency, API, schema, or spec doc | several open questions | all phases, plan split into slices |

Anything touching auth, user input, secrets, database queries, file paths from input, or external API calls is at least standard.

## Working directory for artifacts

Write phase outputs to `.claude/work/<short-task-name>/` (add `.claude/work/` to `.gitignore` if the project does not track it). Each phase reads the previous file, not the conversation. If the session is compacted or restarted, the next session resumes from these files (see `strategic-compact`).

## The phases

**1. Intake** -> `intake.md`
Restate the request: goal, what done looks like, constraints the user stated (for example: no em dashes, anti-fabrication, tsc + build before commit, branch name). List anything ambiguous as a question. If a question blocks the plan, ask it now.

**2. Research** -> `research.md`
Read the code paths involved before proposing anything: entry points, callers, data shapes, existing tests, existing utilities that already do part of the job. Check whether a library or existing module solves it before writing new code. Record file paths and line numbers, not impressions. For current library behavior, read the docs or source; do not rely on memory for version-specific APIs.

**3. Plan** -> `plan.md`, then **GATE 1**
Thin vertical slices, each independently testable and committable. For each slice: files touched, the test or reproduction that proves it, and the commit message. Name the one or two real design choices and the option you recommend, with the reason. Record significant choices with `decision-records`.
Stop and present the plan. Do not write implementation code until the user approves.

**4. Implement**, one slice at a time
Follow the operation's first move. Keep each slice to its planned files; if a slice needs files outside the plan, stop and say why before continuing. Run `verify-before-done` checks at the end of every slice, not only at the end.

**5. Review** -> `review.md`
Review the actual diff, never a summary of it. Run the reviewers in fresh context:
- `ts-reviewer` for TypeScript, JavaScript, React, or Next.js changes.
- `silent-failure-hunter` when the diff touches network, file, database, parsing, or async code.
- `adversarial-review` (dual reviewer mode) when the output ships to users or goes into a paper, or when the size is large.
Every CRITICAL or HIGH finding is fixed, or the user explicitly accepts it, before moving on.

**6. Verify**
Run `verify-before-done` on the final state. The report goes into `review.md`.

**7. Commit**, **GATE 2**
Present the diff summary, the verification report, and the proposed commit messages (conventional prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Commit only after the user confirms. One commit per slice.

## Delegating to subagents without losing the purpose

A subagent knows only its prompt. It will answer the literal question and miss why it was asked. When delegating any phase:

1. Pass the objective, not just the query: "Find where tract data is fetched, because we are adding a cache and need every call site" beats "find where tract data is fetched".
2. Pass the artifact file paths it should read, and the file it should write.
3. When it returns, evaluate before accepting: does it cite file paths and lines? Does it answer the purpose? What is missing?
4. If something is missing, send a specific follow-up ("you listed 3 call sites; `src/app/map/page.tsx` also imports `getTracts`, check it"). Cap at 3 rounds, then proceed with what you have and record the gap in the phase file.

## Model routing (a starting point, not a rule)

Judgment-heavy, low-token phases (plan, review, adversarial review) get the strongest model available. Token-heavy, well-specified phases (implement a planned slice, run checks, fix listed issues) can use a cheaper model. Research that is mostly file searching can use the cheapest. Change this when results say otherwise.

## Parallel work

Independent slices can run in parallel sessions only if they touch disjoint files. Give each its own git worktree and branch (`git worktree add ../<repo>-<slice> -b <branch>`), and merge them one at a time with `verify-before-done` after each merge.

## Checklist before reporting the task done

- Operation and size were stated, and the phases run matched them.
- Gate 1 and Gate 2 were both honored.
- Every slice has a test or recorded reproduction that was run.
- Review read the diff; CRITICAL and HIGH findings are resolved or explicitly accepted.
- The final `verify-before-done` report says DONE, or the task is reported as NOT DONE with the reason.
