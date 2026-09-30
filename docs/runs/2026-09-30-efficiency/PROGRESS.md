# Progress: measure efficiency, then fix routing
Updated: 2026-09-30 15:20 EDT (from `date`)   Branch: ark-skills feat/efficiency; ark-console feat/efficiency   Last commit: ark-console d6cb492

## SPEC summary
Phase 1 usage attribution in ark-console's indexer (tokens by project, session, subagent type, skill; share above 150k context; share in sessions over 8 hours; the skills and agents view), Phase 2 plain tables on the page, Phase 3 routing audit of ark-skills agents with a settings fragment proposed, Phase 4 a before and after experiment (six runs), Phase 5 a draft model-routing skill then STOP, Phase 6 report; separately, a read-only vet of weave-os/router. Nothing pushed.

## Now
Phase 5 done (a draft skill); STOP per the SPEC. Phase 6: verify-before-done, then the report.

## Done and verified
- Premises, 2026-09-30 14:18 EDT: ark-console had no src/ (code in lib/, public/, scripts/); docs/UI.md is present and untracked (for the console-v2 run); both repos in sync with origin. ~/.claude/projects: 225 .jsonl files, 199 of them subagent transcripts, each subagent with a .meta.json naming agentType (175 general-purpose, 14 silent-failure-hunter, 10 Explore). Skill use is recorded as assistant tool_use blocks named "Skill" with input.skill; Agent calls are tool_use blocks named "Agent" (168; subagent_type general-purpose 130, missing 14, silent-failure-hunter 14, Explore 10). User-typed slash commands appear as <command-name> tags (only /model, 19 times). Dollars: 8 transcripts have a cost-state line with a cumulative totalCostUSD and no timestamp, so dollars cannot be placed in a time window. Eval scores: spec-writing/SKILL.md line 109 ("90% ... without it, 70%") and visual-loop/SKILL.md line 71 ("100% ... without it, 7 of 15"); viz/scripts/build_graph.py reads only the score, with its EVAL_SCORE pattern.
- ark-skills agents/: silent-failure-hunter.md and ts-reviewer.md, both model: opus. Agents referenced by skills: skill-creator/agents/{grader,analyzer,comparator}.md (no frontmatter), and built-in types named in SKILL.md files.

- Phase 1, ark-console d603781 (lib/usage.js, the snapshot's usage field, indexer --now). `bash scripts/accept-usage.sh` (fixed time 2026-09-30T18:00:00Z), run at ark-console 863d0d3 (lib/ as in d603781) from 14:52:23 to 14:52:28 EDT: exit 0, valid JSON, a 24-line text summary naming both windows; last 24 hours per-project sum 850,783,005 = total 850,783,005, per-source sum equal; last 7 days per-project sum 3,113,044,200 = total 3,113,044,200, per-source sum equal; sessions without usage 0 of 5 and 0 of 14, assistant messages without usage 0, sessions without a project 0; a second run: 0 lines different (JSON and summary); ~/.claude files changed while it ran: 1, this session's own transcript (control interval: 0); with every write outside ark-console denied by sandbox-exec: exit 0, 0 lines different, and the same rule refused `mktemp -d` (its stderr, tmp/accept-usage/probe.err from this run: "mktemp: mkdtemp failed ... Operation not permitted"; nothing created). Tests 54 of 54; `node scripts/mutants.js` 72 mutants, each caught, every test fails under at least one. `bash scripts/accept-phase2.sh` and `node scripts/accept-phase4.js` (both adjusted for the clock-dependent usage report) pass: 0 lines different on a second indexer run with --now, endpoint vs indexer 0 differences.
- Hand check (addendum acceptance): experiment-discipline, raw transcript lines holding a Skill tool_use with input.skill "experiment-discipline", listed with grep and read one by one: 6 lines, at 2026-09-29T13:33:47Z, 13:47:11Z, 13:51:06Z, 15:08:49Z, 2026-09-30T04:31:32Z, 04:35:34Z (files under -Users-armaank019-dev-untitled-folder: f1fabc23... lines 28 and 55, fe7455f7... lines 50 and 1419, and two of its subagents). In the 24 hours to 18:00Z: 2 by hand, 2 reported. In the 7 days: 6 by hand, 6 reported.
- Phase 1 gate review (one fresh-context reviewer, opus): 5 HIGH, all fixed in one round and each covered by a test and a mutant. 1) subagent transcripts write usage as a message streams, so output_tokens grows line to line (2,296 subagent messages; 0 in session transcripts): the first line undercounted output; now the last line written by the report time (also in the indexer's older usageOf). 2) plugin-prefixed skill names did not match. 3) cost lines, malformed lines, file counts, and the first cwd could change with writes after --now. 4) the snapshot read the clock twice, and the old acceptance scripts compared clock-dependent usage. 5) the acceptance probe's mktemp wrote outside the repo. Nits not fixed (listed): scanCache never drops deleted files; the first build reads about 427 MB synchronously inside the server; two projects with the same folder name print alike in the text summary (the JSON has the path).
- Found while checking finding 1: subagent output tokens are a lower bound even on the last line: 106 subagent messages with 10,000 or more characters of text or tool input record under 100 output tokens (the largest, 49,819 characters, records 8). Recorded in FORMAT.md and in the report's definitions.
- Router (SPEC "Separate, read-only"), ark-console 863d0d3, docs/ROUTER-EVAL.md: weave-os/router cloned (depth 1) to /tmp/weave-router-vet at 59093f9386b397486d38585f3e22a336e06a37e0, scanned (HIGH 377, MEDIUM 317, 165 domains), read by an opus subagent, main claims checked by the session against the clone (hosted default, settings.json rewrite deleting apiKeyHelper and ANTHROPIC_AUTH_TOKEN, refresh token upload, 7-day unpinned self-update, subscription token forwarding, plaintext keys by default), then the clone deleted (`ls` shows it gone). Verdict: reject. It can front Claude Code on a subscription for Claude-model turns only; every other turn is paid per token.

- Phase 3 (routing audit), this commit: docs/runs/2026-09-30-efficiency/ROUTING.md holds the table (agent, where defined, who references it, current model, observed runs, recommended model, reason) and the settings source. Agent files: agents/silent-failure-hunter.md `model: opus`, agents/ts-reviewer.md `model: opus`; changed: none (both are reviewers). `git diff --stat main` in ark-skills shows only docs/runs/2026-09-30-efficiency/ (checked at the Phase 3 commit).

- Phase 2, ark-console d6cb492: the Usage section (plain tables, no new CSS). `node scripts/check-page.js` at 15:18 EDT: 262 checks passed, on three snapshots (the fixture; an empty one; one whose only session recorded no usage). Every cell and caption of every usage table is compared with the JSON through formatting rules written in the check; the fixture's no-usage session renders an en dash titled "not recorded" (never 0) and captions read "1 of 5 sessions had no usage recorded; 2 assistant messages had none". 18 single-change mutants of the section each fail the check (list in the commit). Tests 55 of 55; `node scripts/mutants.js` 75 mutants, each caught.
- Phase 2 gate review (one fresh-context reviewer, opus): 3 HIGH, fixed in one round: a window whose sessions recorded no usage rendered 0s (fixed at the source: lib/usage.js reports null totals, sources, and sums, and no dollar total without a cost line; U17); By session and By project did not state their own absent counts; the page check compared only the Tokens row (six of the reviewer's mutations passed it; all six now fail). Nits fixed with them: "1 sessions", names containing "not recorded" mangled, agents with no invocation in the window showed a dash titled "not recorded", the usage report's unreadable files were not listed. Nits left: captions in local time beside a never-used note in UTC; durations round to the minute; the usage tables do not get round 1's density rules (plain defaults, as the SPEC says).
- Phase 4, ark-skills 35ec739 (card, before any run) and bb17388 (ledger): six runs of one grading task (8 assertions with known answers on an exported copy of ark-console d603781), interleaved: current default (no model, inherits claude-opus-5-5) and proposed (model sonnet, ran as claude-sonnet-5). Verdicts: 8 of 8 in all six. Reply format: opus 3 of 3 as asked (JSON only); sonnet 0 of 3 (all added notes after the JSON). Notice subagent_tokens: opus median 47,798 (43,093 to 52,990), sonnet median 87,404 (64,112 to 87,729); this figure matched each run's final context plus output within 300 tokens, so it measures final context size. Transcript tokens (each message once): opus median 413,398 (390,825 to 453,277), sonnet 329,044 (328,818 to 378,778). Wall: opus median 54.5 s (50.1 to 57.1), sonnet 39.0 s (37.0 to 41.4). Verdict by the rule written in advance: the proposal does not stand (primary token measure above the baseline's range; format guardrail failed 3 of 3); no percentage reported.
- Phase 5: model-routing/SKILL.md, a draft from Phases 1 to 4 (how to decide a subagent's model, when to start a fresh session, what an eval costs and when not to run one, how to check with ark-console), every number with its window and source. Checked with viz/scripts/build_graph.py's own find_eval: "unmeasured" (the draft states no eval result), origin line present, 0 em dashes, ASCII only. Not evaluated, per the SPEC. viz/data/graph.json not regenerated (not in this SPEC's scope).

## In flight
- none

## Open questions
- Q1: May the run fetch Claude Code's documentation to verify `CLAUDE_CODE_SUBAGENT_MODEL` and the settings `env` key? Triggered by: "any network call" (stop and ask) against Phase 3's "verified against Claude Code's current documentation". Blocks: nothing; the frontmatter route is proposed first and the variable is marked NOT VERIFIED. Raised: the Phase 6 report.
- Q2: Is Opus 5.5 the strongest model available for judgment work, or Fable 5.1? Triggered by: the rule "judgment work gets the strongest available" and no measurement comparing them. Blocks: nothing (both reviewer agents stay on opus). Raised: the Phase 6 report.

## Proposal for the author: subagent routing (Phase 3)
Not applied. Nothing here edits ~/.claude/settings.json.

1. Per-agent route (the SPEC's fallback, because the variable name could not be checked against documentation without a network call):
   - Keep `model: opus` in agents/silent-failure-hunter.md and agents/ts-reviewer.md.
   - Pass `model: opus` on the Agent calls that spawn reviewers in adversarial-review, unattended-build, and phased-build, and on skill-creator's comparator and analyzer; pass `model: sonnet` on skill-creator's grader. These are edits to existing skills' bodies (stop-and-ask), so they are proposed, not made.
   - Optionally, a named grader agent so the grader's model lives in one frontmatter line (proposed file, not created):
     ```
     ---
     name: grader
     description: Grades a list of assertions against given files or outputs and returns JSON with a verdict and one line of evidence per assertion. Use for mechanical checking, not for judging quality.
     tools: Read, Grep, Glob, Bash
     model: sonnet
     ---
     ```
2. Settings route, NOT VERIFIED against documentation. Fragment for ~/.claude/settings.json:
   ```json
   {
     "env": {
       "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet"
     }
   }
   ```
   Source for the name: the installed Claude Code 2.1.282 binary (/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe) contains `function tre(){let e=a.CLAUDE_CODE_SUBAGENT_MODEL;return e&&e!=="inherit"?e:"inherit"}`, read locally with `strings`. The `env` key of settings.json is from memory. Before applying it: the reviewer calls in item 1 must pass `model: opus`, because 36 of 43 review runs asked no model and got opus only by inheriting it; whether the variable overrides a pinned frontmatter model is not shown by what was read.
3. The Phase 4 experiment measures item 2's effect on one mechanical workload.

## Decisions
- Readings of the SPEC (src/, branches, network, Phase 0 models, gate reviews, lessons, Phase 4 routing) are in STANDING-DECISIONS.md.

## Models used (Phase 0)
- Main session: claude-opus-5-5 (this session's model; not chosen by the run).
- Phase 1 gate reviewer: opus (review is judgment). 153,792 tokens, 36 tool uses, 668 s (from the task notification).
- Router vet reader: opus (a security vet is judgment). 419,456 tokens, 123 tool uses, 841 s.
- Phase 2 gate reviewer: opus. 142,396 tokens, 32 tool uses, 550 s.
- Phase 4 experiment runs: three with no model (inherited claude-opus-5-5) and three with model sonnet (claude-sonnet-5), by design; figures in experiments.md.
- No subagent ran at sonnet outside the experiment: every other subagent in this run was a review or a vet, which the rule gives the strongest model.

## Next action
Phase 6: run verify-before-done on both branches, capture-lessons into this directory, then write the report section below Done and verified.
