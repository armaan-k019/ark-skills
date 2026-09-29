# Lessons

Project lessons for ark-skills, in the capture-lessons format. Each entry is a pattern, not an event.

## Times written into reports from memory instead of the clock
Seen: 2026-09-27 (ark-skills, unattended-build eval re-run), 2026-09-28 (ark-skills, skills-graph run), 2026-09-29 (ark-skills, gap-skills run, twice)   Count: 4

Context: keeping PROGRESS.md during an unattended run.
Root cause: the time was typed as an estimate while writing, not read from a clock in the same step.
Next time I write a time into a report, I will paste it from a `date` call made in the same step, or write "not clock-stamped".
Evidence: PROGRESS.md said 03:52 when `date` read 03:22 (review gate 1 flagged it); the eval re-run's PROGRESS.md held two estimated "Updated" times. On 2026-09-29 a script wrote 08:41 into PROGRESS.md while the `date` call in the same command printed 08:35; the time was typed into the script before the clock was read.
Promoted to: unattended-build Step 2 ("Every time in PROGRESS.md comes from `date` in the same step."), PR #3. The third case happened with the rule in place: pass the `date` output into the script as an argument instead of typing the time. The fourth case was the end of a time range typed into body text (08:50 when `date` read 08:46) while the header used the passed-in value: every time in the text, not only the header, comes from the argument.

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
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: turning review findings into tests.
Root cause: the first BOM test asserted a node id that the old fallback happened to produce, so it passed with or without the fix.
Next time I add a test for a review finding, I will run it against the reviewed version and confirm it fails there first.
Evidence: the BOM test passed on the staged extractor until it asserted the parsed name; after that, all 19 regression tests added in this run (14 for review gate 1, 4 for the new edge kinds, 1 for node_modules) failed on the code they guard.

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

## zsh reads a colon after a variable name as a modifier
Seen: 2026-09-28 (ark-skills, skills-graph run), 2026-09-29 (ark-skills, gap-skills run)   Count: 2

Context: building paths and git revisions from shell variables, such as `$BASE:u...` and `git show $c:PROGRESS.md`.
Root cause: in zsh, `$name:x` applies the history modifier `x` to the variable (`:u` uppercases, `:P` resolves a real path), so the text after the colon is consumed instead of appended.
Next time I put a colon right after a variable in zsh, I will write `${name}:` with braces.
Evidence: `git show $c:PROGRESS.md` asked for revision "/Users/armaank019/dev/ark-skills/5b6105fROGRESS.md"; `${c}:PROGRESS.md` worked.

## A check that reads its expected value from the code follows the code
Seen: 2026-09-29 (ark-skills, gap-skills run)   Count: 1

Context: the viz smoke test checks each visual decision (label floor, family label size and color, kind colors) against the constants in viz/app.js.
Root cause: the expected value comes from the same constant the page uses, so changing the constant changes both sides and the check still passes; it holds the drawing to the code, not to the decision.
Next time a check guards a decided value, I will write the value into the check as a literal and confirm it fails when only the code's constant changes.
Evidence: on a clone of be693b6, FAMILY_LABEL set to 8 px red in app.js alone, `node viz/scripts/smoke.mjs` exit 0 (PROGRESS.md Q6).
