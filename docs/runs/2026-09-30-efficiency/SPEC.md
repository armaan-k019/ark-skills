# Run: measure efficiency, then fix routing

Autonomous run. Model: opus, but see Phase 0. Repos: ~/dev/ark-console (extend) and
~/dev/ark-skills (branch feat/efficiency). Skills: unattended-build (governs), experiment-discipline
(governs every number in this run), verify-before-done, decision-records, capture-lessons.

PROGRESS.md and STANDING-DECISIONS.md go in ~/dev/ark-skills/docs/runs/2026-09-30-efficiency/.

## Why

Anthropic's own usage panel says 63% of the last day's usage came from unnamed general-purpose
subagents, 93% from subagent-heavy sessions, 87% at over 150k context, 81% from sessions running 8
hours or more. Those are the panel's numbers, not mine, and they are a day's snapshot. This run
builds the measurement first, changes routing second, and measures again, so any claim of
improvement has a baseline.

## Phase 0: cheap by construction

Run this session's own subagents at sonnet unless a step needs judgment. State in PROGRESS.md which
steps used which model and why. This run is about cost; it should not be the most expensive one yet.

## Scope

- ~/dev/ark-console: new code under src/ and test/, docs/.
- ~/dev/ark-skills: agents/*.md frontmatter, one new skill directory if Phase 5 is reached,
  docs/runs/2026-09-30-efficiency/.
- Read-only everywhere else, including ~/.claude.
- Never edit ~/.claude/settings.json. Propose the exact JSON in PROGRESS.md for me to apply.

## Stop and ask

Editing ~/.claude/settings.json, installing anything, any network call, changing an existing skill's
body, re-running an eval that already has a recorded number, spending money.

## Phase 1: cost attribution in ark-console (commit)

Extend the indexer with what the transcripts actually record about usage. docs/FORMAT.md already
says which fields exist; read it first and extend it with what you find about token counts,
including subagent entries.

Produce, for the last 7 days and the last 24 hours:
- tokens by project
- tokens by session, with each session's peak context and duration
- tokens by subagent type, with general-purpose broken out and named agents listed separately
- tokens by skill invoked, where the transcript records it
- share of tokens spent above 150k context
- share of tokens in sessions longer than 8 hours

Rules: every number comes from the files. If a field is absent for some sessions, report the count
of sessions it was absent for beside the total, and never extrapolate. Cost in dollars only where a
transcript records it; otherwise report tokens and say dollars are NOT AVAILABLE.

ACCEPTANCE:
  the command exits 0 and prints JSON and a text summary
  totals reconcile: per-project tokens sum to the overall total; state both numbers
  it reports how many sessions lacked usage fields
  running it twice gives identical output for a fixed time window
  it writes nothing outside ark-console (prove with a before and after listing of ~/.claude)

## Phase 2: the efficiency view (commit)

Add a page section to ark-console: the Phase 1 numbers as plain tables, newest window first. Plain
defaults only, no styling beyond what the page already has. Every table states its window and its
"absent field" count.

ACCEPTANCE: the page check asserts the rendered totals equal the JSON, and a fixture with missing
usage fields renders the absent count rather than zero.

## Phase 3: routing audit and proposal (commit in ark-skills)

Audit every agent in ~/dev/ark-skills/agents/ and every agent referenced by a skill: does it pin a
model, and is that model justified by what the agent does? Produce a table: agent, current model,
recommended model, reason.

My rule, which you should apply and may argue against with evidence: mechanical work (running
commands, collecting output, grading assertions, file search) goes to the cheapest model that can do
it; judgment work (review, planning, evaluating a paper or a design) gets the strongest available.

Then propose, in PROGRESS.md, the exact settings.json fragment for a cheaper subagent default, with
the env var name verified against Claude Code's current documentation, not memory. If you cannot
verify the name, say so and propose the per-agent frontmatter route instead.

ACCEPTANCE:
  every agent file lists a model after this phase; state which changed
  the proposal quotes its source for the setting name
  no file outside agents/ and the run directory changed

## Phase 4: measure the change (commit)

Define one fixed workload that is representative and cheap: a single defined task run end to end
(for example, a small code-review pass on a known diff). Run it before and after the routing
changes, three times each, and report per experiment-discipline: the command, the model routing in
effect, tokens, wall time, median and spread, and whether output quality differed.

If the workload is not cheap enough to run six times, say so and pick a smaller one. If the
difference is inside the spread, say that the change did not measurably help; do not report a
percentage that the data does not support.

ACCEPTANCE: six runs recorded in docs/runs/2026-09-30-efficiency/experiments.md, with the ledger
format from experiment-discipline, and a verdict that names the spread.

## Phase 5 (only if Phases 1 to 4 are done): draft the routing skill, then STOP

Draft ark-skills/model-routing/SKILL.md from what Phases 1 to 4 actually showed, not from general
advice. It should say: how to decide a subagent's model, when to start a fresh session instead of
continuing, what an eval costs and when not to run one, and how to check the numbers with
ark-console. Cite the measured values. Do not eval this skill in this run; that is its own decision.

Then STOP and report.

## Phase 6: report

Include: the Phase 1 tables, the routing table, the Phase 4 experiment result with its spread, the
settings.json fragment for me to apply, and anything refused.

## Separate, read-only: weave-os/router

Do not install it, do not sign up, do not send it any key. Clone https://github.com/weave-os/router
to /tmp, run vet-third-party on it, and write docs/ROUTER-EVAL.md in ark-console answering:
- what it routes and how it decides
- what it needs (provider API keys, Postgres, Docker) and where keys are stored
- whether it can sit in front of Claude Code at all, given that Claude Code uses a subscription
  rather than API keys, and what that would cost compared with the subscription
- what telemetry it emits and where
Then delete the clone. State the commit SHA you vetted. If the answer to the third question is that
it requires paying per token through an API key, say so plainly: a router that cuts API cost by 40
to 70% is not a saving for someone on a fixed-price subscription.

## Reporting

Observed values only. NOT RUN, NOT AVAILABLE, NOT MEASURED mean what they say. No em dashes. Never
use --no-verify. Per-phase commits with the diff read first. verify-before-done before the report,
capture-lessons at the end. Nothing pushed.

## Addendum, added after round 1 of the console styling: the skills view

I want to see which skills are actually used, how much they cost, and how well they work. Two of
those three are measurable from files; the third mostly is not. Do not blur them.

Phase 1 also produces, for the last 7 days and the last 24 hours:

- per skill: number of invocations, the sessions that invoked it, tokens in those sessions where
  recorded, and last used. Read the invocation from the transcript, not from a guess about which
  skill a prompt matched. If the transcript does not record skill invocation, say so as NOT
  AVAILABLE and report what it does record (for example a Skill tool call by name).
- never used: every skill in ~/.claude/skills and in ark-skills that has zero recorded invocations
  in the window, with the window stated. A skill absent from the logs is not proof it is useless,
  only that it did not fire; say that in the output.
- per agent: the same three numbers, since agents and skills are different things.

Effectiveness: the only effectiveness evidence that exists is a skill-creator eval with a baseline.
Today that is spec-writing (90% against a 70% baseline) and visual-loop (100% against 7 of 15).
Read those numbers from each SKILL.md, the same way viz/scripts/build_graph.py does, and show them
as "measured: <score> vs baseline <score>" or "unmeasured". Never infer effectiveness from usage
counts, token cost, or how often a skill fires. A frequently used skill is not a good one.

Phase 2 adds a Skills section to the page with those columns: skill, invocations, tokens, last used,
eval status. Sort by invocations. A separate short list of never-used skills sits beneath it.

ACCEPTANCE:
  the invocation count for one skill is verified by hand against the raw transcript lines, and both
  numbers are reported
  a skill with an eval score in its SKILL.md shows it; every other skill shows "unmeasured"
  the never-used list names the window and does not call those skills useless
