# Standing decisions: skills-graph
SPEC: the run prompt of 2026-09-28 (phases 0 to 5, summarized in PROGRESS.md)   Branch: feat/skills-graph   Written: 2026-09-28

Task class (Step 0): machine-checkable for phases 1, 2 and 3 (each has runnable acceptance commands). Phase 5 is a written evaluation with a checkable procedure (clone to /tmp, scan, record the SHA, install nothing). Phase 4 and any styling are taste-based and do not run unattended.

## Decide yourself
- Implementation approach within a phase
- File layout and naming inside viz/
- Refactors confined to files the phase already touches, and inside viz/
- Adding tests and fixtures
- Fixing bugs in code the build owns
- Up to two fix rounds per phase
- Creating a new branch from HEAD, including stacked branches
- Schema field names, layout algorithm, node sizing
- Graph library: Cytoscape.js or React Flow, recorded with decision-records
- The rule for detecting a defer edge, documented in viz/

## Stop and ask
- Merging to main
- Deploying to production, enabling GitHub Pages, or deploying anything
- Weakening, skipping, or deleting any test or acceptance criterion, for any reason
- Anything irreversible in git: stash, reset, checkout of an existing branch, force push, history rewriting, deleting tracked files
- Adding, removing, or upgrading a dependency, except the chosen graph library and a dev-only Playwright (and Playwright only if it is already available; otherwise ask first)
- Installing, running, or enabling any third-party monitor or app
- Spending money or anything that needs credentials
- Any product decision about what a feature should do, as opposed to how it does it
- Any visual or aesthetic decision beyond a plain default (system font, neutral background, no custom palette, no animation)
- Touching secrets or env configuration, ~/.claude, or settings.json
- Touching the portfolio repo
- Work outside the repo, except the phase 5 clones into /tmp
- Anything not in the SPEC

## Scope
- Write only under viz/, plus PROGRESS.md, STANDING-DECISIONS.md, docs/decisions/, and one new section in README.md.
- Never modify an existing SKILL.md, agents/, hooks/, contexts/, ponytail/, impeccable/, or skill-creator/.

## Run-specific authorizations
- docs/decisions/ may be created for the graph-library record. decision-records normally asks before creating the directory; the run prompt names that directory in scope and says to record the choice with decision-records.
- Phase 5 may clone three named repos into /tmp and read them. Nothing from them is installed or executed.
- Review gates after phases 1 and 3: adversarial-review dual mode with ts-reviewer and silent-failure-hunter as the two reviewers, CRITICAL and HIGH findings only, at most two fix rounds per gate.

## Changes approved by the author on 2026-09-28 (answers to Q1 to Q5)
- Q1: Playwright approved as a dev-only dependency under viz/ with its own package.json, pinned exactly, viz/node_modules gitignored, using the cached browsers (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1). The portfolio repo's copy is not to be used.
- Q2: SCOPE extended for one file: LESSONS.md at the repo root.
- Q3: skill-to-agent and agent-to-agent edges approved; every edge carries a kind so the page can filter by it.
- Q4: eval status comes only from a score stated in that skill's own SKILL.md; ponytail stays unmeasured; viz/README.md notes that vendored skills may carry upstream claims the graph does not verify.
- Q5: the scanner's missing Rust coverage is not fixed in this run; it is recorded in LESSONS.md and PROGRESS.md for its own branch.
