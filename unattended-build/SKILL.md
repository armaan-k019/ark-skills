---
name: unattended-build
description: The autonomy contract for running one coding session across many phases with no human check-in, so that its reports can still be trusted afterwards. Use when asked to build something unattended, overnight, autonomously, "while I'm away", or "without checking in", when handed a SPEC to build across several phases or stacked PRs with nobody watching, when resuming such a build from PROGRESS.md, when directing or orchestrating another session from its reports, or when deciding whether a task is safe to run unattended at all. Also use to refuse unattended mode for taste-based work (visual design, copy, layout). For builds where a human approves the plan and each commit, use phased-build instead.
---

# Unattended Build

This skill is the contract that lets one session run across many phases with no human check-in and still produce reports someone can act on afterwards. It is not a phase pipeline. `phased-build` is for work where a human approves the plan and each commit; this skill is for work where nobody is watching. It replaces the plan gate with a SPEC and a standing contract written down at the start, and moves the commit gate to the PR.

Start with Step 0. It is the most important part of this skill: a task that fails it does not run unattended at all.

Written for this repo from observed practice, not adapted from a third-party source: one real build that ran this way successfully (a site analysis tool with nine external data sources, four stacked PRs, and 341 unit tests), and a parallel attempt that failed.

## Step 0: Classify the task before anything else

Unattended running works only when success is machine-checkable, because the session has to be able to tell by itself whether it succeeded. That requires a SPEC with numbered sections and acceptance criteria written as runnable commands.

| The test of success is | Class | What to do |
|---|---|---|
| A runnable command that can fail | machine-checkable | Unattended is allowed. Go to Step 1. |
| Human taste: "is this good?" (visual design, copy, layout) | taste-based | Refuse unattended mode. Run short loops in which the human looks at the artifact each round. |
| No SPEC, or criteria that could be commands but are not written as them yet | not ready | Stop. What the SPEC says the software should do is a product decision, so the human writes or approves it first. |

State the class in one line before doing any work.

Classify each acceptance criterion, not only the task as a whole. "The hero feels premium", "the copy reads well", and "the layout looks right on mobile" are not commands and cannot fail. A criterion like that never runs unattended, even inside a build that is otherwise machine-checkable: it goes to the human as a stop-and-ask question.

Refuse the pattern for taste-based work, and say why. In the source project, four unattended rounds on a visual redesign produced confident, well-tested, thoroughly wrong work, because no check could fail. That kind of task needs a short loop with the human looking at the artifact, not a longer run.

## Step 1: Write the standing contract to STANDING-DECISIONS.md

Before the first phase, write two explicit lists to `STANDING-DECISIONS.md` next to the SPEC. Without both, a session either asks about everything or asks about nothing.

```markdown
# Standing decisions: <build name>
SPEC: <path>   Branch: <branch>   Written: <date>

## Decide yourself
- Implementation approach within a phase
- File layout and naming
- Refactors confined to files the phase already touches
- Adding tests and fixtures
- Fixing bugs in code the build owns
- Up to two fix rounds per phase

## Stop and ask
- Merging to main
- Deploying to production
- Weakening, skipping, or deleting any test or acceptance criterion, for any reason
- Anything irreversible in git: stash, reset, checkout of another branch, force push, history rewriting, deleting tracked files
- A migration that drops or rewrites data
- Adding, removing, or upgrading a dependency
- Spending money
- Any product decision about what a feature should do, as opposed to how it does it
- Anything a user sees: copy, layout, visual design, error text
- Touching secrets or env configuration
- Work outside the repo
- Anything not in the SPEC
```

**On hitting a tripwire, do not idle.** When the next step is on the stop-and-ask list:

1. Write the question to PROGRESS.md under Open questions: what triggered it and what it blocks.
2. Continue on work that is not blocked.
3. Raise the question at the next checkpoint: the next PR description or report to the human.

If nothing unblocked is left, stop and report. Working around a tripwire is the same as ignoring it.

## Step 2: Keep PROGRESS.md, the only thing that survives

The transcript does not survive compaction or a new session; PROGRESS.md does. Update it after every phase, every fix round, and every blocked question. The test is whether a cold session with no transcript can read it and resume.

```markdown
# Progress: <build name>
Updated: <date time>   Branch: <branch>   Last commit: <short sha>

## Now
Phase <n> (SPEC section <x>), step: <what is being done>

## Done and verified
- Phase <n>: <what>, <commit sha>, verified with `<command>`: <observed result>

## In flight
- <what is partly done, and what is still missing>

## Open questions
- Q<n>: <question>. Triggered by: <stop-and-ask item or SPEC gap>. Blocks: <what>. Raised: <checkpoint, or not yet>

## Decisions
- <decision>: <reason>

## Next action
<one exact action: the file, the command, or the SPEC section>
```

PROGRESS.md fills the role of the handoff file in `strategic-compact` (`progress.md` there), kept continuously instead of written only before a compact, and that skill's rules for the handoff apply. A decision that meets the bar in `decision-records` is also drafted as a record, but that skill writes records only with the human's approval, so the draft is listed under Open questions until the next checkpoint.

## Step 3: Report only what was observed

These three rules are what make the reports usable afterwards.

1. **Report observed values, never expected ones.** A claim carries the command that was run and what it returned, or the measurement that was taken. In the source project this caught an orchestrator claiming a parallel code path had shipped when the calls were still serial, and a pointer offset of 580 px that every prior report had described as working.
2. **Never report partial work as delivered, or a measurement that was not taken.** Say partial, and what is missing. For checks, the NOT RUN rule in `verify-before-done` applies as written; a measurement that was not taken is marked NOT MEASURED in the same way.
3. **Refusal is a correct outcome.** A session that says "I cannot do this honestly because the source does not define X" is worth more than one that always delivers. In the source project two pieces of work were correctly declined on those grounds. Record a refusal as an outcome, in PROGRESS.md and in the report, naming what is not defined. `honest-refusal` sets out the discipline behind a well-produced no.

## Step 4: Review before each gate

A gate is a phase boundary. When the build has PRs, each PR is a phase boundary; the session opens it, and merging stays on the stop-and-ask list. Review once per gate:

- Not per commit. With no PRs present, reviewing every commit produced about 14 reviewer passes over 8 rounds in testing.
- Not only at the final report. That lets a bad decision compound through the whole build with nothing to catch it.

At each gate:

1. Run `verify-before-done` on the branch.
2. Run an independent reviewer pass over the session's own diff since the last gate, in fresh context; `adversarial-review` covers how to set one up. The reviewer reads the diff, not the session's summary of it, and reports only findings that would change behaviour, break a test, or violate the contract. Style, naming, and comment nits go into a list in the report, never into a fix round. In testing, a whole fix round went to findings that were all about test comments, and that phase landed with a failing review as a result.
3. Fix for at most two rounds, not the three that `adversarial-review`'s dual review allows, rather than grinding.

On reaching the cap, classify each unresolved finding against the stop-and-ask list. If any touches correctness, security, data, or a weakened test, it is a tripwire: handle it as in Step 1. Otherwise commit, and record the unresolved list in PROGRESS.md and in the PR if there is one. This is the existing contract applied to review findings, not a new rule.

Where an external PR reviewer exists, wait for it, address or reply to every comment, and record the outcome in PROGRESS.md. Escalate only the findings that fall under the stop-and-ask list; the rest are decided under the contract.

**Known cost.** Review at every gate makes this pattern slow and token-heavy, and tuning the gate did not remove that. In testing, a four-section build with one tripwire took about 190k to 210k tokens and 34 to 42 minutes with this skill, against about 85k tokens and 8 minutes for a session without it, which worked around the tripwire instead of stopping. Moving the gate to phase boundaries and adding the severity floor cut reviewer passes from about 14 to 12 and tokens by about a tenth, but wall clock rose. Treat the cost as a property of the pattern, not a defect to tune away.

## The director's failure mode

Whoever directs the session, a human or an orchestrating session, falls under the same rule as the session itself: reports are evidence, not verification. The director verifies against the artifact. Open the page, run the command, read the diff, measure the thing.

In the source project the director wrote four rounds of prompts about a website without once opening it, working from another session's written summary. Everything went wrong until they loaded the page and measured it, at which point three defects that were invisible in every report became obvious in one look.

## How this composes with phased-build

- `phased-build`'s Gate 1 (plan approval) is replaced by the SPEC, which the human writes or approves, and by STANDING-DECISIONS.md, written at the start. The implementation approach within a phase is on the decide-yourself list.
- Its Gate 2 (commit approval) moves to the PR. The session commits and opens PRs; the human merges.

## Checklist before each checkpoint report

- The task was classified, and the class was stated before any work began.
- STANDING-DECISIONS.md holds both lists and was written before the first phase.
- PROGRESS.md was updated after every phase, fix round, and blocked question, and its next action is exact.
- Every value in the report was observed in this session. Everything else says partial, NOT RUN, or NOT MEASURED.
- Every tripwire hit is an open question, not a decision the session made on the human's behalf.
- Each gate (phase boundary) had a fresh-context review of the diff since the last gate, with at most two fix rounds. Findings left at the cap were classified against the stop-and-ask list, and the rest are listed in PROGRESS.md.
- Fix rounds went only to findings that change behaviour, break a test, or violate the contract; nits are listed in the report.
- Every refusal names the missing definition.
