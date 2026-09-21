---
name: experiment-discipline
description: Run research experiments, ML training runs, and algorithm benchmarks so results are reproducible, compared against a baseline, reported with variance, and logged in an experiment ledger. Use when designing or running an experiment, benchmarking an algorithm or optimization (before/after, scaling with input size), training or evaluating a model, writing PyTorch training code, or reporting numbers in a paper, report, or README.
---

# Experiment Discipline

A number without its baseline, its variance, and the exact code and config that produced it is an anecdote. This skill is the minimum process that turns runs into results someone else (including you in two months) can trust and reproduce.

Adapted from ECC's `mle-workflow`, `pytorch-patterns`, and `benchmark` skills (MIT, see `licenses/ECC-LICENSE`). The production-deployment material (serving, canaries, monitoring) was dropped; this version is scoped to research and benchmarking.

## Hard rules

- **Never report a number you did not produce in a logged run.** No estimated speedups, no remembered accuracies, no "roughly 10x". If a run has not happened, the result is "not measured".
- **Every result has a baseline.** A speedup is relative to something; an accuracy is compared to a simple method. Name it.
- **Every result has its provenance:** code commit SHA, config, data or input version, seed, and hardware.
- **Report variance when results are noisy.** Several runs and a spread, not the best run.
- **Negative results get logged too.** An optimization that did not help is a finding.

## Step 1: Write the experiment card before running anything

Keep it short enough to paste into a PR or report.

```text
Question:          what are we trying to learn?
Hypothesis:        what we expect, and what result would disprove it
Baseline:          the simple or current method we compare against
Primary measure:   the one number that answers the question (and which direction is better)
Guardrails:        numbers that must not get worse (memory, correctness, runtime)
Inputs / data:     dataset or input set, version or snapshot, size range
Controls:          what is held fixed (hardware, config, seed policy)
Runs:              how many repeats, and why that is enough
Decision rule:     what result changes what we do next
```

## Step 2: Make it reproducible

- Commit code before a run you intend to report, and record the SHA. Uncommitted changes make the run unreproducible.
- Put every parameter in a config file or a frozen dataclass, never in edited-in-place constants or notebook state.
- Pin dependency versions (lockfile, `requirements.txt` with versions, or `uv.lock`).
- Set and record seeds (`random`, `numpy`, and `torch` if used). For PyTorch, note that `torch.backends.cudnn.deterministic = True` and `benchmark = False` trade speed for determinism, and some GPU ops stay nondeterministic; record which you chose.
- Record hardware: CPU or GPU model, core count, RAM, OS. Timing results do not transfer across machines.
- Write outputs to a run directory named by date, short SHA, and config hash, containing the config, the command, stdout, and metrics as JSON.

## Step 3: Benchmarking algorithms and optimizations

For timing and scaling work (for example, before and after an indexing or deduplication change):

- **Correctness first.** The optimized version must produce the same output as the baseline on the same inputs; add a test that checks this before timing anything.
- **Separate setup from the measured region.** Time only the operation, not data loading or process start, unless end-to-end time is the question (then say so).
- **Warm up, then repeat.** Discard warm-up runs; run at least 5 timed repetitions per input; report median and spread (IQR, or min and max), not the mean of a noisy set or the best run.
- **Scale the input.** Measure across input sizes spanning at least an order of magnitude, and plot time against size. A speedup at one size says nothing about asymptotic behavior.
- **Same machine, same conditions.** Baseline and candidate run on the same hardware, in the same session, with nothing heavy running in the background. Interleave them if conditions drift.
- **Measure memory too** when the change trades memory for speed.
- Use a real harness where one exists (`pytest-benchmark`, `timeit`, `hyperfine` for CLI commands) instead of ad hoc `time.time()` pairs.

## Step 4: Training and evaluating models

- Build the simplest baseline first (majority class, linear model, nearest neighbor, or the current method) and make it hard to beat before adding capacity.
- Split data before looking at it. Guard against leakage: nothing in training may depend on validation or test data, including normalization statistics and deduplication across splits. For time-ordered data, split by time.
- Tune on validation only. Touch the test set once, at the end. If you looked at test results and changed something, the test set is now a validation set; say so.
- Report metrics that match the question, with a confusion matrix or error breakdown, not only a single aggregate.
- PyTorch checklist: code is device-agnostic (`torch.device(...)`, no hard-coded `.cuda()`); `model.eval()` and `torch.no_grad()` during evaluation; no `.item()` on a loss before `backward()`; save and load `state_dict`, not the whole model object; annotate tensor shapes in `forward`.

## Step 5: Error analysis, then the next experiment

After each run, look at the failures, not only the metric:

1. Sort mistakes into categories (false positives, false negatives, crashes, timeouts, wrong outputs).
2. Cluster them by shared traits (input size, geometry type, data source, edge cases).
3. Separate method failures from data bugs, label problems, and harness bugs.
4. Turn each important failure into a regression test or a fixed evaluation case.
5. Write the next experiment as a falsifiable hypothesis, not "improve performance".

## Step 6: Keep the ledger

One entry per run you might cite, in `experiments.md` next to the code (or the path the project uses):

```text
Run:            <date> <short sha> <config hash>
Command:        <exact command>
Change:         <what differs from the previous run>
Result:         <primary measure: median (spread), n runs>
Baseline:       <same measure for the baseline, same conditions>
Guardrails:     <memory, correctness check result>
Surprises:      <anything unexpected>
Decision:       <keep, revert, investigate>
Next:           <next hypothesis>
```

## Reporting

Any number that leaves the ledger (paper, report, README, slides) carries: the baseline, n runs, the spread, input sizes, hardware, and the commit. If any of those is missing, fix the run, not the sentence.
