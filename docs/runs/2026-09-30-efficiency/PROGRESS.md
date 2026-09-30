# Progress: measure efficiency, then fix routing
Updated: 2026-09-30 14:52 EDT (from `date`)   Branch: ark-skills feat/efficiency; ark-console feat/efficiency   Last commit: ark-console 863d0d3

## SPEC summary
Phase 1 usage attribution in ark-console's indexer (tokens by project, session, subagent type, skill; share above 150k context; share in sessions over 8 hours; the skills and agents view), Phase 2 plain tables on the page, Phase 3 routing audit of ark-skills agents with a settings fragment proposed, Phase 4 a before and after experiment (six runs), Phase 5 a draft model-routing skill then STOP, Phase 6 report; separately, a read-only vet of weave-os/router. Nothing pushed.

## Now
Phase 2 (SPEC "Phase 2" and the addendum's Skills section), step: the page section.

## Done and verified
- Premises, 2026-09-30 14:18 EDT: ark-console had no src/ (code in lib/, public/, scripts/); docs/UI.md is present and untracked (for the console-v2 run); both repos in sync with origin. ~/.claude/projects: 225 .jsonl files, 199 of them subagent transcripts, each subagent with a .meta.json naming agentType (175 general-purpose, 14 silent-failure-hunter, 10 Explore). Skill use is recorded as assistant tool_use blocks named "Skill" with input.skill; Agent calls are tool_use blocks named "Agent" (168; subagent_type general-purpose 130, missing 14, silent-failure-hunter 14, Explore 10). User-typed slash commands appear as <command-name> tags (only /model, 19 times). Dollars: 8 transcripts have a cost-state line with a cumulative totalCostUSD and no timestamp, so dollars cannot be placed in a time window. Eval scores: spec-writing/SKILL.md line 109 ("90% ... without it, 70%") and visual-loop/SKILL.md line 71 ("100% ... without it, 7 of 15"); viz/scripts/build_graph.py reads only the score, with its EVAL_SCORE pattern.
- ark-skills agents/: silent-failure-hunter.md and ts-reviewer.md, both model: opus. Agents referenced by skills: skill-creator/agents/{grader,analyzer,comparator}.md (no frontmatter), and built-in types named in SKILL.md files.

- Phase 1, ark-console d603781 (lib/usage.js, the snapshot's usage field, indexer --now). `bash scripts/accept-usage.sh` (fixed time 2026-09-30T18:00:00Z), run at ark-console 863d0d3 (lib/ as in d603781) from 14:52:23 to 14:52:28 EDT: exit 0, valid JSON, a 24-line text summary naming both windows; last 24 hours per-project sum 850,783,005 = total 850,783,005, per-source sum equal; last 7 days per-project sum 3,113,044,200 = total 3,113,044,200, per-source sum equal; sessions without usage 0 of 5 and 0 of 14, assistant messages without usage 0, sessions without a project 0; a second run: 0 lines different (JSON and summary); ~/.claude files changed while it ran: 1, this session's own transcript (control interval: 0); with every write outside ark-console denied by sandbox-exec: exit 0, 0 lines different, and the same rule refused `mktemp -d` (its stderr, tmp/accept-usage/probe.err from this run: "mktemp: mkdtemp failed ... Operation not permitted"; nothing created). Tests 54 of 54; `node scripts/mutants.js` 72 mutants, each caught, every test fails under at least one. `bash scripts/accept-phase2.sh` and `node scripts/accept-phase4.js` (both adjusted for the clock-dependent usage report) pass: 0 lines different on a second indexer run with --now, endpoint vs indexer 0 differences.
- Hand check (addendum acceptance): experiment-discipline, raw transcript lines holding a Skill tool_use with input.skill "experiment-discipline", listed with grep and read one by one: 6 lines, at 2026-09-29T13:33:47Z, 13:47:11Z, 13:51:06Z, 15:08:49Z, 2026-09-30T04:31:32Z, 04:35:34Z (files under -Users-armaank019-dev-untitled-folder: f1fabc23... lines 28 and 55, fe7455f7... lines 50 and 1419, and two of its subagents). In the 24 hours to 18:00Z: 2 by hand, 2 reported. In the 7 days: 6 by hand, 6 reported.
- Phase 1 gate review (one fresh-context reviewer, opus): 5 HIGH, all fixed in one round and each covered by a test and a mutant. 1) subagent transcripts write usage as a message streams, so output_tokens grows line to line (2,296 subagent messages; 0 in session transcripts): the first line undercounted output; now the last line written by the report time (also in the indexer's older usageOf). 2) plugin-prefixed skill names did not match. 3) cost lines, malformed lines, file counts, and the first cwd could change with writes after --now. 4) the snapshot read the clock twice, and the old acceptance scripts compared clock-dependent usage. 5) the acceptance probe's mktemp wrote outside the repo. Nits not fixed (listed): scanCache never drops deleted files; the first build reads about 427 MB synchronously inside the server; two projects with the same folder name print alike in the text summary (the JSON has the path).
- Found while checking finding 1: subagent output tokens are a lower bound even on the last line: 106 subagent messages with 10,000 or more characters of text or tool input record under 100 output tokens (the largest, 49,819 characters, records 8). Recorded in FORMAT.md and in the report's definitions.
- Router (SPEC "Separate, read-only"), ark-console 863d0d3, docs/ROUTER-EVAL.md: weave-os/router cloned (depth 1) to /tmp/weave-router-vet at 59093f9386b397486d38585f3e22a336e06a37e0, scanned (HIGH 377, MEDIUM 317, 165 domains), read by an opus subagent, main claims checked by the session against the clone (hosted default, settings.json rewrite deleting apiKeyHelper and ANTHROPIC_AUTH_TOKEN, refresh token upload, 7-day unpinned self-update, subscription token forwarding, plaintext keys by default), then the clone deleted (`ls` shows it gone). Verdict: reject. It can front Claude Code on a subscription for Claude-model turns only; every other turn is paid per token.

## In flight
- none

## Open questions
- none yet

## Decisions
- Readings of the SPEC (src/, branches, network, Phase 0 models, gate reviews, lessons, Phase 4 routing) are in STANDING-DECISIONS.md.

## Models used (Phase 0)
- Main session: claude-opus-5-5 (this session's model; not chosen by the run).
- Phase 1 gate reviewer: opus (review is judgment). 153,792 tokens, 36 tool uses, 668 s (from the task notification).
- Router vet reader: opus (a security vet is judgment). 419,456 tokens, 123 tool uses, 841 s.

## Next action
Write ark-console lib/usage.js and wire it into lib/indexer.js; then the acceptance commands for Phase 1.
