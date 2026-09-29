# 0002: Skill discovery and the phase 1 node-count check skip node_modules

Date: 2026-09-28
Status: accepted
Deciders: the author (approved as Q6 in the skills-graph run); recorded by the session

## Context
Phase 1's acceptance compared the graph's node count with `find . -name SKILL.md -not -path "./.git/*"` plus the agents and hooks. Installing Playwright 1.63.0 under `viz/node_modules/` for the smoke test (approved as Q1) added three SKILL.md files that `playwright-core` ships (`playwright-cli`, `playwright-component-testing`, `playwright-trace`). The command then counted 33 against the graph's 30.

## Decision
The extractor skips every `node_modules` directory when it discovers skills, and the phase 1 check becomes `find . -name SKILL.md -not -path "./.git/*" -not -path "*/node_modules/*"` plus agents plus hooks. The check is a proxy for "this repo's skills", and a dependency's bundled skills are not this repo's skills.

## Alternatives considered
- Include the bundled skills in the graph so the original command matches: rejected, because it presents a dependency's skills as part of this repo.
- Keep the original command and accept the mismatch: rejected, because a check that always fails stops being read.

## Consequences
- Easier: the count check matches again (30); a dependency that ships skills cannot add nodes to the graph.
- Harder: a real skill placed inside a `node_modules` directory would be skipped. None exists.
- Risks: other dependency directories (for example a Python virtualenv inside the repo) are not skipped. If one ships SKILL.md files, the extractor and the command would both count them and still agree, so the check would not flag it.
