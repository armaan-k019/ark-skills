# Progress: skills-graph
Updated: 2026-09-28 03:18 EDT   Branch: feat/skills-graph (from origin/main cd423eb, upstream unset so nothing pushes to main)   Last commit: cd423eb

## SPEC summary
Static page in viz/ that visualizes this repo: every skill, agent, and hook as a node, clustered by family, with defer/reference edges, hook coverage, license origin, and eval status, all generated from files. Plus viz/MONITOR-EVAL.md, a vetted recommendation (no install) for a live Claude Code session monitor. Phases: 0 setup, 1 extractor, 2 tests, 3 page (function only), 4 STOP for visual design, 5 monitor evaluation. Review gates after phases 1 and 3.

## Now
Phase 0 (setup), step: contract files written; reading done

## Done and verified
- Phase 0 reading: 25 SKILL.md files (`find . -name SKILL.md -not -path "./.git/*" | wc -l` printed 25), 2 files in agents/, 5 .js files in hooks/ of which 3 are registered hooks in hooks/settings.example.json (config-protection, no-em-dash, block-no-verify); _input.js is a shared helper and test-hooks.js is the test runner. licenses/ECC-LICENSE lists the ECC-derived files.

## In flight
- none

## Open questions
- Q1: Playwright is not available to this repo. Triggered by: stop-and-ask "a dev-only Playwright ... ask first if it is not already available", plus "touching the portfolio repo". Observed: no global npm package, no python package, no `playwright` on PATH; Chromium 1243 browsers are cached in ~/Library/Caches/ms-playwright; the only npm copy is ~/dev/my-portfolio/node_modules/playwright. Options: (a) approve `npm install -D playwright` under viz/ (network, adds viz/package.json and a lockfile); (b) approve importing the portfolio's copy (touches the portfolio repo); (c) something else. Blocks: phase 3 acceptance (smoke.mjs run and viz/screenshot.png), so phase 4 materials will lack the screenshot. Raised: not yet.
- Q2: capture-lessons writes LESSONS.md at the repo root, which is outside SCOPE. Triggered by: stop-and-ask "any change to files outside SCOPE". Plan: record lessons in this file under Lessons and ask whether to move them. Blocks: nothing. Raised: not yet.

## Decisions
- Branch created with `git checkout -b feat/skills-graph origin/main` because local main was behind the PR #2 merge; upstream then unset so a bare `git push` cannot target main.
- A hook node is a script registered in hooks/settings.example.json. _input.js (shared helper) and test-hooks.js (test runner) are not hooks. So the phase 1 node-count check is 25 skills + 2 agents + 3 hooks = 30.

## Next action
Commit phase 0 (STANDING-DECISIONS.md, PROGRESS.md), then write viz/scripts/build_graph.py and run the phase 1 acceptance commands.
