# Report: measure efficiency, then fix routing

Written 2026-09-30 15:25 EDT (from `date`). Branches: ark-console feat/efficiency at d6cb492, ark-skills feat/efficiency (this commit). Nothing pushed. Every value below was observed in this run; where a value was not measured it says so.

## What was built

| Phase | Commit | What |
|---|---|---|
| 1 | ark-console d603781 | lib/usage.js: usage attribution for the last 24 hours and 7 days; the snapshot's `usage` field; `--now` on the indexer |
| 2 | ark-console d6cb492 | the Usage section on the page, plain tables |
| 3 | ark-skills a204cf3 | ROUTING.md and the proposal in PROGRESS.md; agent files unchanged |
| 4 | ark-skills 35ec739, bb17388 | the experiment card (before the runs) and the ledger of six runs |
| 5 | ark-skills 8289184 | model-routing/SKILL.md, a draft, not evaluated |
| router | ark-console 863d0d3 | docs/ROUTER-EVAL.md; the clone deleted |

## Phase 1 tables

Source: `node lib/usage.js --now 2026-09-30T18:00:00Z` at ark-console d6cb492 (run by `bash scripts/accept-usage.sh` from 15:22:08 EDT). Tokens: input + output + cache creation + cache read, from message.usage, each API message once, as its last line written by the report time records it.

### Last 24 hours (2026-09-29T18:00:00.000Z to 2026-09-30T18:00:00.000Z)

Total 850,783,005 tokens (input 4,894, output 1,045,319, cache creation 49,198,263, cache read 800,534,529) in 5 sessions, 2,368 messages with usage. Absent: 0 of 5 sessions had no usage; 0 assistant messages had none; 0 sessions had no peak context; 0 had no project. Above 150k context: 784,739,450 (92.2%). In sessions over 8 hours: 850,200,364 (99.9%, 4 sessions). Dollars: NOT AVAILABLE.

| Project | Tokens | Sessions |
|---|---|---|
| untitled folder | 631,132,566 | 1 |
| ark-skills | 120,942,116 | 1 |
| kazi-lab | 84,234,380 | 1 |
| armaank019 | 14,473,943 | 2 |
| Sum of projects | 850,783,005 | |
| Total | 850,783,005 | |

| Source | Kind | Tokens | Share | Transcripts |
|---|---|---|---|---|
| main session | main | 312,131,243 | 36.7% | 5 |
| general-purpose | general-purpose | 496,094,781 | 58.3% | 15 |
| silent-failure-hunter | named | 34,712,841 | 4.1% | 12 |
| Explore | named | 7,844,140 | 0.9% | 3 |

| Session | Project | Tokens | Peak context | Duration (h) | Subagents |
|---|---|---|---|---|---|
| fe7455f7 | untitled folder | 631,132,566 | 800,126 | 26.8 | 25 |
| 675c1b1f | ark-skills | 120,942,116 | 963,753 | 93.6 | 2 |
| ec05783b | kazi-lab | 84,234,380 | 805,409 | 119.8 | 3 |
| 5aa1eee7 | armaank019 | 13,891,302 | 309,868 | 336.4 | 0 |
| cfa10a29 | armaank019 | 582,641 | 69,708 | 0.0 | 0 |

| Skill | Invocations | Tokens in those sessions | Last used (UTC) | Eval status |
|---|---|---|---|---|
| capture-lessons | 2 | 631,132,566 | 2026-09-30T04:31:33.548Z | unmeasured |
| experiment-discipline | 2 | 631,132,566 | 2026-09-30T04:35:34.101Z | unmeasured |
| adversarial-review | 1 | 631,132,566 | 2026-09-30T04:31:33.015Z | unmeasured |
| artifact-design | 1 | 13,891,302 | 2026-09-29T19:43:46.476Z | unmeasured |
| dataviz | 1 | 13,891,302 | 2026-09-29T19:42:36.792Z | unmeasured |
| literature-review | 1 | 631,132,566 | 2026-09-30T04:31:33.329Z | unmeasured |
| phased-build | 1 | 631,132,566 | 2026-09-30T04:31:32.056Z | unmeasured |
| unattended-build | 1 | 631,132,566 | 2026-09-30T04:31:31.759Z | unmeasured |
| verify-before-done | 1 | 631,132,566 | 2026-09-30T04:31:32.664Z | unmeasured |

Never fired in the last 24 hours (29): decision-records, docs, docx, google-workspace, honest-refusal, impeccable, import-memory, model-routing, morning, pdf, ponytail, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help, ponytail-review, pptx, query-to-corpus, recruiter-demo-writer, relevance-profile, scholar-evaluation, scroll-world, skill-audit, skill-creator, spec-writing, strategic-compact, vet-third-party, visual-loop, xlsx. No recorded invocation in the last 24 hours (2026-09-29T18:00:00.000Z to 2026-09-30T18:00:00.000Z). A skill that did not fire in this window is not shown to be useless; it only did not fire.

| Agent | Invocations | Sessions | Own tokens | Tokens in those sessions | Last used (UTC) |
|---|---|---|---|---|---|
| silent-failure-hunter | 11 | 2 | 34,712,841 | 752,074,682 | 2026-09-30T15:45:57.903Z |
| general-purpose | 9 | 2 | 496,094,781 | 752,074,682 | 2026-09-30T08:05:15.217Z |
| Explore | 3 | 1 | 7,844,140 | 84,234,380 | 2026-09-30T14:21:29.447Z |

### Last 7 days (2026-09-23T18:00:00.000Z to 2026-09-30T18:00:00.000Z)

Total 3,113,044,200 tokens (input 25,205, output 6,203,787, cache creation 116,967,718, cache read 2,989,847,490) in 14 sessions, 11,038 messages with usage. Absent: 0 of 14 sessions had no usage; 0 assistant messages had none; 0 sessions had no peak context; 0 had no project. Above 150k context: 2,701,693,313 (86.8%). In sessions over 8 hours: 3,102,630,989 (99.7%, 10 sessions). Dollars: NOT AVAILABLE.

| Project | Tokens | Sessions |
|---|---|---|
| untitled folder | 973,043,195 | 2 |
| kazi-lab | 678,842,419 | 4 |
| ark-skills | 610,756,580 | 2 |
| my-portfolio | 473,009,973 | 3 |
| my-portfolio-redesign | 358,917,073 | 1 |
| armaank019 | 18,474,960 | 2 |
| Sum of projects | 3,113,044,200 | |
| Total | 3,113,044,200 | |

| Source | Kind | Tokens | Share | Transcripts |
|---|---|---|---|---|
| main session | main | 1,709,460,804 | 54.9% | 14 |
| general-purpose | general-purpose | 1,348,786,827 | 43.3% | 145 |
| silent-failure-hunter | named | 42,109,378 | 1.4% | 14 |
| Explore | named | 12,687,191 | 0.4% | 8 |

| Session | Project | Tokens | Peak context | Duration (h) | Subagents |
|---|---|---|---|---|---|
| fe7455f7 | untitled folder | 972,872,628 | 800,126 | 26.8 | 36 |
| 675c1b1f | ark-skills | 604,542,266 | 966,607 | 93.6 | 90 |
| ec05783b | kazi-lab | 542,671,579 | 965,746 | 119.8 | 7 |
| 7dfc9d75 | my-portfolio | 431,816,571 | 884,426 | 105.3 | 28 |
| 04f68408 | my-portfolio-redesign | 358,917,073 | 963,452 | 42.0 | 5 |
| 94343e69 | kazi-lab | 101,833,409 | 680,970 | 183.1 | 1 |
| a5f80c18 | kazi-lab | 34,085,125 | 389,946 | 10.2 | 0 |
| e51a977b | my-portfolio | 31,785,705 | 335,613 | 8.8 | 0 |
| 5aa1eee7 | armaank019 | 17,892,319 | 309,868 | 336.4 | 0 |
| 8c227600 | my-portfolio | 9,407,697 | 183,642 | 0.8 | 0 |
| 57d69f45 | ark-skills | 6,214,314 | 222,368 | 270.3 | 0 |
| cfa10a29 | armaank019 | 582,641 | 69,708 | 0.0 | 0 |
| 98bd7dd4 | kazi-lab | 252,306 | 50,729 | 0.1 | 0 |
| f1fabc23 | untitled folder | 170,567 | 43,310 | 0.2 | 0 |

| Skill | Invocations | Tokens in those sessions | Last used (UTC) | Eval status |
|---|---|---|---|---|
| experiment-discipline | 6 | 973,043,195 | 2026-09-30T04:35:34.101Z | unmeasured |
| literature-review | 5 | 973,043,195 | 2026-09-30T04:31:33.329Z | unmeasured |
| adversarial-review | 4 | 973,043,195 | 2026-09-30T04:31:33.015Z | unmeasured |
| capture-lessons | 4 | 973,043,195 | 2026-09-30T04:31:33.548Z | unmeasured |
| phased-build | 4 | 973,043,195 | 2026-09-30T04:31:32.056Z | unmeasured |
| unattended-build | 4 | 973,043,195 | 2026-09-30T04:31:31.759Z | unmeasured |
| verify-before-done | 4 | 973,043,195 | 2026-09-30T04:31:32.664Z | unmeasured |
| claude-api | 2 | 465,901,696 | 2026-09-25T13:28:04.441Z | unmeasured |
| honest-refusal | 2 | 542,671,579 | 2026-09-28T05:27:15.590Z | unmeasured |
| impeccable | 2 | 963,459,339 | 2026-09-26T19:41:24.661Z | unmeasured |
| relevance-profile | 2 | 542,671,579 | 2026-09-28T05:27:15.365Z | unmeasured |
| run | 2 | 102,085,715 | 2026-09-25T13:22:22.696Z | unmeasured |
| artifact-design | 1 | 17,892,319 | 2026-09-29T19:43:46.476Z | unmeasured |
| code-review | 1 | 358,917,073 | 2026-09-25T03:02:53.669Z | unmeasured |
| dataviz | 1 | 17,892,319 | 2026-09-29T19:42:36.792Z | unmeasured |

Never fired in the last 7 days (26): decision-records, docs, docx, google-workspace, import-memory, model-routing, morning, pdf, ponytail, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help, ponytail-review, pptx, query-to-corpus, recruiter-demo-writer, scholar-evaluation, scroll-world, skill-audit, skill-creator, spec-writing, strategic-compact, vet-third-party, visual-loop, xlsx. No recorded invocation in the last 7 days (2026-09-23T18:00:00.000Z to 2026-09-30T18:00:00.000Z). A skill that did not fire in this window is not shown to be useless; it only did not fire.

| Agent | Invocations | Sessions | Own tokens | Tokens in those sessions | Last used (UTC) |
|---|---|---|---|---|---|
| general-purpose | 145 | 4 | 1,348,786,827 | 2,368,148,538 | 2026-09-30T08:05:15.217Z |
| silent-failure-hunter | 14 | 2 | 42,109,378 | 1,577,414,894 | 2026-09-30T15:45:57.903Z |
| Explore | 8 | 2 | 12,687,191 | 644,504,988 | 2026-09-30T14:21:29.447Z |

Dollars recorded anywhere: 8 of 26 sessions carry a cost-state line, 154.68 USD in total; a running total per session, not placed in any window.

Hand check (addendum): experiment-discipline's Skill calls read line by line from the raw transcripts: 2 in the 24 hours (the report: 2), 6 in the 7 days (the report: 6); the lines are listed in PROGRESS.md.

## Routing table (full text in ROUTING.md)

| Agent | Defined in | Referenced by | Current model | Observed runs | Recommended | Reason |
|---|---|---|---|---|---|---|
| silent-failure-hunter | agents/silent-failure-hunter.md | phased-build (review phase) | opus (frontmatter) | 14 of 14 on claude-opus-5-5 (13 asked opus, 1 asked none) | opus, unchanged | Review is judgment. |
| ts-reviewer | agents/ts-reviewer.md | phased-build (review phase) | opus (frontmatter) | 0 runs recorded | opus, unchanged | Review is judgment. |
| Reviewer subagents of adversarial-review and unattended-build gates | none (general-purpose, spawned per call) | adversarial-review, unattended-build, phased-build | not pinned: the caller's `model`, else the session default, which inherits the main model | 65 general-purpose runs whose description contains review, gate, re-review, full-diff, or fresh review (case-insensitive): 41 asked none (39 ran on claude-opus-5-5, 2 on claude-sonnet-5), 23 asked opus (16 ran on claude-opus-5-5, 7 on claude-opus-5), 1 asked sonnet (ran on claude-sonnet-5-5). Recounted 2026-10-01 under that rule; the first count here, 43 (36 asked none, 7 asked opus), was wrong | opus, passed on the Agent call | Review is judgment. They get opus today only by inheriting it; a cheaper default would move them to it unless the call passes opus. |
| skill-creator grader | skill-creator/agents/grader.md (instructions, no frontmatter; read by a general-purpose subagent) | skill-creator | not pinned | 16 runs described as Grade: all asked none, all ran on claude-opus-5-5 | sonnet; haiku NOT MEASURED | Grading assertions is mechanical under the rule. The grader's output is the eval number the author relies on, so the cheapest model that can do it is the one shown to grade the same; Phase 4 measures sonnet against the current default on a grading task. |
| skill-creator comparator | skill-creator/agents/comparator.md | skill-creator | not pinned | 0 runs identified by description | opus, passed on the call | A blind quality comparison is judgment. |
| skill-creator analyzer | skill-creator/agents/analyzer.md | skill-creator | not pinned | 0 runs identified by description | opus, passed on the call | Explaining why one version won is judgment. |
| skill-creator test runs (with and without the skill) | none (general-purpose) | skill-creator | not pinned | eval and benchmark runs ("B1", "B2", "Eval", "R1" to "R3" and similar) | the model the skill is meant to run on, the same for both arms | An eval measures a skill on a model. Running it on a cheaper model changes what is measured; it is not a routing choice. |
| Other general-purpose subagents | built in | phased-build delegation, unattended-build, ad hoc | not pinned | 175 general-purpose transcripts in all: 101 asked no model; by the model most of their lines carry, 146 on opus (claude-opus-5-5 or claude-opus-5), 16 on sonnet (claude-sonnet-5 or claude-sonnet-5-5), 13 on haiku (all 13 asked haiku) | sonnet by default, opus passed explicitly for judgment | Mechanical tasks (grading, collecting, running) inherit opus today only because nothing says otherwise. |
| Explore | built in | no SKILL.md in ark-skills names it | not pinned by ark-skills | 10 runs, none asked a model: 7 on claude-sonnet-5, 3 on claude-opus-5-5 | no change | File search is mechanical, and Explore already ran on sonnet in 7 of 10; ark-skills has no file that sets it. |

Agent files after Phase 3: both still `model: opus`; changed: none.

## Phase 4 result (full ledger in experiments.md)

| Measure | Current default (no model, inherits claude-opus-5-5) | Proposed (model sonnet, claude-sonnet-5) |
|---|---|---|
| Verdicts correct | 8, 8, 8 of 8 | 8, 8, 8 of 8 |
| Reply as asked (JSON only) | 3 of 3 | 0 of 3 (all added notes after the JSON; one cited line ranges) |
| Notice subagent_tokens (the card's primary token measure) | median 47,798, min 43,093, max 52,990 | median 87,404, min 64,112, max 87,729 |
| Transcript tokens (four parts, each message once) | median 413,398, min 390,825, max 453,277 | median 329,044, min 328,818, max 378,778 |
| Messages per run | 11, 10, 10 | 7, 5, 5 |
| Wall time, s | median 54.5, min 50.1, max 57.2 | median 39.0, min 37.1, max 41.5 |

Verdict, by the decision rule written before the runs: the proposal does not stand. Verdicts were the same (24 of 24 per arm), but sonnet broke the requested JSON-only format in 3 of 3 runs, and its median on the card's primary token measure (87,404) is above the current default's whole range (43,093 to 52,990). That measure turned out to be the final context size; by tokens processed (transcript sum) sonnet was lower, median 329,044 against 413,398, and faster, median 39.0 s against 54.5 s, with 3 runs per arm (fewer than experiment-discipline's 5 for timing). The change did not measurably help on the measure chosen in advance; no percentage is claimed. Dollars: NOT AVAILABLE (a subscription; the transcripts do not record how tokens count against the plan).

## Settings fragment for the author (not applied)

Lead with the per-agent route, because the variable name could not be verified against documentation without a network call (Q1): keep `model: opus` in both agent files; pass `model: opus` on reviewer calls in adversarial-review, unattended-build, and phased-build, and on skill-creator's comparator and analyzer; pass `model: sonnet` on skill-creator's grader only with a reply validator (these are skill edits: proposed, not made).

Second, NOT VERIFIED against documentation:

```json
{
  "env": {
    "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet"
  }
}
```

Source for the name: Claude Code 2.1.282's installed binary contains `function tre(){let e=a.CLAUDE_CODE_SUBAGENT_MODEL;return e&&e!=="inherit"?e:"inherit"}` (read locally with `strings`). The `env` settings key is from memory. Phase 4 does not support applying it yet: apply it, if at all, only after reviewer calls pass opus explicitly (41 of 65 review runs asked no model, and 39 of those got opus only by inheriting it; recounted 2026-10-01, the first count, 36 of 43, was wrong).

## Refused or not done

- ~/.claude/settings.json: not edited (the SPEC's rule); the fragment is above.
- Claude Code documentation: not fetched ("any network call" is stop-and-ask); Q1.
- Skill bodies (adversarial-review, unattended-build, phased-build, skill-creator and its agents/): not changed; the per-agent route is proposed.
- viz/scripts/families.json and viz/data/graph.json: not changed (outside this SPEC's scope), so ark-skills' own test `test_committed_graph_is_current` fails with the new model-routing directory; Q3.
- model-routing: not evaluated (the SPEC: its own decision).
- The weave-os/router clone: vetted read-only and deleted; nothing installed, no account, no key sent.
- ~/.claude: nothing written by the run's code; `bash scripts/accept-usage.sh` shows the one ~/.claude file that changed while the command ran was this session's own transcript (0 in the control interval), and the command gives the same output with every write outside ark-console denied by sandbox-exec.
- Pushing: not done.

## Verification (verify-before-done, 2026-09-30 15:21 to 15:23 EDT, after the last code edit)

```
VERIFICATION: ark-console feat/efficiency d6cb492
Build:     PASS (no build step; `node --check` on 13 JS files, 0 failures)
Typecheck: NOT RUN (plain JavaScript; no type checker configured)
Lint:      NOT RUN (no lint config)
Tests:     PASS 55/55   node --test test/indexer.test.js test/server.test.js test/usage.test.js
           PASS 262/262 node scripts/check-page.js (fixture, empty, and no-usage snapshots)
           PASS         node scripts/mutants.js: 75 mutants, each caught; every test fails under at least one (15:08 to 15:20)
           PASS         bash scripts/accept-usage.sh; bash scripts/accept-phase2.sh; ARK_CONSOLE_PORT=7778 node scripts/accept-phase4.js
Diff:      19 files changed from main; unrequested changes: one, found by the console-v2 Phase 7 review: ark-console README.md was edited in d603781 (lines for the indexer's usage report, lib/usage.js, the tests, and the mutants), outside this run's SCOPE (STANDING-DECISIONS.md: "Nothing else in ark-console is written"), and this line first said none. The author later approved a README update (console-v2, answer 4), which rewrote it in bcdbae1. accept-phase2.sh and accept-phase4.js were adjusted for the clock-dependent usage report after the Phase 1 review; 0 em dashes in files and commit messages; no debug output; no secret values ("sk-ant-oat" appears in ROUTER-EVAL.md as the name of a token prefix)
Verdict:   DONE

VERIFICATION: ark-skills feat/efficiency
Build:     NOT RUN (no build step)
Tests:     PASS 26/26 node hooks/test-hooks.js
           FAIL 53/54 python3 -m unittest discover viz/scripts: test_committed_graph_is_current, "nodes not listed in any family in viz/scripts/families.json: model-routing" (passes on main fee91b9 and on bb17388, before the skill)
           PASS 28/28 node --test scripts/test_app.cjs scripts/test_panel.cjs scripts/test_layout.cjs (in viz/)
           NOT RUN     node scripts/smoke.mjs (needs a server on 127.0.0.1:8123 and writes viz/screenshot.png and viz/screenshot-focus.png, outside scope; `git diff --stat main -- viz` is empty)
Diff:      files changed from main: docs/runs/2026-09-30-efficiency/ and model-routing/SKILL.md only; 0 em dashes
Verdict:   NOT DONE: the new skill needs a family in viz/scripts/families.json and a regenerated viz/data/graph.json (Q3)
```

## Open questions

- Q1: May a run fetch Claude Code's documentation to verify `CLAUDE_CODE_SUBAGENT_MODEL` and the settings `env` key? Blocks: nothing; the fragment is marked unverified.
- Q2: Is Opus 5.5 or Fable 5.1 the strongest model for judgment work? Nothing in this run compares them. Blocks: nothing.
- Q3: Which family should model-routing sit in (viz/scripts/families.json), and may that file and viz/data/graph.json be changed on this branch? Blocks: ark-skills' test_committed_graph_is_current.
- Lessons: nine entries in LESSONS.md here, five of them repeats of existing entries (counts given there), with four promotions proposed. May they be merged into ark-skills' and ark-console's LESSONS.md?
