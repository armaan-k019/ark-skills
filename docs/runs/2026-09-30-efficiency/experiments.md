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
                   claude-opus-5-5 (observed: 101 of 175 general-purpose calls passed no model; all 16
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
