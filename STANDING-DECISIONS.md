# Standing decisions: wiring and gap skills
SPEC: the run prompt of 2026-09-29 (Track A: chore/wire-skill-references; Track B: feat/gap-skills)   Written: 2026-09-29
The previous run's contract (skills-graph, 2026-09-28) is in the git history of this file.

Task class (Step 0): Track A is machine-checkable (extractor exit code, isolated-node count, edges with file and line, test suites). Track B writes skills from evidence; each skill's eval is checkable against a no-skill baseline, but whether the evidence is sufficient is a judgment that stops for the author when evidence is missing.

## Decide yourself
- Implementation approach within a phase
- File layout and naming inside a new skill's directory
- The wording and placement of each Track A cross-reference, in that skill's own voice
- Eval tasks, assertions, and fixtures for Track B, drawn from this repo
- Adding tests and fixtures; fixing bugs in code the run owns
- Up to two fix rounds per phase
- Creating a new branch from HEAD or from origin/main as the run prompt names

## Stop and ask
- Any B4 (external-data) or B5 (parametric) work before the author supplies evidence
- B3 (debugging) beyond gathering what exists: the author must supply the Stage A session
- Writing a Track B skill whose evidence does not exist in this repo or this session
- Any change to another skill's content beyond the one-sentence cross-references in Track A
- Installing anything; spending money or needing credentials
- Pushing Track B; merging any PR
- Touching ~/.claude or anything outside the repo
- Weakening, skipping, or deleting any test or acceptance criterion
- Anything irreversible in git: stash, reset, checkout of an existing branch, force push, history rewriting, deleting tracked files
- Anything not in the SPEC

## Scope
- Track A: one cross-reference sentence per listed SKILL.md (literature-review, scholar-evaluation, query-to-corpus, experiment-discipline, skill-audit, phased-build, verify-before-done, recruiter-demo-writer, scroll-world), one commit per file, plus the regenerated viz/data/graph.json and these two run files. families.json untouched.
- Both tracks: LESSONS.md at the repo root, because the run prompt says to run capture-lessons at the end of each track.
- Track B: new skill directories, their evals (run in the session scratchpad), viz/scripts/families.json entries, and the regenerated graph.

## Changes approved by the author on 2026-09-29 (answers after B1)
- The viz packing fix and the measured-node test changes go on their own branch off main, fix/viz-measured-and-packing (PR #7), with viz/README.md updated in the same commit, and scroll-world's local line recorded in README.md there. Not on this branch.
- Merge order: PR #6 (merged by the author), then PR #7, then feat/gap-skills last. feat/gap-skills regenerates viz/data/graph.json and both screenshots as its final commit, after the other two are in main.
- Acceptance commands use `node --test` on the viz test files instead of `npm test`, which writes logs to ~/.npm/_logs. Track A's wording is not changed.
- spec-writing stays in build-discipline, and its "measured: 90%" note stays as written.
- B2 (visual-loop) may start.

## Changes approved by the author on 2026-09-29 (answers after B2)
- Q7: the edge-routing fix goes into PR #7 as its own commit, with a test that fails without it.
- Q6: writing the decided values into the viz checks is its own branch later, fix/viz-checks-assert-decided-values, after PR #7 merges. Not now.
- Q8: one-line cross-references to visual-loop in unattended-build Step 0 and spec-writing Step 5, on feat/gap-skills.
