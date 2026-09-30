# Progress: measure efficiency, then fix routing
Updated: 2026-09-30 14:18 EDT (from `date`)   Branch: ark-skills feat/efficiency; ark-console feat/efficiency   Last commit: none yet

## SPEC summary
Phase 1 usage attribution in ark-console's indexer (tokens by project, session, subagent type, skill; share above 150k context; share in sessions over 8 hours; the skills and agents view), Phase 2 plain tables on the page, Phase 3 routing audit of ark-skills agents with a settings fragment proposed, Phase 4 a before and after experiment (six runs), Phase 5 a draft model-routing skill then STOP, Phase 6 report; separately, a read-only vet of weave-os/router. Nothing pushed.

## Now
Phase 1 (SPEC "Phase 1" and the addendum), step: writing lib/usage.js.

## Done and verified
- Premises, 2026-09-30 14:18 EDT: ark-console had no src/ (code in lib/, public/, scripts/); docs/UI.md is present and untracked (for the console-v2 run); both repos in sync with origin. ~/.claude/projects: 225 .jsonl files, 199 of them subagent transcripts, each subagent with a .meta.json naming agentType (175 general-purpose, 14 silent-failure-hunter, 10 Explore). Skill use is recorded as assistant tool_use blocks named "Skill" with input.skill; Agent calls are tool_use blocks named "Agent" (168; subagent_type general-purpose 130, missing 14, silent-failure-hunter 14, Explore 10). User-typed slash commands appear as <command-name> tags (only /model, 19 times). Dollars: 8 transcripts have a cost-state line with a cumulative totalCostUSD and no timestamp, so dollars cannot be placed in a time window. Eval scores: spec-writing/SKILL.md line 109 ("90% ... without it, 70%") and visual-loop/SKILL.md line 71 ("100% ... without it, 7 of 15"); viz/scripts/build_graph.py reads only the score, with its EVAL_SCORE pattern.
- ark-skills agents/: silent-failure-hunter.md and ts-reviewer.md, both model: opus. Agents referenced by skills: skill-creator/agents/{grader,analyzer,comparator}.md (no frontmatter), and built-in types named in SKILL.md files.

## In flight
- none

## Open questions
- none yet

## Decisions
- Readings of the SPEC (src/, branches, network, Phase 0 models, gate reviews, lessons, Phase 4 routing) are in STANDING-DECISIONS.md.

## Models used (Phase 0)
- Main session: claude-opus-5-5 (this session's model; not chosen by the run).

## Next action
Write ark-console lib/usage.js and wire it into lib/indexer.js; then the acceptance commands for Phase 1.
