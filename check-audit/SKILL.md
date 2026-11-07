---
name: check-audit
description: Audit a repository's existing tests, checks, and CI for checks that cannot fail, such as masked exit codes, skipped or never-run tests, stub scripts, and assertions that only repeat their mock, and prove each suspicion with a mutant before calling it a defect. Use when asked "do these tests actually test anything", before trusting a green suite you did not write, after a bug got past green checks, or before speeding up a suite.
---

# Check Audit

Adapted from morluto/rea's `rea-ci-tests-audit` skill (MIT, credit and license text in `licenses/REA-LICENSES`). Changes: the REA-specific parts (Turbo, Vitest lanes, provider fixtures, release rules) are gone, `scripts/scan_checks.py` is new, and every suspicion has to be settled by a mutant, which is Armaan's standing rule for new checks applied to old ones.

`spec-writing` makes sure a new acceptance command fails before the work. `verify-before-done` runs the checks. Neither asks whether the checks already in a repo can fail at all. A suite that stays green when the code is broken is worse than no suite, because it is trusted.

## Hard rules

- Investigating does not authorize edits. Notes and raw output go outside the tracked tree (the session scratchpad, or `/tmp`).
- Mutations happen in a separate worktree or copy, never in the working tree, and are thrown away after.
- Never skip, delete, or weaken a test, and never add retries or longer timeouts, to make a suite green.
- Report observed exit codes. If a check was not run, it is NOT RUN, with the reason.

## Step 1: Pin the baseline

Record the commit SHA, whether the tree is dirty, the exact command, the toolchain (`node -v`, `python3 --version`, the package manager and its version), and the host. A result is evidence for the revision it ran on, not for main after it moves.

## Step 2: Scan for leads

```sh
python3 <this skill's directory>/scripts/scan_checks.py <repo>
```

It reads package.json scripts, shell scripts, Makefiles, justfiles, GitHub workflow files, and test files, and exits 1 on any HIGH lead.

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `pipe-masks-exit` | HIGH | A check piped into `tail`, `head`, `tee`, `grep`, `sort`, `cat`, or `less` in a file that never sets `pipefail`. The pipeline's exit code is the last command's. |
| `or-fallback` | HIGH | A check followed by `\|\| true`, `\|\| :`, `\|\| echo`, `\|\| cat log`, or `\|\| exit 0`. |
| `continue-on-error` | HIGH, or MEDIUM when the step names no check | A workflow step whose failure does not fail the job. |
| `pass-no-tests` | HIGH | `--passWithNoTests`: zero tests discovered reads as a pass. |
| `stub-test-script` | HIGH | A `test` script that only echoes and exits 0. npm's default stub, which exits 1, is not flagged. |
| `only-focus` | HIGH | `.only(` in a test file, which silently skips its siblings in runners that honor it. |
| `skipped-test` | MEDIUM | `.skip(`, `xit(`, `test.todo(`, `{ skip: true }`, `@pytest.mark.skip`, `@unittest.skip`. |
| `set-plus-e` | MEDIUM | `set +e` in a shell script. |

A lead is not a finding. On morluto/rea at `c07ab4b` it reported 5 HIGH leads, and reading each one by hand showed none was a defect: four `continue-on-error` steps only record timings or diagnostics, and the `.only(` is a fixture string in a test that checks the lint rule against focused tests. The scanner also flags its own test file, which contains these patterns on purpose.

## Step 3: Trace what actually runs

From the command a person or CI runs, follow it down: the package script, the runner, its discovery rule (a glob or a file list), the files. Then check both directions:

- **Every test file on disk is run, once per intended configuration.** List them with `find`, and compare with what the runner reports it ran (`pytest --collect-only -q`, `vitest list`, `jest --listTests`, or the runner's verbose output). A file the runner never picks up is a silent gap.
- **A missing test turns the run red.** In a copy, delete one required test file and run the command. Exit 0 means the suite cannot notice a lost test.
- **CI:** which triggers and path filters select the job, and whether its failure blocks anything. A repo with no CI is a fact to report, not a defect.

To read a pipeline's real exit code, do not trust `cmd | tail -5; echo $?` (that prints tail's). Use `set -o pipefail`, or `${PIPESTATUS[0]}` in bash, `$pipestatus[1]` in zsh.

## Step 4: Settle each suspicion with a mutant

For each lead and each green test you doubt:

1. Write down the behavior the check claims to protect.
2. In a worktree (`git worktree add <scratch>/audit HEAD`) or a copy, break exactly that behavior in the smallest way: flip a comparison, return early, drop a write.
3. Run the check. Caught means a non-zero exit with a failure message about the broken behavior, not an unrelated crash. Not caught is a defect.
4. Remove the worktree.

This is how a test that only repeats its mock, imports dead code, or swallows a subprocess failure shows up. A mutant that changes nothing observable (an equivalent mutant) proves nothing either way; replace it with one that does.

## Step 5: Classify

- **Reproduced defect:** a mutant survived, or a masked failure was demonstrated. Give the command and the observed exit code.
- **Supported cost:** slow or noisy, but shown to catch something.
- **Hypothesis:** suspicious, not reproduced yet.
- **Unavailable evidence:** needs a host, credential, or service you do not have. NOT RUN.

A failure that already exists on main is still a finding.

## Step 6: Speed, only if asked

Compare equivalent completed work: the same tests discovered, the same assertions run. Report setup, execution, and waiting separately, with repeats (`experiment-discipline` has the benchmarking method). A faster run that skips a case is smaller, not faster. Prefer removing proven duplicate setup over cutting coverage.

## Step 7: Fix, only if authorized

Make the smallest change where the problem lives. Each fix comes with a check that fails on the baseline for the right reason, and the surviving mutant from Step 4 now caught. Then `verify-before-done`.

## Report

| Finding | Class | Evidence (command, observed exit, file:line) | Consequence | Proposed fix |
|---------|-------|----------------------------------------------|-------------|--------------|

Under the table: the baseline pin, the scanner's lead count against confirmed defects, and what was not exercised. Stop when the authorized work is verified or the remaining benefit is speculative.
