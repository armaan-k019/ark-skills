# Lessons: efficiency run (2026-09-30)

In the capture-lessons format. Neither repo's LESSONS.md is in this run's scope, so the entries are here; each says where it belongs and, for a repeat, which existing entry it merges into and the count that entry reaches.

## A per-line field in a log records that line's state, not the message's
Seen: 2026-09-30 (ark-console, first run), 2026-09-30 (ark-console, efficiency run)   Count: 2
Merges into: ark-console LESSONS.md, "A per-line field in a log records that line's state, not the session's" (count 1 to 2).

Context: summing token usage per API message from Claude Code transcripts.
Root cause: in session transcripts every line of one message carries the same usage, so taking the first line looked safe; subagent transcripts write usage as the message streams, so output_tokens grows from line to line (2,296 subagent messages). The survey that set the rule read session transcripts only.
Next time I aggregate a field from a log, I will check how it varies across the lines of one record in every kind of file the log has, before choosing which line to keep.
Evidence: the Phase 1 reviewer; 7-day output tokens 4,832,012 with the first line against 6,203,787 with the last (ark-console d603781).

## A test that cannot fail on the old code, or on its own data, proves nothing
Seen: 2026-09-28 (ark-skills), 2026-09-30 (ark-console, twice), 2026-09-30 (ark-console, efficiency run)   Count: 4
Merges into: ark-skills LESSONS.md (count 3 to 4) and ark-console LESSONS.md (count 2 to 3).

Context: the Phase 2 page check for the usage tables.
Root cause: the check compared one row (total tokens) with the JSON and trusted the rest; the first page mutants were chosen by me, so they hit the row the check covered.
Next time I write a check for rendered data, I will compare every cell with its source through rules written in the check, and run single-change mutants of each rendered field before calling it done.
Evidence: six of the reviewer's mutations (Input and Output swapped, a missing value shown as 0, and four more) passed the first check; all six fail the rewritten one (ark-console d6cb492).

## A number means what its source computes, not what its name says
Seen: 2026-09-30 (efficiency run, Phase 4)   Count: 1
Belongs in: the cross-project lessons file (it is about measuring, not one codebase).

Context: choosing the primary token measure for the before-and-after experiment.
Root cause: I named the harness's per-subagent `subagent_tokens` as the measure before checking what it counts; it matched each run's final context plus output within 300 tokens, so it measured context size, and it moved the opposite way from tokens processed.
Next time I name a measure in an experiment card, I will reconcile it once against a second source on a trial run before any run counts.
Evidence: experiments.md, Summary: sonnet median 87,404 against 47,798 on the notice, 329,044 against 413,398 by transcript.

## Adding a file of a kind the repo indexes needs the index changed too
Seen: 2026-09-30 (efficiency run, Phase 5)   Count: 1
Belongs in: ark-skills LESSONS.md; related to "A generated file goes stale when another branch changes its inputs" (a different mechanism).

Context: adding model-routing/ as the one new skill directory the SPEC allowed.
Root cause: viz/scripts/build_graph.py requires every skill to be listed in viz/scripts/families.json, and a test checks that viz/data/graph.json is current; the SPEC's scope did not include viz/, and the premise check did not run the repo's tests with a skill added.
Next time a run will add a skill (or any file a generator in the repo reads), I will run the repo's own tests on a scratch copy with a stub added during the premise check, and put the extra files in the first scope question.
Evidence: `python3 -m unittest discover viz/scripts`: "nodes not listed in any family in viz/scripts/families.json: model-routing"; the same tests pass on main (fee91b9) and on bb17388.

## Load every skill the SPEC says governs before the first phase
Seen: 2026-09-30 (efficiency run)   Count: 1
Belongs in: ark-skills LESSONS.md (the rule would go in unattended-build's Step 1).

Context: the SPEC said experiment-discipline "governs every number in this run".
Root cause: I loaded only unattended-build at the start and experiment-discipline after Phase 1's numbers were written.
Next time a SPEC names skills that govern the run, I will load each one before writing STANDING-DECISIONS.md.
Evidence: the Skill call for experiment-discipline in this session's transcript is timestamped 2026-09-30T18:50:01.087Z (14:50:01 EDT), after Phase 1's acceptance; the card for Phase 4 was written after it, which is why Phase 4 has one.

## Times written into reports from memory instead of the clock
Seen: 2026-09-27, 2026-09-28, 2026-09-29 (twice) (ark-skills), 2026-09-30 (efficiency run)   Count: 5
Merges into: ark-skills LESSONS.md, same title (count 4 to 5).

Context: recording the Phase 1 acceptance run in PROGRESS.md.
Root cause: I wrote "14:4x EDT" from memory instead of taking the time from `date` in the same step.
Next time I record when a check ran, I will run it again with `date` before and after and quote those.
Evidence: PROGRESS.md was amended to "from 14:52:23 to 14:52:28 EDT" after re-running `bash scripts/accept-usage.sh`.

## zsh is not bash: colon modifiers, unmatched globs, and unsplit variables
Seen: 2026-09-28, 2026-09-29 (twice) (ark-skills), 2026-09-30 (ark-console run, twice), 2026-09-30 (efficiency run, twice)   Count: 7
Merges into: ark-skills LESSONS.md, same title (count 5 to 7).

Context: shell probes in the efficiency run.
Root cause: `G="git -c user.name=t ..."; $G init` runs a command named the whole string, because zsh does not split an unquoted variable; `basename` read a path starting with "-" as an option; `--include=*.jsonl` unquoted was taken as a glob.
Next time I need a command with fixed arguments in zsh, I will write a function, quote every glob, and pass paths after `--`.
Evidence: "command not found: git -c user.name=t -c user.email=t@t -c init.defaultBranch=main"; "basename: illegal option -- U"; "no matches found: --include=*.jsonl".

## A Unicode category test includes ASCII characters
Seen: 2026-09-30 (efficiency run)   Count: 1
Belongs in: the cross-project lessons file.

Context: escaping hidden characters before writing docs/ROUTER-EVAL.md.
Root cause: the space character is in category Zs, so a rule "escape Cf, Cc, Zs" escaped every ordinary space.
Next time I filter characters by Unicode category, I will restrict the rule to code points above 127 first, and assert on the result before writing.
Evidence: the assertion on the first line failed and nothing was written; the second pass escaped only U+2060 and U+2063.

## A check that writes a committed file is overwritten by every mutant run
Seen: 2026-09-30 (ark-console: styling rounds 2, 3, X3, and efficiency Phase 2)   Count: 4
Belongs in: ark-console LESSONS.md.

Context: proving page checks with single-change mutants.
Root cause: scripts/check-page.js writes docs/screenshot.png on every run, so each mutant run leaves a screenshot of broken code in the working tree.
Next time I run mutants against a check that writes an artifact, I will regenerate the artifact with a clean run after the last mutant, before committing.
Evidence: each round's report regenerated docs/screenshot.png after its mutants.

## Promotions proposed (not applied)
- zsh, count 7 across ark-skills and ark-console: one line in the user-level CLAUDE.md: "The shell is zsh: put a command with arguments in a function, not a variable; quote globs; pass paths after --."
- A test that cannot fail, count 4 across two projects: a rule in verify-before-done's Step 2: "Before reporting a check as PASS for the first time, show it fails on one single-change mutant of what it checks."
- Times from memory, count 5 in one project: one line in ark-skills' CLAUDE.md, or a check in unattended-build: "Every time in PROGRESS.md is quoted from `date` in the same step."
- The overwritten screenshot, count 4 in one project: change scripts/check-page.js to write docs/screenshot.png only with a flag (a code change for a later run), or one line in ark-console's CLAUDE.md.
