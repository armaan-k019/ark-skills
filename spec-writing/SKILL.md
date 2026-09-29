---
name: spec-writing
description: Write or check the SPEC that a multi-phase coding run builds against, before the run starts. Numbered phases, acceptance criteria written as commands that fail until the work is done, decide-yourself and stop-and-ask lists, scope boundaries, and which criteria are taste that only a human can judge. Use when asked to write a spec, a run prompt, or a brief for an autonomous, overnight, or unattended session, to "turn this into a SPEC", to plan a follow-up branch that another session will run, or to review a SPEC or run prompt before launching it. Also use when a run keeps stopping on questions the SPEC should have answered. For running the build itself, use unattended-build.
---

# Spec Writing

A run can fix its own code, but not its own SPEC. Every defect in the SPEC becomes a stop, or a confident build of the wrong thing, hours after the author has walked away. This skill is for writing the SPEC and for checking one before it is handed over. The run itself (STANDING-DECISIONS.md, PROGRESS.md, reporting only observed values, review at each gate) is `unattended-build`'s contract, and this skill does not restate it.

Written for this repo from its own run prompts (2026-09-26 to 2026-09-29) and the stops they caused. The main source is the skills-graph run: its questions Q1 to Q6 in the history of `PROGRESS.md`, the approved changes at the end of the history of `STANDING-DECISIONS.md`, `docs/decisions/0002-skill-discovery-skips-node-modules.md`, and `LESSONS.md`. Three rules come from this skill's own eval (Known cost, below): the "no commit" label in Step 3, the end of Step 4's second rule, and the check of what the SPEC's own commands write in Step 6. Each rule below names the stop or failure it comes from.

## When not to use it

- A task a human will watch through one sitting. `phased-build`'s intake and plan cover it.
- Work that is taste as a whole (visual design, copy, layout). It gets short loops with the human looking at the artifact, as `unattended-build` Step 0 says. This skill only helps pull taste criteria out of a SPEC that is otherwise machine-checkable (Step 5).
- A SPEC is a product decision. When Claude drafts one, what the software should do comes from the author; anything Claude had to guess goes in a question list at the top, not into the phases.

## Step 1: Check every premise against the repo

A SPEC states facts about the repo, and the run acts on them. Check each one with a file read or a command before the SPEC goes out: counts, paths, what a tool covers, what is installed, who wrote what, what a branch contains. In this repo's prompts:

- "Both are mine, not vendored" was false for scroll-world (the README and `scroll-world/LICENSE` say it is vendored). The run stopped and asked.
- "Outline or badge the one node with a measured eval": no node had one at the time (the graph had 0 measured nodes).
- "Playwright ... ask first if it is not already available": it was not (Q1). The stop was designed in, which is the right way to handle a premise the author is unsure of.
- The phase 5 vetting relied on `vet-third-party/scripts/scan.py`, whose extension list has no `.rs`, so it scanned none of a Rust project's source (Q5). Check that a required tool covers this input, not only that it exists.

Write each checked number into the SPEC ("the 16 em dashes in the body", "7 isolated nodes"), so the run can confirm it at the start and stop if the repo has moved.

## Step 2: Use the section skeleton

This is the shape of the skills-graph run prompt (2026-09-28, phases 0 to 5):

```
<Autonomous run | Phased run>. Repo: <path>. Branch: <name> (create from <base>).
Skills to load: unattended-build (governs this run), <others>. Follow them; do not restate them.

QUESTIONS FOR THE AUTHOR   (only in a draft; empty before handover)

GOAL
<what exists at the end, in two or three sentences>

SCOPE
- Write only under: <paths>
- Do not modify: <paths>
- Do not touch: <outside-repo paths>

DECIDE YOURSELF
- <choices the run makes and records>

STOP AND ASK
- <run-specific tripwires; the defaults are in unattended-build Step 1>

PHASES (each phase that changes the repo ends with its own commit)
Phase 1: <name>
<deliverable>
ACCEPTANCE:
  <command>    <expected result>

Phase <n>: STOP
<what to show the author, then wait>

REVIEW GATES
<after which phases, which reviewers, severity floor, max fix rounds>

REPORTING RULES
<only what differs from unattended-build Step 3>

FINISH
<final checks, where the branch is left, what to hand back>
```

## Step 3: Number the phases

- Each phase that changes the repo has one deliverable, one commit, and its own acceptance. A phase that only checks the starting state, and a STOP phase, say "no commit" in their heading, so the run does not invent one.
- Put independent work in its own phase and say it does not block ("Phase 5 (separate, do not block on phase 4)").
- Where taste starts, end the machine-checkable run with a STOP phase that says what to show and to wait: "Phase 4: STOP. Do not style the page. Post the screenshot, the counts, and the edge-detection rule, and wait for me." Bound the phase before it too ("Plain default styling only"), so the run does not make taste decisions early.
- When two branches or PRs change the inputs of the same generated file, say which one regenerates it after the other merges. PR #5 changed a skill description, PR #4 carried a `viz/data/graph.json` generated before that change, and main's freshness test failed once both merged.

## Step 4: Write acceptance as commands that can fail

1. **A command and the result it must show.** `python3 viz/scripts/build_graph.py  exits 0`; `python3 -m unittest discover viz/scripts  exits 0, and the pass count is recorded`. A criterion the run cannot execute is not acceptance.
2. **It must fail today.** Run each acceptance command on the current repo before handing the SPEC over. "Isolated nodes drop from 7 to at most 2" fails on the starting repo, so passing it means the work happened. A command that already passes checks nothing about the new work, the same way a regression test that passes on the old code proves nothing (`LESSONS.md`). Commands that guard what must not break (existing test suites) are the exception: label them as guards. Running the command is enough. Do not write the change, a reference solution, or deliberately broken versions to show that it can pass: the implementation approach is on the run's decide-yourself list (`unattended-build` Step 1).
3. **Say what a proxy stands for.** Phase 1 checked the node count against `find . -name SKILL.md -not -path "./.git/*"`. Once the approved Playwright install put three SKILL.md files in `viz/node_modules`, the command counted 33 against the graph's 30 and the run stopped (Q6). Writing "the count of this repo's skills" next to the command lets a run see when the proxy has drifted from the intent. Then check each proxy against the SPEC's own approved changes: an approved dependency can change what a repo-wide scan sees.
4. **Give a bound and ask for the remainder** when the exact number is not knowable in advance: "Isolated nodes drop from 7 to at most 2 (report which remain and why)."
5. **Define every term a check depends on.** "Eval status: measured only if a SKILL.md states a score" did not settle whether an upstream benchmark quoted in a vendored skill counts (Q4).
6. **Say whether a list is complete.** The SPEC listed three edge kinds; the repo also had skill-to-agent and agent-to-agent references, and the run stopped to ask (Q3). Write "at least these", or name what happens to the rest.
7. **When a criterion gives a goal and a method, say which wins, and try the method.** "No box ends with a single-node row (use ceil(sqrt(n)) columns per family)": that formula leaves a lone member for families of 3 and 7. The run kept the goal and widened the columns (`viz/scripts/test_layout.cjs`). A short loop over the sizes would have caught this before the SPEC went out.

## Step 5: Mark each criterion machine-checkable or taste

Classify each criterion, not only the task, with `unattended-build` Step 0. A criterion that is a command goes in a phase. "Looks polished", "reads well", or "feels premium" goes behind a STOP phase with an artifact for the author to judge: a screenshot, a rendered page, a draft.

A taste decision the author has made can become a check, if it is written as a number. "Node labels: 13 px minimum" became a smoke assertion (the smallest label must be at least 13 px). "No large empty region" did not say how large, so the run picked the threshold itself (at most 10% of the canvas). In a follow-up SPEC, write the number, not the adjective.

## Step 6: Write the scope and the two lists

- **Scope in both directions:** where the run may write ("Write only under viz/, plus PROGRESS.md, STANDING-DECISIONS.md, docs/decisions/") and what it must not modify ("Do not modify any existing SKILL.md, agents/, hooks/").
- **Check each skill and tool the SPEC names against the scope.** The FINISH step said to run `capture-lessons`, which writes `LESSONS.md` at the repo root, outside the SCOPE, so the run stopped (Q2). The same SPEC named `docs/decisions/` in scope because it also asked for `decision-records`, and that one never stopped.
- **Check what the SPEC's own commands write,** not only the skills it names. `python3 viz/scripts/build_graph.py` without `--out` rewrites the committed graph, and `npm test` writes a log under `~/.npm/_logs`. A scope that says "nothing else" has to hold for those too.
- **Pre-approve with terms, or leave it a tripwire.** "A dev-only Playwright" still needed an answer on where it lives, pinning, and whether to download browsers (Q1). If an item is approved in advance, say how.
- **Put only run-specific items in the lists.** The general defaults are in `unattended-build` Step 1. The SPEC adds what only it knows: the named dependencies, the paths, the actions it forbids for this run ("Enabling GitHub Pages, deploying anything, or touching the portfolio repo").

## Step 7: Read it once as the run will

Read the SPEC top to bottom, looking for two instructions that cannot both hold. One follow-up prompt said "Do not merge" in its first line and "merge PR #2 yourself" in its last; the run had to stop and ask which. A follow-up prompt that changes the SPEC says what it replaces.

## Known cost

Measured with `skill-creator` on three SPECs for real follow-ups in this repo (the scanner's Rust gap, the em dashes in recruiter-demo-writer's body, and polish plus a search box for viz/), 10 assertions each, graded by agents that ran each SPEC's commands on a clean clone and were not told which configuration wrote it. With this skill the pass rate was 90% (27 of 30, before and after one round of tuning); without it, 70% (21 of 30). Sessions without the skill already found `unattended-build` in this repo and wrote both lists, a checked premise, and acceptance that fails today. The difference was a commit and acceptance for every phase that changes the repo, scope in both directions, and commands that write outside the scope.

Writing a SPEC with this skill took about 243k tokens, against about 175k without it. The tuning round (running an acceptance command is enough; do not build the change) left that where it was: 242k before, 243k after. Treat it as the cost of checking every premise and running every command before handover, not as a defect to tune away. Wall time was not comparable, because a permission-classifier outage stalled the first round's runs.

## Checklist before handing the SPEC over

- Every premise about the repo was checked, and the checked numbers are in the SPEC.
- Phases are numbered; each phase that changes the repo has one commit and its own acceptance, and the others say "no commit".
- Every acceptance line is a command with an expected result, and every command that checks new work fails on the current repo.
- Proxies say what they stand for, and still hold after the SPEC's own approved changes.
- Terms are defined, lists say whether they are complete, and goals win over methods.
- Taste criteria sit behind a STOP phase with an artifact to judge.
- Scope names both directions, and every skill or tool the SPEC names writes only inside it.
- Pre-approved items carry their terms; everything else is a tripwire.
- No two instructions contradict each other, and the question list is empty.
