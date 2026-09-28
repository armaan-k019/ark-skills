# Lessons

Project lessons for ark-skills, in the capture-lessons format. Each entry is a pattern, not an event.

## Times written into reports from memory instead of the clock
Seen: 2026-09-27 (ark-skills, unattended-build eval re-run), 2026-09-28 (ark-skills, skills-graph run)   Count: 2

Context: keeping PROGRESS.md during an unattended run.
Root cause: the time was typed as an estimate while writing, not read from a clock in the same step.
Next time I write a time into a report, I will paste it from a `date` call made in the same step, or write "not clock-stamped".
Evidence: PROGRESS.md said 03:52 when `date` read 03:22 (review gate 1 flagged it); the eval re-run's PROGRESS.md held two estimated "Updated" times.
Promotion proposed (not applied): add to unattended-build Step 2, "Every time in PROGRESS.md comes from `date` in the same step."

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

## Killing processes by matching command lines hits more than intended
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: stopping a hung background Node process.
Root cause: `ps | grep` on a string from the script matched the wrapper shells that carried the same text, including the current command.
Next time I start a process I may need to stop, I will keep its PID from `$!` and kill only that PID.
Evidence: the kill loop stopped the background task's shell and ended the current command with exit 144.

## A static scanner's file-type list decides what it can find
Seen: 2026-09-28 (ark-skills)   Count: 1

Context: vetting ccboard with vet-third-party/scripts/scan.py.
Root cause: the scanner's TEXT_EXT set has no `.rs`, so none of ccboard's 175 Rust files were scanned, and every serious finding (0.0.0.0 bind, open CORS, unmasked secrets, hook overwrite) was in Rust.
Next time a scan reports on a repo, I will compare its scanned extensions with the repo's source languages before trusting its counts.
Evidence: viz/MONITOR-EVAL.md, "A gap in the vetting tool itself". Fixing the scanner is left for its own branch (author's decision, PROGRESS.md Q5).
