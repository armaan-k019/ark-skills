---
name: verify-before-done
description: Run the project's real checks (build, typecheck, lint, tests, diff review) and report their actual output before claiming a coding task is done. Use this skill before saying a feature, fix, or refactor is complete, before committing a finished step, before opening a PR, and whenever a prompt asks for "tsc + build verification". Also use when asked "is this done?", "does it work?", or "ready to merge?".
---

# Verify Before Done

A task is not done because the code looks right. It is done when the project's own checks have run on the changed code and passed, and the diff contains only what the task asked for. This skill is the procedure for proving that, and for reporting it without inflating anything.

Adapted from ECC's `verification-loop` skill (MIT, see `licenses/ECC-LICENSE`). Changes from the original: checks are discovered from the project instead of assumed, the coverage threshold and whole-repo grep scans were dropped, and the report format forbids claiming a check that was not run.

## The one rule

Never report a check as passing unless you ran it in this session, after the last edit, and saw it pass. If a check was not run, could not run, or has no script in this project, the report says `NOT RUN` and why. "Should pass", "likely passes", and "passed earlier" are not results.

## Step 1: Discover the checks

Do not guess commands. Read what the project defines:

- `package.json` `scripts`: look for `build`, `typecheck`, `lint`, `test`. Detect the package manager from the lockfile (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`) and use it.
- No `typecheck` script but a `tsconfig.json`: use `npx --no-install tsc --noEmit -p <the tsconfig that owns the changed files>`.
- Python: `pyproject.toml`, `setup.cfg`, `pytest.ini`, `ruff.toml`. Only run `ruff`, `pyright`, `mypy`, or `pytest` if the project configures or depends on them.
- A `CLAUDE.md` or README that names the verification commands overrides everything above.

If the project has no checks at all for a category, record that. Do not invent one.

## Step 2: Run them in order, stop on the first hard failure

1. **Build.** If it fails, stop, fix, and restart from step 1 of this list.
2. **Typecheck.** Every error in a changed file is a failure. Errors only in untouched files: report them as pre-existing, with the count, and confirm the count did not go up.
3. **Lint.** Errors fail. Warnings are reported, not fixed, unless they are in lines you changed.
4. **Tests.** Run the suite, or the subset covering changed files if the full suite is slow and the project documents how to target tests.

Capture the exact command and the last lines of output for each. Pipe long output through `tail -n 40` so the report quotes real text.

Fixing a failure never means weakening the check: no editing `tsconfig`, eslint, prettier, or ruff config to make errors disappear, no `// @ts-ignore`, `eslint-disable`, `# type: ignore`, or `any` casts added to silence a check, and no skipping or deleting tests. If the check itself is wrong, stop and ask.

## Step 3: Review the diff against the task

Run `git diff --stat` and `git diff` (plus `git diff --cached` if anything is staged). For each changed file, answer:

- Did the task ask for this change? Unrequested edits (reformatting, renames, "while I was here" refactors) are flagged, not silently kept.
- Any debug leftovers: `console.log`, `print(`, commented-out code, TODO added in this change?
- Any secret-looking strings added in this diff (keys, tokens, `.env` values)? Check the diff only, and never print a secret's value in the report: name the file and line.
- Any em dash (U+2014) added in prose, comments, or commit messages? Replace with a comma, colon, period, or parentheses.

## Step 4: Report

Use exactly this shape. Every PASS line must be backed by output you saw.

```
VERIFICATION
Build:     PASS | FAIL | NOT RUN (reason)   <command>
Typecheck: PASS | FAIL (n errors) | NOT RUN (reason)   <command>
Lint:      PASS | FAIL (n errors, m warnings) | NOT RUN (reason)   <command>
Tests:     PASS (x/y) | FAIL (x/y) | NOT RUN (reason)   <command>
Diff:      n files changed; unrequested changes: none | <list>

Verdict:   DONE | NOT DONE
Open issues:
1. ...
```

`DONE` requires every check that exists in the project to be PASS and no unrequested changes. Anything else is `NOT DONE`, and the open issues say what is left. A `NOT DONE` report with the real reason is a correct outcome; a `DONE` report that skipped a check is not.

## When to run it

- Before claiming any coding task is complete.
- Before each commit in a multi-step prompt that asks for per-step commits.
- After a refactor, even a "safe" one.
- After resolving a merge conflict.
