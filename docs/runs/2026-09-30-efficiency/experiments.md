# Experiments: efficiency run

Ledger in the experiment-discipline format. Card written 2026-09-30 15:02 EDT (from `date`), before any run.

## Phase 4: a mechanical task on the current default and on the proposed default

```text
Question:          Does running a mechanical general-purpose subagent task on sonnet (the proposed default,
                   ROUTING.md) instead of the current default (no model passed, so it inherits the main
                   session's model, claude-opus-5-5) change its tokens, its wall time, or its output?
Hypothesis:        Sonnet grades all eight assertions correctly, as the current default does, and its token
                   count is within the spread of the current default's (the reading the task needs sets the
                   volume, not the model). Disproved if any sonnet run gets a verdict wrong, or if its token
                   median falls outside the current default's min-max.
Baseline:          the current routing: an Agent call to general-purpose with no model, which inherits
                   claude-opus-5-5 (observed, every subagent transcript up to 2026-09-30 18:00 UTC: 101 of 175 general-purpose calls passed no model; all 16
                   grading runs inherited opus).
Primary measure:   verdicts correct out of 8 per run (higher is better); tokens per run (lower is better),
                   median and min-max over 3 runs.
Guardrails:        the reply parses as the JSON asked for; every verdict cites file:line.
Inputs / data:     ark-console at d603781, exported with git archive to the session scratchpad
                   (.../scratchpad/p4-artifact); the prompt in .../scratchpad/p4-prompt.txt, 1,067 bytes,
                   sha256 36f252ec7692eded (first 16 hex). Ground truth checked by grep before any run:
                   A1 true, A2 false, A3 true, A4 false, A5 true, A6 false, A7 true, A8 false.
Controls:          the same prompt byte for byte, the same artifact, the general-purpose agent type, the
                   same parent session (claude-opus-5-5) on the same machine (Mac17,2, arm64, 10 cores,
                   16 GB, macOS 26.6.2); the models run remotely, so wall time includes the API. Runs
                   interleaved current, proposed, current, proposed, current, proposed, one at a time.
Runs:              3 per arm, as the SPEC sets. experiment-discipline asks for at least 5 timed repetitions,
                   so wall time differences from 3 are weak evidence; the report says so.
Decision rule:     If every sonnet run grades 8 of 8 and its token median is not above the current
                   default's range, the proposal stands for mechanical work. If any sonnet run misgrades,
                   sonnet is not recommended for grading. If the differences sit inside the spread, the
                   report says the change did not measurably help, and gives no percentage.
Measures, defined: tokens = subagent_tokens in the task-completion notice Claude Code sends when the subagent
                   finishes; cross-checked with the sum of input + output + cache creation + cache read over
                   the subagent's transcript, each message once, last line (lib/usage.js's rule). Wall time
                   = duration_ms from the same notice. Model = message.model in the subagent's transcript.
```

## Runs

```text
Run:            2026-09-30 19:02:37 UTC, run B1; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model not passed (inherits the main model), the prompt file's text, run in the background
Change:         none: the current default
Result:         verdicts correct 8 of 8; notice subagent_tokens 43,093; wall 57.2 s (duration_ms 57,156); 11 tool uses; model seen claude-opus-5-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON only; every verdict cited file:line
Surprises:      transcript sum 413,398 tokens over 11 messages (input 22, output 392, cache creation 25,651, cache read 387,333)
Decision:       recorded; the decision is in the summary
Next:           A1
```

```text
Run:            2026-09-30 19:03:43 UTC, run A1; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model sonnet, the prompt file's text, run in the background
Change:         model sonnet on the call, standing in for the proposed default
Result:         verdicts correct 8 of 8; notice subagent_tokens 64,112; wall 41.5 s (duration_ms 41,453); 11 tool uses; model seen claude-sonnet-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON, then notes on close calls (asked for no other text); two citations were line ranges; every verdict cited file:line
Surprises:      transcript sum 378,778 tokens over 7 messages (input 14, output 263, cache creation 64,011, cache read 314,490)
Decision:       recorded; the decision is in the summary
Next:           B2
```

```text
Run:            2026-09-30 19:04:34 UTC, run B2; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model not passed (inherits the main model), the prompt file's text, run in the background
Change:         none: the current default
Result:         verdicts correct 8 of 8; notice subagent_tokens 47,798; wall 54.5 s (duration_ms 54,543); 11 tool uses; model seen claude-opus-5-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON only; every verdict cited file:line
Surprises:      transcript sum 390,825 tokens over 10 messages (input 20, output 340, cache creation 19,084, cache read 371,381)
Decision:       recorded; the decision is in the summary
Next:           A2
```

```text
Run:            2026-09-30 19:05:39 UTC, run A2; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model sonnet, the prompt file's text, run in the background
Change:         model sonnet on the call, standing in for the proposed default
Result:         verdicts correct 8 of 8; notice subagent_tokens 87,729; wall 39.0 s (duration_ms 39,001); 9 tool uses; model seen claude-sonnet-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON, then notes (asked for no other text); every verdict cited file:line
Surprises:      transcript sum 328,818 tokens over 5 messages (input 10, output 785, cache creation 54,760, cache read 273,263)
Decision:       recorded; the decision is in the summary
Next:           B3
```

```text
Run:            2026-09-30 19:06:28 UTC, run B3; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model not passed (inherits the main model), the prompt file's text, run in the background
Change:         none: the current default
Result:         verdicts correct 8 of 8; notice subagent_tokens 52,990; wall 50.1 s (duration_ms 50,100); 11 tool uses; model seen claude-opus-5-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON only; every verdict cited file:line
Surprises:      transcript sum 453,277 tokens over 10 messages (input 20, output 356, cache creation 24,257, cache read 428,644)
Decision:       recorded; the decision is in the summary
Next:           A3
```

```text
Run:            2026-09-30 19:07:29 UTC, run A3; artifact ark-console d603781; card ark-skills 35ec739; prompt sha256 36f252ec7692eded
Command:        Agent tool, subagent_type general-purpose, model sonnet, the prompt file's text, run in the background
Change:         model sonnet on the call, standing in for the proposed default
Result:         verdicts correct 8 of 8; notice subagent_tokens 87,404; wall 37.1 s (duration_ms 37,055); 9 tool uses; model seen claude-sonnet-5
Baseline:       see the summary below (runs interleaved B1 A1 B2 A2 B3 A3)
Guardrails:     reply format: JSON, then notes (asked for no other text); every verdict cited file:line
Surprises:      transcript sum 329,044 tokens over 5 messages (input 10, output 788, cache creation 54,445, cache read 273,801)
Decision:       recorded; the decision is in the summary
Next:           summary
```

## Summary and verdict (n = 3 per arm)

| Measure | Current default (no model, inherits claude-opus-5-5) | Proposed (model sonnet, claude-sonnet-5) |
|---|---|---|
| Verdicts correct | 8, 8, 8 of 8 | 8, 8, 8 of 8 |
| Reply as asked (JSON only) | 3 of 3 | 0 of 3 (all added notes after the JSON; one cited line ranges) |
| Notice subagent_tokens (the card's primary token measure) | median 47,798, min 43,093, max 52,990 | median 87,404, min 64,112, max 87,729 |
| Transcript tokens (four parts, each message once) | median 413,398, min 390,825, max 453,277 | median 329,044, min 328,818, max 378,778 |
| Messages per run | 11, 10, 10 | 7, 5, 5 |
| Wall time, s | median 54.5, min 50.1, max 57.2 | median 39.0, min 37.1, max 41.5 |

What the notice's number is: in all six runs, subagent_tokens equals the last message's context (input + cache creation + cache read) plus its output to within 300 tokens (differences 296, 91, 251, 67, 270, 54). So it measures how large the subagent's context was when it finished, not how many tokens it processed. The transcript sum counts every turn, and is almost all cache reads.

Verdict, against the decision rule written before the runs:
- Output quality: the same on the verdicts (24 of 24 in each arm), different on format: every sonnet run broke "Reply with only a JSON array ... No other text"; no opus run did. For a grader whose reply is parsed, that is a failure, not a style difference.
- Tokens: the card's primary measure went against the proposal. Sonnet's median notice tokens, 87,404, is above the whole current range (43,093 to 52,990): sonnet finished with a larger context. On the transcript measure it went the other way: sonnet's median 329,044 is below the whole current range (390,825 to 453,277), because it took 5 to 7 messages instead of 10 or 11, so it read its cached context fewer times. Sonnet wrote more to cache (54,445 to 64,011 cache creation tokens against 19,084 to 25,651); the opus runs may have reused cache written by the parent session, which runs the same model. That is a possible explanation, not measured.
- Wall time: sonnet median 39.0 s (37.1 to 41.5) against 54.5 s (50.1 to 57.2). The ranges do not overlap, but 3 runs are fewer than the 5 experiment-discipline asks for timing, so this is weak evidence.
- By the card's rule ("if every sonnet run grades 8 of 8 and its token median is not above the current default's range, the proposal stands"), the proposal does not stand: the token median is above the range, and the format guardrail failed 3 of 3. The change did not measurably help on the measure chosen in advance. No percentage is reported.
- Dollars: NOT AVAILABLE. On a subscription the per-token price does not apply; how each model's tokens count against the plan's limits is not in the transcripts.

Decision: do not apply the settings default on this evidence. Keep the per-agent route: reviewers on opus explicitly; a sonnet grader only with its reply validated (parse the JSON, reject extra text) or a stricter prompt, and re-measured.
Next: if the grader route is taken, repeat this experiment with 5 runs per arm and a reply validator, and count tokens by the transcript measure.

## Eval cost (added 2026-10-01, Phase 7 of console-v2, from the review of this run)

model-routing/SKILL.md step 3 quoted two eval costs that no entry in this run recorded. They were measured again from the transcripts, read-only, and are logged here.

```text
Run:            2026-10-01 10:58:29 EDT (from `date`), read-only count; no eval was run
Command:        a Node script over ~/.claude/projects/*/*/subagents/*.jsonl: for each transcript, each message.id once, its last line, tokens = input + output + cache creation + cache read; cross-checked with ark-console lib/usage.js's scanTranscript and usageAsOf on the same files
Selection:      by each transcript's .meta.json description and first timestamp:
                9 transcripts whose description starts "B2", first line 2026-09-29 12:50 to 13:30 UTC
                ("B2 eval vague|feedback|reverse with skill|baseline", "B2 iter2 vague|feedback|reverse with skill");
                16 transcripts whose description starts "Grade", first line 2026-09-26 to 2026-09-29
Result:         B2 runs 29,286,170 tokens; grading runs 28,694,794 tokens; both methods equal
Baseline:       none (a cost, not a comparison)
Decision:       the numbers in model-routing/SKILL.md stand, now with this entry as their source
```
