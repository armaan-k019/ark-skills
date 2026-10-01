# Lessons

Project lessons for ark-skills, in the capture-lessons format. Each entry is a pattern, not an event.

## Times written into reports from memory instead of the clock
Seen: 2026-09-27 (ark-skills, unattended-build eval re-run), 2026-09-28 (ark-skills, skills-graph run), 2026-09-29 (ark-skills, gap-skills run, twice), 2026-09-30 (ark-skills, efficiency run)   Count: 5

Context: keeping PROGRESS.md during an unattended run.
Root cause: the time was typed as an estimate while writing, not read from a clock in the same step.
Next time I write a time into a report, I will paste it from a `date` call made in the same step, or write "not clock-stamped".
Evidence: PROGRESS.md said 03:52 when `date` read 03:22 (review gate 1 flagged it); the eval re-run's PROGRESS.md held two estimated "Updated" times. On 2026-09-29 a script wrote 08:41 into PROGRESS.md while the `date` call in the same command printed 08:35; the time was typed into the script before the clock was read.
Promoted to: unattended-build Step 2 ("Every time in PROGRESS.md comes from `date` in the same step."), PR #3. The third case happened with the rule in place: pass the `date` output into the script as an argument instead of typing the time. The fourth case was the end of a time range typed into body text (08:50 when `date` read 08:46) while the header used the passed-in value: every time in the text, not only the header, comes from the argument. The fifth case (efficiency run) was "14:4x EDT" typed for an acceptance run; PROGRESS.md was amended to "from 14:52:23 to 14:52:28 EDT" after re-running the check with `date` before and after.

## Escape sequences in tool input are decoded before they reach the file
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: documenting that graph.json stores em dashes as JSON escapes.
Root cause: a backslash-u escape typed into a Write call's content was decoded into the real character, so the file got the em dash the sentence said it avoided.
Next time I need a literal backslash escape in a file, I will write it through a script, then scan every written file for dashes, not only the ones written by scripts.
Evidence: viz/README.md line 68 held a literal U+2014 (review gate 1, ts-reviewer).

## Regex substitutions over source code can break it
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: replacing every `read_text(encoding="utf-8")` call in build_graph.py with a helper.
Root cause: a regex matched across an expression boundary and moved a parenthesis.
Next time I bulk-edit code with a regex, I will compile it and read the diff before running anything.
Evidence: `for idx, read(line in enumerate(path).split(...))`, caught by py_compile before use.

## A regression test that passes on the old code proves nothing
Seen: 2026-09-28 (ark-skills), 2026-09-30 (ark-console, first run, twice), 2026-09-30 (ark-console, efficiency run), 2026-10-01 (ark-console, round V2-1)   Count: 5

Context: turning review findings into tests.
Root cause: the first BOM test asserted a node id that the old fallback happened to produce, so it passed with or without the fix; in ark-console the fixture sessions were already in sorted order and the only resolved question started with "Resolved", so a missing sort and a broken marker rule both passed.
Next time I add a test for a review finding, I will run it against the reviewed version and confirm it fails there first.
Evidence: the BOM test passed on the staged extractor until it asserted the parsed name; after that, all 19 regression tests added in this run (14 for review gate 1, 4 for the new edge kinds, 1 for node_modules) failed on the code they guard. The same root cause recurred in ark-console four times (its LESSONS.md, "A test that cannot fail on the data it is given proves nothing"), most recently a page check that compared only one row of a table, and a fixture whose long item could not tell a mid-word cut from a word cut. Two projects now: proposed for verify-before-done Step 2, "Before reporting a check as PASS for the first time, show it fails on one single-change mutant of what it checks." ark-console's T16 guard failed on the first fixtures, and scripts/mutants.js reported resolved-counts-as-open as surviving until a fixture line was added.

## Adding a dependency can change what a repo-wide scan sees
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: installing Playwright under viz/ for the smoke test.
Root cause: playwright-core 1.63.0 ships three SKILL.md files, and both the extractor and the phase 1 acceptance command scan the whole tree.
Next time I install a package inside a repo that a script or acceptance command scans, I will re-run the scan's counts before and after the install.
Evidence: the graph went from 25 to 28 skills and 5 to 6 families after `npm install`; fixed by skipping node_modules (commit 3e4bddf); acceptance question Q6 in PROGRESS.md.

## A browser check that reads state right after an event can read the old frame
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: the smoke test unchecks an edge-kind filter and counts visible edges.
Root cause: Cytoscape applies class changes on its next frame, so `visible()` read immediately still counted the edges.
Next time a browser test checks the result of a UI event, I will wait for the expected state with a timeout instead of reading it once.
Evidence: "edge kind filter: 36 edges visible, expected 5", while the same edges showed display none once the style was read.

## Headless Cytoscape keeps Node running until it is destroyed
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: a Node check that ran the page's layout in headless Cytoscape.
Root cause: the headless instance keeps a timer loop alive after the script's last line.
Next time I use a headless Cytoscape instance in a script or test, I will call `cy.destroy()` in a finally block and run the first attempt under a watchdog.
Evidence: the check printed its result and then hung past the 120 s tool timeout; with `cy.destroy()` the test exits in about 1 s.

## Stopping a process by anything but its own PID hits the wrong process
Seen: 2026-09-28 (ark-skills, skills-graph run), 2026-09-29 (ark-skills, wiring run)   Count: 2

Context: stopping a hung background Node process, and later a local `python3 -m http.server` started for the smoke test.
Root cause: the handle did not name the process. `ps | grep` on a script's text matched the wrapper shells too; `cmd && python3 -m http.server ... &` backgrounds the whole list, so `$!` is the subshell's PID and killing it left the server listening.
Next time I start a process I may need to stop, I will start it as its own statement so `$!` is its PID, kill only that PID, and confirm the port or process is gone afterwards.
Evidence: the kill loop ended the current command with exit 144; a server stayed listening on port 8123 until it was found with `lsof` and stopped.

## A static scanner's file-type list decides what it can find
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: vetting ccboard with vet-third-party/scripts/scan.py.
Root cause: the scanner's TEXT_EXT set has no `.rs`, so none of ccboard's 175 Rust files were scanned, and every serious finding (0.0.0.0 bind, open CORS, unmasked secrets, hook overwrite) was in Rust.
Next time a scan reports on a repo, I will compare its scanned extensions with the repo's source languages before trusting its counts.
Evidence: viz/MONITOR-EVAL.md, "A gap in the vetting tool itself". Fixing the scanner is left for its own branch (author's decision, PROGRESS.md Q5).

## A punctuation change inside YAML frontmatter can break the file
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: replacing an em dash in recruiter-demo-writer's frontmatter description with a colon.
Root cause: the description is an unquoted YAML scalar, and a colon followed by a space inside it starts a mapping, so the file no longer parsed ("mapping values are not allowed here").
Next time I edit a SKILL.md description, I will parse the frontmatter with a YAML parser before committing, and prefer commas or parentheses over colons in unquoted values.
Evidence: commit ecee511 on fix/em-dash-in-descriptions (never pushed) failed yaml.safe_load; replaced by d686c46, which uses a comma and parses.

## A generated file goes stale when another branch changes its inputs
Seen: 2026-09-29 (ark-skills)   Count: 1

Context: two PRs open at once, one carrying the committed `viz/data/graph.json`, the other changing a skill description that the graph copies.
Root cause: the graph was generated on its own branch before the other PR merged, and nothing regenerated it after both landed.
Next time two branches touch a generated file or its inputs, I will say in the second PR that it regenerates the file after the first merges, and run the freshness test on main after each merge.
Evidence: PR #5 merged before PR #4; `test_build_graph.RealRepo` then failed on main (d6f266a) until chore/wire-skill-references regenerated the graph.

## An exit status read after a subshell is the subshell's, not the command's
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: running the smoke test as `(cd viz && node scripts/smoke.mjs ... | tail -n 3); echo "exit=${pipestatus[1]}"` in zsh.
Root cause: `pipestatus` describes the last pipeline the current shell ran, which was the subshell alone, so it held the subshell's status (the status of `tail`), not the smoke test's.
Next time I need a command's exit code, I will redirect its output to a file and read `$?` right after that command, with no pipe or subshell around it.
Evidence: the dry run printed "smoke exit=0" under a thrown "family boxes out of order" error; `node scripts/smoke.mjs ... > file 2>&1; RC=$?` gave 1.

## A test written while no case exists can assume there are none
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: adding spec-writing, the first skill whose SKILL.md states an eval score, to the skills graph.
Root cause: `viz/scripts/test_app.cjs` and the smoke test's outline check mark one node measured in a copy and expect exactly one outlined, and viz/README.md says "none does today"; all three encoded the empty case as a constant.
Next time I test a case the data does not have yet, I will count the existing cases and add one, instead of asserting a fixed total.
Evidence: `test_app.cjs:69` failed with "2 !== 1"; smoke reported "outlined nodes [adversarial-review, spec-writing], expected only skill:adversarial-review".

## zsh is not bash: colon modifiers, unmatched globs, unsplit variables, and = words
Seen: 2026-09-28 (ark-skills, skills-graph run), 2026-09-29 (ark-skills, gap-skills run, twice), 2026-09-30 (ark-console, first run, twice), 2026-09-30 (efficiency run, twice), 2026-10-01 (console-v2 Phase 7)   Count: 8

Context: shell commands written as if for bash, run in this machine's zsh.
Root cause: zsh reads `$name:x` as a history modifier (`:u` uppercases, `:P` resolves a real path), and by default stops the whole command when a glob such as `dir/*` matches nothing; and it does not split an unquoted variable into words.
Next time I write a shell command here, I will put braces around a variable followed by a colon (`${name}:`) and avoid globs that can match nothing, or check the directory first.
Evidence: `git show $c:PROGRESS.md` asked for revision "/Users/armaank019/dev/ark-skills/5b6105fROGRESS.md"; `rm -rf $B/grade2/$e/C/*` on an empty folder failed with "no matches found" and skipped the copy after it. Later cases: zsh does not split an unquoted variable (`G="git -c user.name=t ..."; $G init` gave "command not found: git -c user.name=t ..."), an unquoted `--include=*.jsonl` failed as a glob, and a word starting with `=` is expanded as a command path (`echo ====` gave "=== not found"). The rule now: write a function for a command with fixed arguments, quote every glob and every word that starts with `=`, and pass paths after `--`. Two projects and count 8: proposed for the user-level CLAUDE.md, "The shell is zsh: put a command with arguments in a function, not a variable; quote globs and words starting with =; pass paths after --." In the first ark-console run, `cat $F` with a newline-separated file list read it as one file name, so an em dash check covered 3 files instead of 16 until it was rerun with `git grep`.

## A check that reads its expected value from the code follows the code
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: the viz smoke test checks each visual decision (label floor, family label size and color, kind colors) against the constants in viz/app.js.
Root cause: the expected value comes from the same constant the page uses, so changing the constant changes both sides and the check still passes; it holds the drawing to the code, not to the decision.
Next time a check guards a decided value, I will write the value into the check as a literal and confirm it fails when only the code's constant changes.
Evidence: on a clone of be693b6, FAMILY_LABEL set to 8 px red in app.js alone, `node viz/scripts/smoke.mjs` exit 0 (PROGRESS.md Q6).

## A clone of the local repo carries every local branch
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: giving eval runs a clean clone of main so neither configuration could see work in progress.
Root cause: `git clone <local path>` copies every local branch as a remote-tracking ref, so the clones also held chore/wire-skill-references and feat/gap-skills, with unreleased skills in them.
Next time I make an isolated clone for an eval, I will clone with `--single-branch --branch <base>` (or delete the other refs) and check `git branch -a` in it before any run starts.
Evidence: a B1 baseline run read chore/wire-skill-references' PROGRESS.md through the clone; the B2 graders found feat/gap-skills in every eval clone.

## Blind grading needs a fresh draw per task and neutral paths
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: labeling two eval outputs A and B so a grader cannot tell which configuration wrote which.
Root cause: one seeded shuffle put the with-skill output under A in all three B1 tasks, and in B2 some outputs quoted their own run paths, which named the configuration.
Next time I blind a comparison, I will draw the label separately for each task, copy outputs to neutral paths before the runs write anything that names them, and grep the copies for the configuration names.
Evidence: grade-blind-key.json had with_skill: A for every B1 task; B2 grading copies contained "with_skill" and "without_skill" in smoke logs and a REPLY.md.

## Adding a file of a kind the repo indexes needs the index changed too
Seen: 2026-09-30 (ark-skills, efficiency run)   Count: 1

Context: the efficiency run added model-routing/, the one new skill directory its SPEC allowed.
Root cause: viz/scripts/build_graph.py requires every skill to be listed in viz/scripts/families.json, and a test checks that viz/data/graph.json is current; the SPEC's scope did not include viz/, and the premise check did not run the repo's tests with a skill added. Related to "A generated file goes stale when another branch changes its inputs", by a different mechanism.
Next time a run will add a skill (or any file a generator in the repo reads), I will run the repo's own tests on a scratch copy with a stub added during the premise check, and put the extra files in the first scope question.
Evidence: on feat/efficiency, `python3 viz/scripts/build_graph.py` exited 1 with "nodes not listed in any family in viz/scripts/families.json: model-routing". Fixed on feat/model-routing-family (76516f4): the author placed it in skill-management; 33 nodes and 73 edges; unittest 54, node tests 22, and the smoke test pass.

## Load every skill the SPEC says governs before the first phase
Seen: 2026-09-30 (ark-skills, efficiency run)   Count: 1

Context: the efficiency SPEC said experiment-discipline "governs every number in this run".
Root cause: I loaded only unattended-build at the start and experiment-discipline after Phase 1's numbers were written.
Next time a SPEC names skills that govern the run, I will load each one before writing STANDING-DECISIONS.md.
Evidence: the Skill call for experiment-discipline is timestamped 2026-09-30T18:50:01.087Z (14:50:01 EDT), after Phase 1's acceptance; the experiment card for Phase 4 was written after it, which is why Phase 4 has one and Phase 1 does not. The rule would go in unattended-build's Step 1.

## A number means what its source computes, not what its name says
Seen: 2026-09-30 (ark-skills, efficiency run, Phase 4)   Count: 1

Context: choosing the primary token measure for the before-and-after routing experiment.
Root cause: I named the harness's per-subagent `subagent_tokens` as the measure before checking what it counts; it matched each run's final context plus output within 300 tokens, so it measured context size, and it moved the opposite way from tokens processed.
Next time I name a measure in an experiment card, I will reconcile it once against a second source on a trial run before any run counts.
Evidence: docs/runs/2026-09-30-efficiency/experiments.md, Summary: sonnet median 87,404 against 47,798 on the notice, 329,044 against 413,398 by transcript. Not specific to this repo; it belongs in a cross-project lessons file once one exists.

## A screenshot older than the code is a report of bugs the code may not have
Seen: 2026-10-01 (ark-console, console-v2 Phase 6 report and round V2-1)   Count: 1

Context: the console-v2 Phase 6 report handed the author a live screenshot, and the author's round reported from it.
Root cause: the screenshot was taken at 00:45 EDT, before the last fix round widened chart 1's left margin (committed 00:56), and the report did not say which code it showed. Its clipped axis labels read as a non-monotonic scale, and the author reported a y-axis bug that the committed code did not have.
Next time I hand over a screenshot, I will retake it after the last code change and name the commit it shows. For visual-loop and unattended-build: a screenshot in a report is evidence only for the commit it names.
Evidence: ark-console LESSONS.md, same title; on the committed code the live ticks were 286,668k to 1,146,672k, all inside the chart.

## A harness that edits source in place leaves the edit there when it hangs
Seen: 2026-09-30 (ark-console, console-v2 Phase 3)   Count: 1

Context: page mutants applied by editing a tracked file, running the check, and restoring the file in a `finally`.
Root cause: the check hung, so the `finally` never ran, and the mutant stayed in tracked source from about 17:26 to 18:59:51 EDT (about 90 minutes) until it was found and restored by hand.
Next time I mutate code for a test, I will mutate a copy, never the tracked file; where a check can only read the tracked file, I will bound it with a timeout and verify the file's hash after every mutant.
Evidence: ark-console LESSONS.md, same title. This repo's viz smoke test also writes tracked files (both screenshots) on every run, so the same care applies to any mutant run against it.
