---
name: adversarial-review
description: Verify high-stakes output with reviewers that did not produce it, either two independent reviewers who must both pass (dual review) or a generator and a strict evaluator iterating to a quality bar (generator-evaluator loop). Use before shipping user-facing code or copy, before submitting a paper, abstract, or portfolio text, for research claims and findings, when hallucination risk is high (citations, numbers, API details), or when asked to "stress-test", "red-team", or "get a second opinion" on work.
---

# Adversarial Review

A model reviewing its own output shares the blind spots that produced it, and it tends to approve its own work. Independent reviewers with no shared context break that. This skill has two modes: dual review for checking a finished artifact, and a generator-evaluator loop for driving an artifact up to a quality bar.

Adapted from `santa-method` (originally by Ronald Skelton, distributed in ECC) and ECC's `gan-style-harness` (MIT, see `licenses/ECC-LICENSE`). The unverified cost and quality figures in the originals were dropped.

## When not to use it

- Anything a deterministic check can settle. Build, types, lint, and tests come first (`verify-before-done`); this skill is for what those cannot check: accuracy, claims, completeness, judgment.
- Internal drafts and throwaway exploration. It costs roughly two to three extra passes of tokens per round.

## Step 1: Write the rubric first

The rubric decides the quality of the review. Every criterion needs an objective pass and fail condition. "Is it good?" is not a criterion.

Core criteria for any artifact:

| Criterion | Pass | Fail signal |
|---|---|---|
| Factual accuracy | Every claim traces to a source, the code, or the provided material | Invented numbers, wrong versions, APIs that do not exist |
| No fabrication | No invented entities, quotes, citations, URLs, features, or metrics | A citation that does not resolve; a feature the code does not have |
| Completeness | Every requirement in the spec is addressed | Missing sections, skipped cases |
| Scope | Nothing added that was not asked for | Unrequested features, refactors, or claims |
| Internal consistency | No contradictions | Section A says X, section B says not X |
| User rules | Follows the stated constraints | Em dashes, marketing voice, cliches, hedged claims presented as findings |

Add domain rows as needed:

- **Code:** type safety, error handling, security at boundaries, tests for new paths.
- **Paper or abstract:** every claim supported by a cited source that actually says it; method matches the claimed contribution; limitations are specific; no result stated more confidently than the evidence (see `honest-refusal` for the discipline and `scholar-evaluation` for the full rubric).
- **Portfolio or recruiter copy:** every capability described exists in the shipped code; no invented metrics or user counts; claims about the other company's product are accurate.

## Mode A: Dual review (check a finished artifact)

1. **Spawn two reviewers in parallel as separate subagents.** Each gets: the original task spec, the artifact, and the rubric. Neither sees the other's review. Both are told: "You have not seen any other review. Your job is to find problems, not to approve. For each criterion return PASS or FAIL, and for every FAIL cite the exact text or line."
2. **Verdict gate.** The artifact passes only if both reviewers pass it. If only one reviewer flags an issue, treat the issue as real; the other reviewer's miss is the blind spot this method exists to catch.
3. **Fix.** Merge and deduplicate the FAIL items. Fix only those items, with no unrequested rewrites.
4. **Re-review with fresh reviewers.** New subagents each round, never the previous reviewers, to avoid anchoring on their own earlier comments.
5. **Cap at 3 rounds.** If it still fails, stop and escalate to the user with the remaining issues. A reviewer that keeps finding new, different issues every round usually means the rubric is too loose.

Reviewer output format:

```
VERDICT: PASS | FAIL
[PASS|FAIL] <criterion>: <detail; for FAIL, quote the exact text or cite file:line>
Critical issues: <list or none>
Suggestions (non-blocking): <list or none>
```

## Mode B: Generator-evaluator loop (drive quality up)

For work judged on quality rather than correctness, such as a UI, a demo page, or a piece of writing.

1. **Spec.** Write the spec and the scoring rubric to files before generating. Each criterion is scored 1 to 10 with a written description of what 3, 6, and 9 look like, plus a weight. Set a pass threshold (for example 7.0 weighted) and a max iteration count (for example 5).
2. **Generate.** The generator builds from the spec. On later rounds it reads the latest feedback file first.
3. **Evaluate.** A separate evaluator agent scores against the rubric and writes `feedback-NNN.md` with scores and specific, located issues. For UI, the evaluator must use the running app (Playwright or screenshots), clicking through states, not only read the code.
4. **Loop** until the weighted score meets the threshold or the max iterations are reached.
5. **Stop on plateau.** If the score does not improve for 2 consecutive rounds, stop and bring it to the user. More rounds will not fix a spec or rubric problem.

Rules for the loop:

- The evaluator only critiques; it never fixes. An evaluator that fixes and then grades its own fix is grading itself.
- Feedback is passed as a file, not pasted inline, so the generator reads all of it.
- An evaluator that passes round 1 is suspect. Tighten the rubric and add explicit penalties for generic, template-looking output.
- Every piece of scaffolding here assumes the model cannot do something alone. When a stronger model makes a step unnecessary, drop the step.

## Reading results over many runs: pass@k vs pass^k

If a single run succeeds with probability p:

- **pass@k** = at least one of k runs succeeds = 1 - (1 - p)^k. Use it when you pick the best of several attempts (drafts, design options).
- **pass^k** = all k runs succeed = p^k. Use it for anything that runs repeatedly without you watching (a hook, an automated pipeline, a research engine run on many queries). A step that works 70% of the time succeeds on all of 5 runs only about 17% of the time.

Track per-criterion failures across reviews. A criterion that fails repeatedly is a lesson to capture (`capture-lessons`) or a rule to add, not something to catch by hand forever.

## Report

```
ADVERSARIAL REVIEW (mode A | mode B)
Artifact: <path>
Rubric:   <path or inline>
Rounds:   <n> of <max>
Result:   PASS | FAIL (escalated) | STOPPED ON PLATEAU (score x.x)
Remaining issues: <list or none>
Issues flagged by only one reviewer: <list>   (mode A)
```
