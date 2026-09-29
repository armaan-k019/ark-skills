# Progress: wiring and gap skills
Updated: 2026-09-29 09:56 EDT (from `date`)   Branch: feat/gap-skills (from origin/main d6f266a, upstream unset)   Last commit: d0650bf
The previous run's log (skills-graph) is in the git history of this file. Track A's log is on chore/wire-skill-references (PR #6).

## SPEC summary
Track A (chore/wire-skill-references): done, PR #6 open, not merged. Track B (feat/gap-skills, from main after Track A's PR is open): evidence-first skills, one at a time, stopping after each: B1 spec-writing, B2 visual-loop, B3 debugging (needs the author's Stage A session), B4 and B5 stop and ask. Per skill: list the evidence with paths, draft with skill-creator, eval against a no-skill baseline on a real task (both scores, tokens, time; tune once), add to families.json and rerun the extractor, commit, stop and show.

## Now
Stopped for the author: PR #7 is ready (3 commits, open, mergeable); Q8 cross-references committed on feat/gap-skills

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

- Author's answers after B1 (STANDING-DECISIONS.md, last section). Done between 2026-09-29 08:44 EDT (fix-branch checks) and 08:46 EDT (`date` when recorded):
  - fix/viz-measured-and-packing: 89c9828 (packer next-fit, measured-node counting in test_app.cjs and smoke.mjs, new reading-order test in test_layout.cjs, viz/README.md lines), 89bf8c5 (README: scroll-world's local line). PR #7 https://github.com/armaan-k019/ark-skills/pull/7, not merged. The new test fails on the old packer ("counts 4,4,5,3,2,7,2,3 at aspect 1 read 7,4,5,4,3,3,2,2"). Checks: build_graph --out equal to the committed graph; unittest 54 OK; node --test 27/27; hooks 26/26; smoke exit 0, screenshots unchanged. Built in a scratchpad worktree so this checkout never left feat/gap-skills; the worktree is removed.
  - PR #3: the author asked to merge it; it was already merged (2026-09-29 01:07 EDT, 2ec0e5a), so nothing was done.
  - PR #6: merged by the author (origin/main be693b6).

- B2 evidence (cited in the draft's source paragraph): the author's prompts of 2026-09-28 07:11 UTC (Phase 3 function only, Phase 4 STOP) and 2026-09-29 00:35, 02:40, 03:21 UTC (rounds F1 to F3, F4 to F6, F7 and F8); PROGRESS.md history 1114514 to 7812a2e ("Phase 4: STOPPED ..."); viz/scripts/smoke.mjs and viz/app.js (each decided value is a constant and an assertion: 13 px labels, family labels 11 px gray uppercase letterspaced, kind colors, dashed vendored border; the session chose 0.18, 0.25 and 10% where the author gave adjectives); the smoke test took its screenshot after clicking a node until F7 (0765695 to aa5b925); unattended-build Step 0 and the director's failure mode; LESSONS.md (browser checks that read the old frame).
- The run prompt names "six human gates"; the evidence shows five author decision points in the skills-graph run: Q1 to Q5 (2026-09-28 05:07 EDT), Q6 and F1 to F3 (20:35 EDT), F4 to F6 (22:40 EDT), the vendored question (22:55 EDT), F7 and F8 (23:21 EDT); three are visual rounds. The draft cites these.
- B2 draft in the scratchpad (draft-b2/visual-loop/SKILL.md, 76 lines) until the eval finishes. Eval iteration 1 launched at 2026-09-29 08:50 EDT: three tasks (vague-restyle, feedback-round with a false premise, reverse-earlier-decision), each run in its own clone of main be693b6 with its own port.

- B2 eval iteration 1 (scratchpad draft-b2/visual-loop-workspace/iteration-1; each run in its own clone of be693b6; graded blind per task with a random A/B label, though some outputs quote run paths that name the configuration):
  - Pass: with skill 15/15 (vague 5/5, feedback 6/6, reverse 4/4); without 7/15 (vague 1/5, feedback 5/6, reverse 1/4). aggregate_benchmark (mean of per-task rates): 100% +/- 0% vs 43% +/- 35%.
  - Tokens: with 102,781 / 150,240 / 88,801 (mean 113,941); without 143,845 / 147,867 / 126,254 (mean 139,322). Time: with 348 / 584 / 227 s (mean 386); without 619 / 593 / 375 s (mean 529). No classifier stalls in these runs.
  - Without the skill: vague restyled and committed the panel with no question; reverse lowered the labels to 11 px and rewrote the smoke floor to match, then reported it; feedback changed the page on F10's false premise (autounselectify).
  - Finding used in the tune: the smoke assertions compare the drawing with constants read from viz/app.js, so they do not hold the author's decisions. Probe on a clone of be693b6: FAMILY_LABEL set to 8 px red in app.js alone, `node viz/scripts/smoke.mjs` exit 0.
- B2 tune (one round), at 2026-09-29 09:07 EDT: Step 5 writes the decided value into the check (and drops the draft's claim that the existing checks already hold decisions); Step 3 keeps a round small (the author's rounds had 3, 3, and 2 items; the with-skill vague run asked 10 questions).

- B2 eval iteration 2 (tuned draft, with-skill only, fresh clones of be693b6, compared with iteration 1's baseline): 15/15 (vague 5/5, feedback 6/6, reverse 4/4). Tokens 105,077 / 131,410 / 105,562 (mean 114,016; iteration 1 mean 113,941; baseline 139,322). Time 1,099 / 1,301 / 1,093 s (iteration 1 with skill 386 s mean, baseline 529 s); the eval does not show why the tuned runs were slower, and one reported a smoke timeout. The vague run asked 3 questions (10 in iteration 1); the feedback run wrote 12 px into its check and a mutation of app.js alone failed it. Viewers: draft-b2/visual-loop-workspace/iteration-1/review.html and iteration-2/review.html.
- B2 committed: c9f0f22 (visual-loop/SKILL.md, 82 lines, quick_validate valid), e7ba2fa (families.json build-discipline, graph.json: 32 nodes, 50 edges, visual-loop measured: 100%), 7d911b6 (lessons). Checks at 2026-09-29 09:34 EDT: extractor exit 0; unittest OK; hooks 26/26; node --test 25/26 (test_app.cjs "3 !== 1", fixed by PR #7); smoke exit 1 (family order with build-discipline at 6, fixed by PR #7). No skill hands off to visual-loop yet (0 incoming edges).
- Combined check in a scratch clone (PR #7's branch plus both new skills and this families.json; 32 nodes, 64 edges): unittest OK, node --test 27/27, smoke exit 1: "edges the page could not route around nodes: visual-loop -> impeccable". Larger bends (380, 470) did not route it. Trying the control point at 0.3 and 0.7 along the edge as well as 0.5 did: smoke exit 0, 20 edges bent, 0 over unconnected nodes, largest empty rectangle 8.6%, smallest label 13.2 px. Patch (not applied): scratchpad proposed-viz-routing.patch (viz/app.js routeEdges, 9 lines).

- Author's answers after B2 (STANDING-DECISIONS.md, last section). Done:
  - PR #7, commit 2ef88f5: routeEdges also tries the control point at 0.3 and 0.7 after 0.5; new smoke check on scripts/fixtures/graph-routing.json (32 nodes, 64 edges). Without the change it fails ("routing fixture: edges the page could not route around nodes: [\"skill:visual-loop->skill:impeccable:skill-skill\"]"); with it, all 64 edges route. Checks at 2026-09-29 09:54 EDT on the branch: build_graph --out equal to the committed graph; unittest 54 OK; node --test 27/27; hooks 26/26; smoke exit 0 (13 edges bent as before, screenshots unchanged); unittest and node tests rerun after the README edit, both exit 0. Pushed; PR description updated; gh reports OPEN, MERGEABLE, 3 commits. Built in a scratchpad worktree, now removed.
  - Q8 on feat/gap-skills: 6d01e2e (unattended-build Step 0), a0f8ad3 (spec-writing Step 5), d0650bf (graph: 32 nodes, 52 edges; visual-loop incoming from unattended-build line 28 and spec-writing line 91). Extractor exit 0, unittest OK, hooks 26/26.
  - Q6: deferred by the author to fix/viz-checks-assert-decided-values after PR #7 merges.

## In flight
- none

## Open questions
- Q5: the final graph.json and screenshot regeneration on this branch waits until PR #7 is in main. Blocks: the last commit of feat/gap-skills. Raised: B1 stop.
- Resolved by the author on 2026-09-29: Q1 to Q4 (after B1), Q6 to Q8 (after B2).

## Decisions
- spec-writing goes in build-discipline: it writes the SPEC that phased-build and unattended-build run against. The run prompt said to add the name without naming a family.
- The eval scores are stated in SKILL.md's Known cost, so the extractor marks the node measured; wording them to avoid the extractor's pattern would hide a real measurement.
- The families.json change is committed on its own, so dropping it is one revert if the author prefers to wait for the viz fixes.
- Evals run against a clean clone of origin/main in the scratchpad, so neither configuration can see the draft skill or Track A's changes.

## Next action
Wait for the author to merge PR #7. Then: merge origin/main into feat/gap-skills (no rebase), regenerate viz/data/graph.json and both screenshots as the branch's final commit, and run the full checks with node --test. Later, on its own branch after PR #7: fix/viz-checks-assert-decided-values. B3 needs the author's Stage A session; B4 and B5 need the author first.
