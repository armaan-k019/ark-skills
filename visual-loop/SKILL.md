---
name: visual-loop
description: Run taste work (layout, typography, color, spacing, anything judged by looking) as short rounds in which the human looks at the artifact and decides, and the session builds only what was decided and turns each decision into a check. Use when asked to make a page or UI look better, cleaner, more polished, or more professional, when a human sends numbered feedback on screenshots, when a SPEC or build reaches a STOP for visual design, or when a visual change request arrives in the middle of other work. Also use when tempted to improve a design on your own initiative. For machine-checkable work with nobody watching, use unattended-build; for design craft itself, use impeccable.
---

# Visual Loop

Taste work has no command that can fail, so a session cannot tell by itself whether it succeeded, and `unattended-build` Step 0 refuses to run it unattended. This skill is what runs instead: short rounds in which the human looks at the artifact and decides, and the session builds exactly that. Each decision becomes a check as soon as it is made, so a later round cannot quietly undo it. This skill is the loop, not the design. What the design should be is the human's call, and design craft (critique, palettes, type scales) is `impeccable`'s.

Written for this repo from the skills-graph run of 2026-09-28: function-only phases, a STOP at phase 4, then three rounds of the author's feedback on screenshots (F1 to F3, F4 to F6, F7 and F8). The sources are the author's prompts for that run (session transcript, not in the repo), the history of `PROGRESS.md` from 1114514 ("Phase 4: STOPPED for the author") to 7812a2e, and `viz/scripts/smoke.mjs`, which has an assertion for each decided value. The failure it guards against is from `unattended-build`'s source project, where four unattended rounds on a visual redesign produced confident, well-tested, thoroughly wrong work. Two rules come from this skill's own eval (Eval and cost, below): writing the decided value into the check (Step 5) and keeping a round small (Step 3).

## When not to use it

- The result can be checked by a command. Use `unattended-build` or `phased-build`.
- Choosing the design. This skill never picks a look; it carries the human's choices into the build.
- Copy and wording are taste too, but this skill was written from a visual case and has not been tried on them.

## Step 1: Build function first, with plain defaults

Get everything a command can check done and green before the first round, so each round changes only how it looks. The skills-graph SPEC did this with a function-only phase ("Plain default styling only: system font, neutral background, no custom palette, no animation") followed by "Phase 4: STOP. Do not style the page." When a round asks for defaults ("No palette work, just distinguishable defaults"), use the library's defaults, not a palette you chose.

## Step 2: Show the artifact, and say what state it shows

End each round with what the human will judge: a screenshot for each state that matters, the page's address, and the numbers behind it (counts, sizes, the rule that generated the data). Label each screenshot with the state it shows. Until F7, the smoke test took its one screenshot after clicking a node, so from F5 on the author was judging a page with one node selected and every other node dimmed. F7 asked for the unfocused state as the default screenshot and a second one for focus.

Look at your own screenshots before sending them. Reports are evidence, not verification (`unattended-build`, "The director's failure mode"), and that applies to the session's own images too.

## Step 3: Take decisions as numbered items, and build only those

The author's rounds came as numbered items with values: "F6 Typography and color. Family labels: uppercase, letterspaced, 11 px, gray. Node labels: 13 px minimum." Build each item as written and nothing else visual; "Styling is still mine." Something that looks off but was not asked for goes in the round's report as an observation, not into the code.

If the request is vague ("make it look better"), do not choose for the human. Show the artifact (Step 2), say what you observe, and ask what to change, item by item. Keep a round small: the author's rounds had three, three, and two items. Lead with the few observations that matter most and list the rest as notes, instead of asking about all of them at once.

## Step 4: Check each item before building it

- **Premises.** "Both are mine, not vendored" was false for scroll-world (the README and its LICENSE say it is vendored); the session asked before changing either file.
- **Goal against method.** F8 said "no box ends with a single-node row (use ceil(sqrt(n)) columns per family)". That formula leaves a lone member for families of 3 and 7, so the session kept the goal, widened the columns, and said so in its report.
- **Earlier rounds.** An item that would loosen a check from an earlier round (the 13 px label floor, say) reverses that round's decision. Name the check and the round, and get the reversal confirmed before changing the check. The check is the only record that the earlier decision was made, and `verify-before-done` never weakens a check to make a change pass.

## Step 5: Turn each decision into a check as soon as it is made

In the skills-graph run every decided value became a smoke assertion:
- labels at least 13 px as drawn (F6);
- family labels uppercase, letterspaced, gray, and 11 px (F6);
- one color per node kind (F2, F6);
- a dashed border on vendored nodes (F4);
- the focus opacities (F5);
- boxes ordered by size with no lone last-row member, and no empty rectangle over 10% of the canvas (F8).

Write the decided value into the check itself. Those smoke assertions compare the drawing with constants read from `viz/app.js`, so they hold the drawing to the code, not to the decision: with the family labels changed to 8 px red in `app.js` alone, the smoke test still exits 0. A check that states "12 px" fails when someone edits the constant without the human, and that is what lets a later round not undo this one silently. Machine-checkable work between rounds then runs under the usual rules. Where the human gave an adjective instead of a number, the session picked the number: 0.18 and 0.25 for F5's "low opacity" and "dim", and 10% for F8's "no large empty region". Say in the report which numbers you chose, so the human can change them.

A browser check of a visual state waits for that state instead of reading it once (`LESSONS.md`, "A browser check that reads state right after an event can read the old frame").

## Step 6: Stop after each round

One round, then stop with the regenerated artifacts: "regenerate the screenshot and stop again." Do not start on what the next round will probably ask for. Machine-checkable work that the round also asks for (a review pass, a PR, a separate branch) is done in the same round under `verify-before-done` and the rest of the usual rules.

Report each round in this shape:

```
Round <n>
Built:     <item>: <commit>, <what changed>
Checks:    <item>: <assertion and its value>  (chosen by <author | session>)
Artifacts: <screenshot path>: <state it shows>
Noticed, not changed: <observations>
Questions: <premises, conflicts, reversals of earlier rounds>
```

## Eval and cost

Measured with `skill-creator` on three rounds built from this page: a vague "the side panel looks cluttered, make it look better", a round of three items one of which rests on a false premise, and an item that reverses the 13 px label floor. Each run worked in its own clone and was graded on its reply and the repo state it left. With this skill the pass rate was 100% (15 of 15 assertions, before and after one round of tuning); without it, 7 of 15. Without the skill, sessions restyled and committed the panel on the vague request, lowered the label floor and rewrote its check without asking, and changed the page on the false premise. With it, they built nothing on the vague request, asked before reversing the earlier decision, and flagged the false premise.

A round cost about 114k tokens with the skill against about 139k without it, because the skill stops to ask instead of building; the tuning round left that unchanged (114k before and after). Wall time was 386 s per round with the skill against 529 s without in the first round. The tuned runs took about 1,165 s each, which this eval does not explain (one of them hit a smoke-test timeout).

## Checklist before ending a round

- Function was green before the first round, with plain defaults.
- Every screenshot is labeled with the state it shows, and you looked at each one.
- Only the numbered items were built; everything else is an observation.
- Each item's premises, goal and method, and effect on earlier checks were checked first.
- Every decision is now a check that states the decided value, and every number the session chose is reported as the session's.
- The round stopped with regenerated artifacts and the report above.
