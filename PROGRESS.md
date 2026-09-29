# Progress: wiring and gap skills
Updated: 2026-09-29 08:46 EDT (from `date`)   Branch: feat/gap-skills (from origin/main d6f266a, upstream unset)   Last commit: d211d16
The previous run's log (skills-graph) is in the git history of this file. Track A's log is on chore/wire-skill-references (PR #6).

## SPEC summary
Track A (chore/wire-skill-references): done, PR #6 open, not merged. Track B (feat/gap-skills, from main after Track A's PR is open): evidence-first skills, one at a time, stopping after each: B1 spec-writing, B2 visual-loop, B3 debugging (needs the author's Stage A session), B4 and B5 stop and ask. Per skill: list the evidence with paths, draft with skill-creator, eval against a no-skill baseline on a real task (both scores, tokens, time; tune once), add to families.json and rerun the extractor, commit, stop and show.

## Now
Track B, B2 visual-loop, step: gathering evidence (B1 reviewed by the author)

## Done and verified
- Track A: PR #6 (https://github.com/armaan-k019/ark-skills/pull/6), acceptance and gate in that branch's PROGRESS.md.
- B1 evidence gathered (listed in the skill's source paragraph): the author's run prompts of 2026-09-26, 2026-09-28, and 2026-09-29 (session transcript, not in the repo); PROGRESS.md history on origin/main (Q1 to Q6); STANDING-DECISIONS.md on origin/main (approved changes Q1 to Q6); docs/decisions/0002; LESSONS.md; viz/scripts/test_layout.cjs and smoke.mjs.
- B1 eval iteration 1 (scratchpad spec-writing-workspace/iteration-1; three tasks from this repo: a SPEC for the Rust scanner gap, for the 16 em dashes in recruiter-demo-writer's body, and for viz polish plus a search box; 10 assertions each; graded blind by one grader per task, each running the SPEC's commands on a clean clone of d6f266a):
  - Pass rate: with skill 27/30 (rust 10, em-dash 7, viz 10); without 21/30 (rust 7, em-dash 7, viz 7). aggregate_benchmark: 90% +/- 17% vs 70% +/- 0%.
  - Tokens: with skill 240,367 / 215,974 / 271,051 (mean 242,464); without 207,436 / 157,587 / 160,039 (mean 175,021). Delta +67,443 per SPEC.
  - Time: NOT comparable. Every run launched at 01:31 spent long stretches blocked on the auto-mode classifier (no verdict); two runs stalled and were relaunched. Observed: with 13,061 s / 10,646 s / 11,338 s; without 10,297 s / 1,079 s (retry) / 9,940 s.
  - Assertions passed by every run (not discriminating): acceptance fails today, both lists, no em dash, premise count. Discriminating: a commit and acceptance per phase, scope in both directions, tools writing outside scope, and staying inside the requested change.
  - Grader notes: the blind label shuffle put the with-skill SPEC under A in all three tasks; each grader saw one task only.
- Tune (one round), from iteration 1: phases that do not change the repo say "no commit" (the skill contradicted its own STOP template); running an acceptance command is enough, no building the change to prove it can pass (cost); check what the SPEC's own commands write (`build_graph.py` without `--out`, `npm test` logs in ~/.npm/_logs).

- B1 eval iteration 2 (the tuned skill, with-skill only, same prompts, compared with iteration 1's baseline; graded on a clean clone by graders not told the configuration; the iteration-2 grader prompts also named incidental writes such as temp directories and ~/.npm/_logs under expectation 6, which iteration 1's did not):
  - Pass rate: with skill 27/30 (rust 8, em-dash 9, viz 10); without 21/30 (unchanged). aggregate_benchmark: 90% +/- 10% vs 70% +/- 0%.
  - Tokens: with skill 245,207 / 207,762 / 275,105 (mean 242,691; iteration 1 mean 242,464); without mean 175,021. The tune did not lower the cost, so it is recorded in SKILL.md's Known cost as a property.
  - Time: with skill 2,487 s / 2,368 s / 2,523 s (no stalls observed); baseline times are the stalled iteration-1 values, so no time comparison is claimed.
  - Remaining failures: expectation 1 (a commit on every phase) fails where a SPEC labels a setup or STOP phase "no commit", which the tuned skill asks for; graders flagged the assertion's wording. Rust expectation 6: `python3 -m unittest discover viz/scripts` makes temp directories in viz/scripts/, which that SPEC's scope marked do-not-modify.
  - Viewer: scratchpad spec-writing-workspace/iteration-2/review.html (iteration 1's is in iteration-1/).
- B1 committed: d91f7ba (run contract), 832bba9 (spec-writing/SKILL.md), 1a970ea (families.json and graph), d211d16 (lessons). Contents: spec-writing/SKILL.md (123 lines, `quick_validate.py`: valid); viz/scripts/families.json (build-discipline); viz/data/graph.json regenerated, 2026-09-29 08:33 EDT:
  - `python3 viz/scripts/build_graph.py`: exit 0; 31 nodes (26 skills, 2 agents, 3 hooks), 44 edges; spec-writing measured: 90% (eval_line 109), the only measured node; 8 outgoing edges (capture-lessons, decision-records, phased-build, recruiter-demo-writer, scroll-world, skill-creator, unattended-build, vet-third-party).
  - `python3 -m unittest discover viz/scripts`: 54 tests OK. `node hooks/test-hooks.js`: all 26 passed.
  - `node --test` on the three viz test files (npm test's script, run without npm): 25 pass, 1 FAIL (test_app.cjs:62, "2 !== 1"). See Q4.
  - `node viz/scripts/smoke.mjs`: exit 1, "family boxes out of order" (Q3); the outline check would also fail (Q4). Screenshots not regenerated.
- LESSONS.md: two entries (exit status after a subshell; tests that assume no case exists).

- Author's answers after B1 (STANDING-DECISIONS.md, last section). Done, 2026-09-29 08:44 to 08:50 EDT:
  - fix/viz-measured-and-packing: 89c9828 (packer next-fit, measured-node counting in test_app.cjs and smoke.mjs, new reading-order test in test_layout.cjs, viz/README.md lines), 89bf8c5 (README: scroll-world's local line). PR #7 https://github.com/armaan-k019/ark-skills/pull/7, not merged. The new test fails on the old packer ("counts 4,4,5,3,2,7,2,3 at aspect 1 read 7,4,5,4,3,3,2,2"). Checks: build_graph --out equal to the committed graph; unittest 54 OK; node --test 27/27; hooks 26/26; smoke exit 0, screenshots unchanged. Built in a scratchpad worktree so this checkout never left feat/gap-skills; the worktree is removed.
  - PR #3: the author asked to merge it; it was already merged (2026-09-29 01:07 EDT, 2ec0e5a), so nothing was done.
  - PR #6: merged by the author (origin/main be693b6).

## In flight
- none

## Open questions
- Q5: the final graph.json and screenshot regeneration on this branch waits until PR #7 is in main (the author's merge order). Blocks: the last commit of feat/gap-skills. Raised: B1 stop.
- Resolved by the author on 2026-09-29: Q1 (merge order), Q2 (npm logs: use node --test), Q3 and Q4 (PR #7).

## Decisions
- spec-writing goes in build-discipline: it writes the SPEC that phased-build and unattended-build run against. The run prompt said to add the name without naming a family.
- The eval scores are stated in SKILL.md's Known cost, so the extractor marks the node measured; wording them to avoid the extractor's pattern would hide a real measurement.
- The families.json change is committed on its own, so dropping it is one revert if the author prefers to wait for the viz fixes.
- Evals run against a clean clone of origin/main in the scratchpad, so neither configuration can see the draft skill or Track A's changes.

## Next action
B2 visual-loop: list the evidence for the viz run's human gates from the author's prompts and PROGRESS.md history, then draft with skill-creator.
