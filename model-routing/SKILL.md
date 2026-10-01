---
name: model-routing
description: Decide which model a subagent runs on, when to end a long session and start a fresh one, and whether an eval is worth its cost, using the token counts ark-console reads from the transcripts. Use before spawning subagents for a run, when choosing a model for a named agent or a settings default, when a session has run for hours or its context is past 150k, before running a skill-creator eval, or when asked "why is usage so high" or "which model should this agent use".
---

# Model Routing

Where the tokens go decides what is worth changing. On this machine the answer was not where it looked: most tokens were cache reads of long contexts, re-read on every turn, and the subagent model mattered less than how long the context had grown.

Written for this repo from the efficiency run of 2026-09-30 (ark-skills `docs/runs/2026-09-30-efficiency/`: PROGRESS.md, ROUTING.md, experiments.md) and ark-console's usage report (`lib/usage.js`). Every number below comes from that run; each names its window and source. This draft has not been evaluated; that is a separate decision.

## When not to use it

- A one-off question in a short session. The overhead of routing is not worth it below a few subagents.
- Choosing a model for a skill-creator eval's test runs. An eval measures a skill on a model; the model is part of the question, not a cost choice (step 1).

## Step 1: Decide a subagent's model by the kind of work, and pass it on the call

The rule: mechanical work (running commands, collecting output, grading assertions against a known answer, file search) goes to the cheapest model shown to do it; judgment work (review, planning, evaluating a paper, a design, or a quality comparison) goes to the strongest available.

- **Pass the model on the Agent call.** A general-purpose subagent with no model inherits the main session's. In the 7 days to 2026-09-30 18:00 UTC, 94 of 145 general-purpose calls passed no model; all 16 grading runs, and 39 of the 61 review runs (descriptions containing review, gate, re-review, full-diff, or fresh review), got opus only by inheriting it (ROUTING.md, "The same counts in the 7 days"). Change the default without changing the calls, and reviews quietly move to the cheaper model.
- **Named agents carry their model in frontmatter.** `agents/silent-failure-hunter.md` and `agents/ts-reviewer.md` pin `model: opus`, because both review.
- **"Cheapest that can do it" is a measurement, not a guess.** In the run's experiment (experiments.md, 3 runs per arm, interleaved), a sonnet grader got all 24 verdicts right, as opus did, but broke "reply with only a JSON array" in 3 of 3 runs; opus kept it in 3 of 3. A cheaper grader needs a reply validator (parse it, reject extra text) before it replaces the default.
- **Eval test runs use the model the skill is meant for,** on both arms. Running them cheaper changes what is measured.
- **Do not claim a saving the data does not show.** In that experiment sonnet was faster (median 39.0 s against 54.5 s) and processed fewer tokens by the transcript count (median 329,044 against 413,398), but finished with a larger context (median 87,404 against 47,798 on the harness's per-subagent figure). On a subscription, dollars per token do not apply; which of those matters is the plan's limits, which the transcripts do not record.

## Step 2: Start a fresh session before the context gets long

Every turn re-reads the whole context from cache, so a turn costs about as much as the context is long.

- In the 24 hours to 2026-09-30 18:00 UTC, main-session messages averaged 552,444 tokens each (312,131,243 tokens over 565 messages), and cache reads were 94.1% of all tokens. Peak contexts were 69,708 to 963,753 over five sessions, four of them above 300,000.
- In the 7 days to the same time, 86.8% of tokens were in messages with more than 150,000 tokens of context, and 99.7% were in sessions longer than 8 hours (10 sessions).
- So: when a session's context passes about 150k, or the work moves to a new phase, write the handoff (PROGRESS.md in `unattended-build`, the handoff in `strategic-compact`) and continue in a fresh session. A fresh session reads the handoff once instead of the whole history on every turn.
- Delegating a large read to a subagent keeps it out of the main context; the subagent's own context is discarded when it returns. That is a reason to delegate reads, separate from which model the subagent uses.

## Step 3: Know what an eval costs before running one

Measured from the subagent transcripts (each message once, its last line):

- The visual-loop eval's 9 runs (descriptions starting "B2", 2026-09-29 12:50 to 13:29 UTC): 29,286,170 tokens (experiments.md, "Eval cost").
- 16 grading runs across the evals of 2026-09-26 to 2026-09-29: 28,694,794 tokens (same entry).

Do not run an eval when:
- the SKILL.md already records a number for this version (re-running it costs as much and answers nothing new; the efficiency run's SPEC put it on the stop-and-ask list);
- the change is to wording that no assertion can tell apart;
- there is no baseline to compare with, since a number without one is an anecdote (`experiment-discipline`).

Run one when a skill's behavior changed and there are assertions that fail without the change. Put the eval's token total in the SKILL.md beside its result.

## Step 4: Check the numbers with ark-console

- `node lib/usage.js --now <ISO time with Z>` in ~/dev/ark-console prints the report as JSON on stdout and a summary on stderr: tokens for the last 24 hours and 7 days by project, session (peak context, duration), source (main session, general-purpose, each named agent), skill, and agent; the share above 150k context; the share in sessions over 8 hours; and how many sessions recorded no usage.
- The page (`node lib/server.js`, http://127.0.0.1:7777/) shows the same report under "Usage".
- Read the definitions before comparing numbers: "tokens" includes cache reads; subagent output tokens are a lower bound (the transcripts record fewer than the text they carry); a skill's tokens are the tokens of the sessions that invoked it, which overlap; dollars are not available per window.
- After a routing change, compare the same window before and after with the same `--now` rule, and look at the spread across sessions, not one session.

## Checklist before spawning subagents for a run

- Each Agent call passes a model chosen by the kind of work, and reviews pass opus explicitly.
- A cheaper model on mechanical work has a check on its output (a validator, a known answer).
- The main session's context is under about 150k, or a handoff is written and a fresh session is next.
- An eval is run only with a baseline and assertions that can fail, and its token total is recorded.
