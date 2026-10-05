# Progress: ark-console v3, readable by someone who did not build it
Updated: 2026-10-05 (cloud session)   Branches: ark-console claude/project-thread-05uini (feat/console-v3 9ac2977 plus the Phase 5 round, Phase 6 and Phase 7), ark-skills claude/project-thread-05uini (docs/console-v3-mac-run 0de533c merged in)   Last commit: ark-console 9bc4d19

Class (unattended-build Step 0): machine-checkable. Every Phase 0 to 4 acceptance criterion is a command or a computed-style assertion that can fail; the taste in it (type scale, floors, explanation wording) goes to the author at the Phase 5 gate, as the SPEC says. The stop-and-ask and decide-yourself lists are the SPEC's own ("Stop and ask", "Decide yourself") plus STANDING-DECISIONS.md, which is left as the author wrote it.

## Now
Phases 5, 6 and 7 are done. The author answered the gate with "do whatever makes the most sense", so the session took its recommended answer to each of Q1 to Q8 and recorded each one in ark-console docs/decisions/ (see "Phase 5 round" below). Nothing is merged. ark-console feat/console-v3 can fast-forward to claude/project-thread-05uini (9ac2977 is an ancestor of 9bc4d19).

## Done and verified
- Precondition: `git -C ~/dev/ark-console log --oneline -1 docs/UI.md` gives bc38b4e; `grep -c "## 9. Minimum sizes" docs/UI.md` gives 1. feat/console-v3 created from docs/ui-v3-simple at bc38b4e (not from main).
- Baseline on bc38b4e: `node --test test/indexer.test.js test/server.test.js test/usage.test.js` 95 of 95; `node scripts/check-page.js` 769 passed, exit 0.
- Phase 0 (opus, the main session), ark-console ab9cb88: scripts/audit-ui.js. It reuses check-page.js's Chrome driver (check-page.js now exports it and runs main() only when run directly; `node scripts/check-page.js` after the change: 769 passed, exit 0). `node scripts/audit-ui.js` (before 22:25 EDT): exit 1, 85 distinct violations (2,889 counting every place), 60 views measured. Full output below as the before state.
- Phase 1 (sonnet subagent: 184,653 tokens, 51 tool uses, 657 s by its completion notice), ark-console 39a4a7c: home as stacked cards (Waiting on you, Working right now, Usage this week, footer), four detail pages with "Back to home", tab strip removed, Kill and Dismiss on the Sessions page only. Checked by the main session, and a bug found: `#home { display: flex }` beat the `hidden` attribute, so home stayed drawn above every detail page (seen in docs/screenshot-usage.png, which showed home's lower half; usage and skills screenshots were byte-identical), and the new view checks passed because they read the attribute. Fixed in e3e3557: `[hidden] { display: none !important; }`; the view checks now test what is drawn (8 FAILs on the old CSS, observed); the Usage and Skills screenshots assert they show their page from the top. After the fix: tests 95 of 95; `node scripts/check-page.js` 876 passed, 2 failed (below); `node scripts/audit-ui.js` exit 1, 100 distinct violations (contrast 26, horizontal scroll 1, banned word 2, chart box 12, headline block 6, hit target 18, row height 4, text measure 31). At 1440x900 home's scrollHeight is 900 = clientHeight on both fixtures.
- Phase 1 checks left failing (findings, not deleted, not loosened):
  - "many-sessions snapshot: home has no page scroll at 1440x900": scrollHeight 1003 > 900, with 4 waiting rows and 5 working rows. UI.md section 10 names only the empty and populated fixtures, but section 3 says "no page scroll in the default state". See Q3.
  - "many-sessions snapshot: the Sessions page is taller than the viewport and scrolls the document (900 > 900)": a precondition check that the fixture can make the page scroll. It passed only because home was drawn above the Sessions page; alone, the Sessions page is 900 tall.
- Phase 1 existing checks rewritten by the builder, each citing UI.md v3 in a comment: header bar 48 to 56px (section 3); the 2:1 columns replaced by four full-width stacked cards 16px apart, home capped at 1600 and centered (section 3); running rows lose branch, model, Kill (sections 4, 7); "Show all n running" opens the Sessions page; the Sessions page scrolls the document (decision, below); noScrollCheck strengthened; tabChecks replaced by view checks; chart 1's label bound read from its real viewBox (section 3, full card width); MEASURE reveals all views for one read.
- Gate review of Phase 0-1 (opus, fresh context, read-only, 150,722 tokens): no CRITICAL; HIGH H1, the chart "table" toggle set `.hidden` on an `<svg>` (no such property), so the chart was never hidden, and its check read back the same property; MEDIUM M1 no hit-target check on the detail pages, M2 detail pages lost the snapshot time, stale marker and theme toggle (not recorded as a gap: now under Gaps), M3 the audit never verified a view was reached, M4 audit blind spots (closed rows and banners skipped for banned words; inline text skipped by the measure), M5 "Usage detail" overlapping chart 1 (gone in Phase 2: no longer absolutely positioned); LOW L1 to L6 (listed under Gaps and review leftovers).
- Phase 2 (sonnet subagent: 130,220 tokens, 24 tool uses, 358 s), ark-console b77bca1: type scale 24/18/15/12/11 and big 34, the monospace stack and tabular-nums on big and numeric, rows 36, home card padding 24 radius 10, detail card padding 20 radius 8, every value asserted from computed style against literals in check-page.js (typeChecks, object T), on three fixtures, both modes, home and four pages. Existing literals moved to v3 values with "UI.md section 2 (v3)" comments: rows 28 to 36, table cells 13 to 15px, headline 20 to 24px and letter-spacing -0.2 to -0.24px, card padding 16 to 20 (detail), notes 12 to 15px, tile value 28 to 34px. Checked by the main session: 1,176 passed, 16 failed: 2 home no-scroll (Q3) and 14 "no prose line is longer than 76 characters", caused by my brief, which asked for max-width exactly 76ch AND lines of at most 76 characters; 76ch (76 widths of "0") holds up to 97 characters of this font.
- Fix round 1 (main session, opus), ark-console 8adc739: H1 fixed (toggleAttribute on the svg; the toggle checks read what is drawn: 6 toggle FAILs and 2 round-trip FAILs on the old code, observed, then pass); round-trip checks assert the state changed first (L2); M1 hit targets on Sessions, Repos and Skills pages; M3 and M4 in the audit (removing the measure cap gives 43 measure violations, observed, then restored); measure: `--measure: 56ch` (60ch gave a longest line of 79), the check asserts a cap no wider than 76ch plus the line length in characters; `#home .row-question` leaves the prose list (the comment and this line first called it the one-line ellipsis cell; that is `.row-ask`; `.row-question` is the full question, still measured through `#home .row-more p`, as the Phase 2 review noted). Verified: tests 95 of 95 (b77bca1); `node scripts/check-page.js` 1,198 passed, 2 failed (both Q3: home 1114px on the populated fixture, 1282px on many-running); `node scripts/audit-ui.js` exit 1, 58 distinct: contrast 23, horizontal scroll 2 (Usage page 1241 wide at 1100 and 820), page scroll on home 1, banned word 2, chart box 12, headline block 3, hit target 15, text measure 0.
- Home heights at 1440x900 after Phase 2 (builder's measurement): populated 1114 (waiting 255, working 115, usage 534, footer 74, header 56); empty 900; many-running 1282 (working 283).
- Gate review of Phase 2 and fix round 1 (opus, read-only, 136,740 tokens): no CRITICAL or HIGH; MEDIUM M1 the "drawn at least once" guard covered roles, not selectors, and not bodySize, label or prose; LOW L1 the home measure opened only the first (short) row, L2 it closed that row instead of restoring it, L3 Sessions-page wait ages not numeric, L4 title-styled elements missing from the title role, L5 buttons switched to the body serif. All verified by every literal being asserted somewhere it can fail.
- Fix round 2 (main session), ark-console c68d38b: per-selector presence on the populated fixture with TYPE_OPTIONAL naming the selectors that fixture has no data for (hiding `.running-row .since` gives the guard's FAIL, observed); L1 to L5 fixed. check-page 1,261 passed, 2 failed (Q3).
- Phase 3 (sonnet subagent: 166,822 tokens, 33 tool uses, 426 s), ark-console 7eab49a: header sentence, an explanation sentence per home card, units in words, plain tool phrases, "Last checked <n> ago (stale)", headline numbers on the 7-day window, glosses on detail pages; banned-word, explanation, units and gloss checks added. Checked by the main session: 1,245 passed, 2 failed (Q3); audit no banned word; a mutant ("PID" in the refresh button's aria-label) gives 6 check FAILs and 1 audit banned-word row, observed, then restored.
- Gate review of Phase 3 and fix round 2 (opus, read-only, 113,832 tokens): HIGH H1 a count that is 0 because its source could not be read was said as "No sessions are working." (e.g. when ps fails); MEDIUM: the Waiting explanation claimed every run had stopped; idle sessions were described in the present tense; the Usage explanation said 7 days beside a 14-day chart; "pid" could reach home through the Kill error banner; LOW: status matched by pattern, interval not tied to POLL_MS, optional selectors never checked on another fixture, gloss list narrow.
- Fix round (gate after Phase 3), ark-console be280e6: H1 and the four MEDIUMs fixed; status compared exactly; the footer interval checked against POLL_MS; literal unknown-count header cases and an idle/busy wording check on the many-sessions fixture added. check-page 1,402 passed, 2 failed (Q3).
- Phase 4 (opus subagent: 167,560 tokens, 44 tool uses, 595 s), ark-console 95843c1: light --text-3 #77766f to #6e6d67 (worst 4.51:1 on --surface-2; recomputed by the main session: 4.838, 5.056, 4.513 on surfaces 0, 1, 2) written into UI.md section 1 in the same commit; .note and #status from the CSS keyword gray to --text-3; hit targets 32x32 on every control; headline blocks min-height 96; charts 2 to 4 at least 220 tall; usage table text cells wrap (no horizontal scroll at 1100 or 820); floor and token-contrast checks at three widths. The builder reports the new checks fail on HEAD's CSS and app.js (67 FAILs, its observation). Checked by the main session: tests 95 of 95; check-page 1,399 passed, 2 failed (Q3, home now 1282 and 1458 tall); audit exit 1, 6 distinct, all open questions.
- Gate review of Phase 4 (opus, read-only, 116,910 tokens): MEDIUM M1 chart 2's labels inside segments were --text-1 on series colors, 3.07 to 3.88:1 in dark mode, unseen because the audit read SVG text against the card; M2 --critical as text (Kill on hover) below 4.5 in both modes (Q6); M3 no mutant yet for the new assertions (Phase 6); LOW the chart floor is met by the SVG's box, not its drawing (chart 2 is a 28px bar in a 220px box); row height and the open kill dialog are not measured at every width or state (measured fine today).
- Fix round (gate after Phase 4), ark-console 87ae336 and 9ac2977: chart 2 labels use --surface-0 ink in dark mode (4.83 to 6.10 on the four series) and keep --text-1 in light (6.15 to 9.09 on series 2 to 4; series 1 is Q7); the audit reads SVG text against the mark under it (the old white ink gives 3.41:1, observed); check-page writes the 820 and Sessions screenshots; a viewport screenshot now uses the width in effect.
- Final state at 9ac2977: `node --test test/indexer.test.js test/server.test.js test/usage.test.js` 95 of 95; `node scripts/check-page.js` 1,404 passed, 2 failed (both Q3); `node scripts/audit-ui.js` exit 1, 6 distinct violations, every one an open question (Q1, Q3, Q4, Q5). scripts/mutants.js NOT RUN (Phase 6). Nothing pushed.

## In flight
- Nothing.
- The cloud session's own run of this SPEC (ark-console 6570241, ark-skills 64ba8e2) is not carried forward. 6570241 was the old tip of ark-console claude/project-thread-05uini and was replaced by a force-with-lease push; 64ba8e2 is still in this branch's history, under the merge of docs/console-v3-mac-run.

## Open questions (for the author at this gate)
- Q1: `--warning` as text. The stale line is --warning (UI.md 6), and status colors are "fixed, never themed" (UI.md 1). Measured: #fab219 on light --surface-1 1.79:1, on --surface-0 1.71:1; dark passes (9.49). No single color passes on both modes (it would need relative luminance at most 0.157 for light and at least 0.203 for dark). Triggered by: two UI.md sections conflict. Blocks: the audit's exit 0 (2 contrast rows, light only).
- Q2: the third headline number. UI.md 4 names "runs finished this week"; the snapshot records nothing that marks a run finished. Triggered by: SPEC stop-and-ask "Changing what the indexer collects". Blocks: that number; until answered it is the share used by general-purpose helper agents, 7-day window.
- Q3: home height. With UI.md's values home is 1282px tall at 1440x900 on the populated fixture (5 runs waiting, 1 session working) and 1458 on many-sessions; the empty fixture fits (900). Growth by phase on the populated fixture: 900 (Phase 1, with padding cut to 12), 1114 (Phase 2 sizes), 1258 (Phase 3 explanation sentences), 1282 (Phase 4 32px hit targets). UI.md sets no cap on waiting rows. Triggered by: sections 2, 3, 4 and 9 conflict. Blocks: 2 check-page FAILs and the audit's "page scroll on home".
- Q4: the header sentence measures 86 characters on one line on the populated fixture (UI.md 2: at most 76); wrapping it makes the 56px header (UI.md 3) two lines (it already wraps at 820, seen in docs/screenshot-home-820.png). Triggered by: sections 2 and 3 conflict. Blocks: the audit's one text-measure row.
- Q5: dimmed rows at 60% opacity (UI.md 4) put text below 4.5:1: measured Dismiss (--text-2) in a dimmed row 4.44 dark, 2.85 light; computed from the tokens (not drawn by any fixture: they need "show dismissed"): --text-3 in a dimmed row 2.70 dark, 2.32 light; --text-1 passes (7.18, 5.09). Triggered by: sections 4 and 9 conflict. Blocks: 2 audit contrast rows.
- Q6 (new): --critical as text: Kill on hover sits on a hovered row (--surface-2): 3.27:1 dark, 4.18 light; the dialog's confirm button on --surface-1: 3.62 dark, 4.68 light. Status colors are fixed (UI.md 1). The audit and checks never hover, so no row shows it. Triggered by: sections 1, 7 and 9 conflict. Blocks: nothing measured today.
- Q7 (new): chart 2's direct labels sit inside segments (UI.md 5). On light --series-1 #2a78d6 no token reaches 4.5:1 (--text-1 4.46, --surface-1 4.30; only pure black, 4.76, would). Not drawn by the fixtures (that segment is 9.6%, under the 12% label threshold). Triggered by: sections 1, 5 and 9 conflict.
- Q8: decision records. The run made choices that meet decision-records' bar (two levels shown and hidden in place; run Dismiss moving to the Sessions page; --measure 56ch). That skill writes records only with the author's approval, and ark-console has no docs/decisions/. Drafts not written; asking whether to.

## Values the run chose where UI.md is silent, and gaps (Phase 5 list)
- No body font family in UI.md or style.css: the page renders in the browser default serif (Times). Not changed.
- Detail pages show no snapshot time, stale marker, theme toggle or refresh (they sit in home's header and footer). Review M2. Not changed; for the author.
- "See all runs" opens the Sessions page at its top; the "Waiting on you" section is below the sessions table there (review L4), and the link is after the rows in tab order.
- Back to home focuses the opener only if it still exists; if a poll hid "Show all n running", focus falls to the body (review L1, LOW).
- Detail views are outside the `<main>` landmark (review nit).
- Chart 1's direct label ("3.1M") is clipped at the top of the chart (seen in docs/screenshot-light.png after Phase 2).
- Phase 2 choices (UI.md section 2 does not say): #status and the dismissed label in label style; chart axis text 12px and direct labels 12px monospace; usage table captions as prose; the usage-window h3 and problems h2 in title style, titles in --text-1; the detail "Waiting on you" heading kept as a micro eyebrow; .run-line2 line-height 22px; home rows height 36, table rows min-height 36; the kill dialog as a detail card.
- --measure 56ch: chosen by the session so lines hold at most 76 characters in this font (76ch held up to 97; 60ch gave 79).
- Home layout (Phase 1): card titles "Waiting on you", "Working right now", "Usage this week"; "See all runs" and "Usage detail" as plain block links at the end of their cards (UI.md's diagram draws them at the right); the footer is one card: four links, then the status line; errors banner above every page; the theme toggle and refresh only in home's header.
- Waiting rows show every waiting run (no cap), one line with an ellipsis, expanding in place to the full question, "Why" and "Status"; dismissed runs never on home.
- Explanation sentences (Phase 3, revised at the Phase 3 gate), all 15px --text-2: Waiting "Runs are long jobs Claude Code does for you. Each of these has a question that only you can answer." Working "Sessions are conversations with Claude Code. These are running now, with how long ago each last did something." Usage "Tokens are the usage meter your plan bills against. The three numbers cover the last 7 days; the chart, 14." Footer "Open a page for the full lists behind these cards. This page checks again every 10 seconds."
- Header sentence forms, including "Nothing is known to be waiting on you; 2 runs could not be read." when a source could not be read.
- Headline numbers on the 7-day window (UI.md says "this week"): "Tokens used this week" with "164.5k tokens were new text; the rest was text read again."; "Share above 150k conversation size"; "Share used by general-purpose helper agents" (Q2).
- Tool phrases: busy "running a command", "reading a file", "editing a file", "searching files", "working with a helper agent", "reading the web", "updating its to-do list", else "using a tool"; idle "waiting, last ran a command" and so on.
- Detail-page glosses: "Model (claude-... identifier)" (Sessions), "Dirty (uncommitted changes)" (Repos), a "Words used on this page" line on Usage for cache, context and subagent (their first use is in text lib/usage.js supplies). The kill dialog's "pid N" is not glossed.
- The Kill error and undo lines moved into the Sessions page (the server's refusal text names the pid).
- Phase 4: --text-3 light #6e6d67 (the first same-hue step reaching 4.5 on all three light surfaces); every button at least 32x32 by a base rule; headline blocks min-height 96; charts 2 to 4 at least 220 tall with marks unchanged, so chart 2 is a 28px bar centered in a 220px box (the floor is met by the box, review LOW); usage table text cells wrap; chart 2 label ink --surface-0 in dark.
- Not changed, seen in the screenshots: the Sessions table is not full width and its headers crowd ("Branch Model (claude-... identifier)"); chart 4's labels overlap its bars and leave empty space below; chart 1's "3.1M" label is clipped at the top; the skills graph labels overlap (as in v2); text is the browser's default serif.
- Review leftovers below HIGH, not fixed: optional type selectors are never confirmed on another fixture; the gloss check covers the banned list plus cache and model, not Behind/Ahead/upstream on Repos; a wait under a minute reads "waiting 0 minutes"; the explanation check accepts whitespace; row height and the open kill dialog are not measured at every width or state.

## Decisions
- The two fixtures are test/fixtures/snapshot.json (populated) and snapshot-empty.json, made by scripts/make-snapshot-fixtures.js. The SPEC names scripts/make-fixtures.js, which makes transcript fixtures, not page fixtures; UI.md section 10's "the empty and the populated fixture" are these two.
- Audit, banned words: "PID" matches any case (UI.md lists "PID" and "pid"); "SHA" and "HEAD" match uppercase only (the English "head" is not banned); the rest any case, plurals included; the model rule is `claude-[a-z0-9-]+`, any case. The check reads the home root's innerText plus every title, aria-label, alt and placeholder inside it.
- Audit, measures: row height is a floor (>= 36); text measure (since fix round 1) counts the characters drawn on each line of every leaf block longer than 76 characters, skipping one-line nowrap cells; SVG text is read against the mark drawn under it (since the Phase 4 gate); contrast composites every ancestor's background over white and multiplies the text alpha by every ancestor's opacity, so dimmed rows are measured as drawn. Home before v3 is the whole page (there was no home root), so the round 2 tab panels count as home in the before state.

- Phase 1 views are shown and hidden in place (no re-render, no URL change), so state round-trips by construction; the URL fragment is left to the kill token.
- Run Dismiss moves off home with the attention cards: the Sessions page holds a "Waiting on you" section with the full cards, their Dismiss buttons and "show dismissed"; home's "See all runs" opens it. (The SPEC moves kill and dismiss to the Sessions page; runs had no other place there.)
- Gates: each phase boundary gets a fresh-context review of that phase's diff, run in parallel with the next phase's builder (the reviewer only reads), fixes in at most two rounds.

## Next action
The author reviews the six decision records and the Phase 7 leftovers below. If they stand: fast-forward ark-console feat/console-v3 to claude/project-thread-05uini and open its PR to main. Any decision the author reverses is a literal to change in check-page.js, and its mutant shows which check moves.

## Phase 5 report

Screenshots (ark-console 9ac2977, populated fixture, written by `node scripts/check-page.js`, each looked at by the main session):
- home dark, 1440x900: docs/screenshot.png (home is cut below chart 1's top half: Q3)
- home light, 1440x900: docs/screenshot-light.png
- home at 820x900, dark: docs/screenshot-home-820.png (the headline numbers stack; the header sentence wraps to two lines: Q4)
- Sessions detail, dark: docs/screenshot-sessions.png
- Usage detail, dark: docs/screenshot-usage.png
- Skills detail, dark: docs/screenshot-skills.png
(also docs/screenshot-confirm.png, the kill dialog open)

Audit before (ab9cb88, the round 2 page) and after (9ac2977), distinct violations by rule:

| rule | before | after |
|---|---|---|
| contrast | 20 | 4 (Q1 x2, Q5 x2) |
| s8 banned word | 6 | 0 |
| s9 chart content box | 15 | 0 |
| s9 headline number block | 2 | 0 |
| s9 hit target | 9 | 0 |
| s9 row height | 3 | 0 |
| s9 text measure | 30 | 1 (Q4) |
| s3 page scroll on home | 0 (the round 2 page scrolled inside its tab body) | 1 (Q3) |
| s3 horizontal scroll | 0 | 0 |
| total distinct | 85 | 6 |

The before audit's "home" was the whole round 2 page (no home root), and it measured the tab panels as views; the after audit measures home and four detail pages, and since fix round 1 it reads home's closed rows, the banners and drawn characters per line, so the two columns are not the same instrument: some "before" counts are lower than the old page deserved.

Contrast, every text token on every surface, before (ab9cb88) and after (9ac2977), as computed by the page:

| token | dark before s0 / s1 / s2 | dark after | light before s0 / s1 / s2 | light after |
|---|---|---|---|---|
| --text-1 | 18.74 / 17.42 / 15.73 | same | 18.35 / 19.17 / 17.12 | same |
| --text-2 | 10.46 / 9.72 / 8.78 | same | 7.40 / 7.73 / 6.90 | same |
| --text-3 | 5.38 / 5.00 / 4.52 (#8a8a80) | same | 4.25 / 4.44 / 3.97 (#77766f) | 4.84 / 5.06 / 4.51 (#6e6d67) |
| --good | 5.59 / 5.19 / 4.69 | same | 3.13 / 3.27 / 2.92 | same (never drawn as text) |
| --warning | 10.22 / 9.49 / 8.57 | same | 1.71 / 1.79 / 1.60 | same (Q1) |
| --serious | 7.11 / 6.60 / 5.96 | same | 2.46 / 2.57 / 2.29 | same (not used) |
| --critical | 3.90 / 3.62 / 3.27 | same | 4.48 / 4.68 / 4.18 | same (Q6) |

Drawn pairs below 4.5 after: light --warning on --surface-1 1.79 (Q1); dimmed Dismiss --text-2 at 0.6: 4.44 dark, 2.85 light (Q5). Drawn pairs before that are gone: the CSS keyword gray #808080 (3.68 light), light --text-3 (4.25, 4.44), chart 2 labels (3.41 dark, found at the Phase 4 gate).

Check-page assertions: 769 at bc38b4e, 1,404 passed and 2 failed at 9ac2977.

## Phase 4 audit, after (full output of `node scripts/audit-ui.js` at 87ae336; 9ac2977 changes only the check's screenshot code)

```


# UI audit (docs/UI.md sections 3, 8, 9 and the 4.5:1 rule)
chrome: ~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell
measured: 60 views (fixtures populated, empty; modes dark, light; widths 1440, 1100, 820 x 900)

## Violations: 6 distinct (30 with every place counted)
- contrast: 4
- s3 page scroll on home: 1
- s9 text measure: 1

| rule | element | observed | limit | text (first of n) | seen in |
|---|---|---|---|---|---|
| contrast | button.dismiss-button | 4.44:1 (#c3c2b7 at 0.60 on #121211, 15px) | >= 4.5:1 | "Dismiss" | 3 views: populated dark 1440 sessions; populated dark 1100 sessions; populated dark 820 sessions |
| contrast | button.dismiss-button | 2.85:1 (#52514e at 0.60 on #f7f7f5, 15px) | >= 4.5:1 | "Dismiss" | 3 views: populated light 1440 sessions; populated light 1100 sessions; populated light 820 sessions |
| contrast | p#status.stale | 1.79:1 (#fab219 on #fcfcfb, 12px) | >= 4.5:1 | "Last checked 276 days ago (stale)." | 6 views: populated light 1440 home; populated light 1100 home; populated light 820 home; and 3 more |
| contrast | span.stale-marker | 1.79:1 (#fab219 on #fcfcfb, 12px) | >= 4.5:1 | "(stale)" | 6 views: populated light 1440 home; populated light 1100 home; populated light 820 home; and 3 more |
| s3 page scroll on home | document | scrollHeight 1282 > clientHeight 900 | no page scroll at 1440x900 |  | 2 views: populated dark 1440 home; populated light 1440 home |
| s9 text measure | h1#headline | 86 chars on one line (859px) | <= 76 chars | "5 runs are waiting on you. 1 session is " | 4 views: populated dark 1440 home; populated dark 1100 home; populated light 1440 home; populated light 1100 home |

## Contrast: every text token against every surface, as computed by the page

dark:
| text \ surface | --surface-0 #121211 | --surface-1 #1a1a19 | --surface-2 #232322 |
|---|---|---|---|
| --text-1 #ffffff | 18.74 | 17.42 | 15.73 |
| --text-2 #c3c2b7 | 10.46 | 9.72 | 8.78 |
| --text-3 #8a8a80 | 5.38 | 5.00 | 4.52 |
| --good #0ca30c | 5.59 | 5.19 | 4.69 |
| --warning #fab219 | 10.22 | 9.49 | 8.57 |
| --serious #ec835a | 7.11 | 6.60 | 5.96 |
| --critical #d03b3b | 3.90 | 3.62 | 3.27 |

light:
| text \ surface | --surface-0 #f7f7f5 | --surface-1 #fcfcfb | --surface-2 #f0efec |
|---|---|---|---|
| --text-1 #0b0b0b | 18.35 | 19.17 | 17.12 |
| --text-2 #52514e | 7.40 | 7.73 | 6.90 |
| --text-3 #6e6d67 | 4.84 | 5.06 | 4.51 |
| --good #0ca30c | 3.13 | 3.27 | 2.92 |
| --warning #fab219 | 1.71 | 1.79 | 1.60 |
| --serious #ec835a | 2.46 | 2.57 | 2.29 |
| --critical #d03b3b | 4.48 | 4.68 | 4.18 |

## Contrast: every text colour on the surface it was drawn on (observed)

dark:
| text | surface | opacity | ratio | text nodes | example |
|---|---|---|---|---|---|
| #c3c2b7 (--text-2) | #121211 (--surface-0) | 0.6 | 4.44 | 3 | button.dismiss-button "Dismiss", 15px |
| #8a8a80 (--text-3) | #1a1a19 (--surface-1) | 1 | 5.00 | 129 | span.row-age "waiting 4 hours", 15px |
| #8a8a80 (--text-3) | #121211 (--surface-0) | 1 | 5.38 | 543 | th "Project", 12px |
| #121211 (--surface-0) | #199e70 (--series-3) | 1 | 5.50 | 3 | text "2.5M", 12px |
| #ffffff (--text-1) | #121211 (--surface-0) | 0.6 | 7.18 | 21 | td "proj-yesterday", 15px |
| #fab219 (--warning) | #1a1a19 (--surface-1) | 1 | 9.49 | 18 | p#status.stale "Last checked 276 days ago (stale).", 12px |
| #c3c2b7 (--text-2) | #1a1a19 (--surface-1) | 1 | 9.72 | 258 | p.card-explain "Runs are long jobs Claude Code does for ", 15px |
| #c3c2b7 (--text-2) | #121211 (--surface-0) | 1 | 10.46 | 75 | button#theme-toggle "theme", 15px |
| #ffffff (--text-1) | #1a1a19 (--surface-1) | 1 | 17.42 | 117 | h2#attention-eyebrow.card-title "Waiting on you", 18px |
| #ffffff (--text-1) | #121211 (--surface-0) | 1 | 18.74 | 1350 | span "5", 24px |

light:
| text | surface | opacity | ratio | text nodes | example |
|---|---|---|---|---|---|
| #fab219 (--warning) | #fcfcfb (--surface-1) | 1 | 1.79 | 18 | p#status.stale "Last checked 276 days ago (stale).", 12px |
| #52514e (--text-2) | #f7f7f5 (--surface-0) | 0.6 | 2.85 | 3 | button.dismiss-button "Dismiss", 15px |
| #6e6d67 (--text-3) | #f7f7f5 (--surface-0) | 1 | 4.84 | 543 | th "Project", 12px |
| #6e6d67 (--text-3) | #fcfcfb (--surface-1) | 1 | 5.06 | 129 | span.row-age "waiting 4 hours", 15px |
| #0b0b0b (--text-1) | #f7f7f5 (--surface-0) | 0.6 | 5.09 | 21 | td "proj-yesterday", 15px |
| #0b0b0b (--text-1) | #1baf7a (--series-3) | 1 | 6.99 | 3 | text "2.5M", 12px |
| #52514e (--text-2) | #f7f7f5 (--surface-0) | 1 | 7.40 | 75 | button#theme-toggle "theme", 15px |
| #52514e (--text-2) | #fcfcfb (--surface-1) | 1 | 7.73 | 258 | p.card-explain "Runs are long jobs Claude Code does for ", 15px |
| #0b0b0b (--text-1) | #f7f7f5 (--surface-0) | 1 | 18.35 | 1350 | span "5", 24px |
| #0b0b0b (--text-1) | #fcfcfb (--surface-1) | 1 | 19.17 | 117 | h2#attention-eyebrow.card-title "Waiting on you", 18px |

RESULT: 6 distinct violation(s)
```

## Phase 0 audit, before (full output of `node scripts/audit-ui.js` at ab9cb88)

```
# UI audit (docs/UI.md sections 3, 8, 9 and the 4.5:1 rule)
chrome: ~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell
measured: 60 views (fixtures populated, empty; modes dark, light; widths 1440, 1100, 820 x 900)

## Violations: 85 distinct (2889 with every place counted)
- contrast: 20
- s8 banned word: 6
- s9 chart content box: 15
- s9 headline number block: 2
- s9 hit target: 9
- s9 row height: 3
- s9 text measure: 30

| rule | element | observed | limit | text (first of n) | seen in |
|---|---|---|---|---|---|
| contrast | button.dismiss-button | 4.44:1 (#c3c2b7 at 0.60 on #121211, 13px) | >= 4.5:1 | "Dismiss" | 6 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1100 home; and 3 more |
| contrast | button.dismiss-button | 2.85:1 (#52514e at 0.60 on #f7f7f5, 13px) | >= 4.5:1 | "Dismiss" | 6 views: populated light 1440 home; populated light 1440 sessions; populated light 1100 home; and 3 more |
| contrast | div.tile-context | 4.44:1 (#77766f on #fcfcfb, 13px) | >= 4.5:1 | "142.8k not cached" (5) | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | div.tile-label | 4.44:1 (#77766f on #fcfcfb, 11px) | >= 4.5:1 | "tokens read (incl. cache)" (3) | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | div.tile-note | 4.44:1 (#77766f on #fcfcfb, 13px) | >= 4.5:1 | "not recorded: 1 of 5 sessions" | 15 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 12 more |
| contrast | h2#attention-eyebrow.eyebrow | 4.25:1 (#77766f on #f7f7f5, 11px) | >= 4.5:1 | "Attention" | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | h2#usage-eyebrow.eyebrow | 4.25:1 (#77766f on #f7f7f5, 11px) | >= 4.5:1 | "Usage" | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | h3.chart-title | 4.44:1 (#77766f on #fcfcfb, 12px) | >= 4.5:1 | "Tokens per day, last 14 days" (5) | 18 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 15 more |
| contrast | p.chart-note | 4.44:1 (#77766f on #fcfcfb, 13px) | >= 4.5:1 | "not recorded: 1 of 7 sessions" (3) | 15 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 12 more |
| contrast | p.empty-state | 4.25:1 (#77766f on #f7f7f5, 13px) | >= 4.5:1 | "No tokens recorded in the last 14 days." (4) | 15 views: empty light 1440 home; empty light 1440 sessions; empty light 1440 repos; and 12 more |
| contrast | p#running-empty.empty-state | 4.25:1 (#77766f on #f7f7f5, 13px) | >= 4.5:1 | "Nothing is running." | 15 views: empty light 1440 home; empty light 1440 sessions; empty light 1440 repos; and 12 more |
| contrast | p#status.stale | 1.71:1 (#fab219 on #f7f7f5, 12px) | >= 4.5:1 | "Snapshot from 1/1/2026, 7:00:00 PM. Refr" | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | p#waiting-empty.empty-state | 4.25:1 (#77766f on #f7f7f5, 13px) | >= 4.5:1 | "Nothing is waiting on you." | 15 views: empty light 1440 home; empty light 1440 sessions; empty light 1440 repos; and 12 more |
| contrast | span | 1.71:1 (#fab219 on #f7f7f5, 12px) | >= 4.5:1 | "1/1/2026, 7:00:00 PM" | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | span.note | 3.68:1 (#808080 on #f7f7f5, 12px) | >= 4.5:1 | "error" (4) | 3 views: populated light 1440 repos; populated light 1100 repos; populated light 820 repos |
| contrast | span.run-age | 4.44:1 (#77766f on #fcfcfb, 13px) | >= 4.5:1 | "waiting 4h" (4) | 15 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 12 more |
| contrast | span.stale-marker | 1.71:1 (#fab219 on #f7f7f5, 12px) | >= 4.5:1 | "stale" | 30 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 27 more |
| contrast | text | 4.44:1 (#77766f on #fcfcfb, 11px) | >= 4.5:1 | "782.1k" (8) | 15 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 12 more |
| contrast | th | 4.25:1 (#77766f on #f7f7f5, 12px) | >= 4.5:1 | "Project" (28) | 24 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 21 more |
| contrast | th.count | 4.25:1 (#77766f on #f7f7f5, 12px) | >= 4.5:1 | "Queued" (3) | 18 views: populated light 1440 home; populated light 1440 sessions; populated light 1440 repos; and 15 more |
| s8 banned word | visible text | "dirty" x1 | none of "dirty" |  | 48 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 skills; and 45 more |
| s8 banned word | visible text | "SUBAGENTS" x1 | none of "subagent" |  | 48 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 45 more |
| s8 banned word | visible text | "claude-fable-5" x6 | none of "model identifier" |  | 12 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1100 home; and 9 more |
| s8 banned word | visible text | "dirty", "Dirty" x2 | none of "dirty" |  | 12 views: populated dark 1440 repos; populated dark 1100 repos; populated dark 820 repos; and 9 more |
| s8 banned word | visible text | "claude-fable-5" x1 | none of "model identifier" |  | 18 views: populated dark 1440 repos; populated dark 1440 skills; populated dark 1440 usage; and 15 more |
| s8 banned word | visible text | "SUBAGENTS", "subagent", "Subagents" x8 | none of "subagent" |  | 12 views: populated dark 1440 usage; populated dark 1100 usage; populated dark 820 usage; and 9 more |
| s9 chart content box | div#chart-skills-used-tab.chart-card | 1358.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 1440 skills; populated light 1440 skills |
| s9 chart content box | div#chart-skills-used-tab.chart-card | 1018.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 1100 skills; populated light 1100 skills |
| s9 chart content box | div#chart-skills-used-tab.chart-card | 738.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 820 skills; populated light 820 skills |
| s9 chart content box | div#chart-tokens-per-day.chart-card | 424.7 x 160.0 | >= 480 x 220 |  | 10 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 7 more |
| s9 chart content box | div#chart-tokens-per-day.chart-card | 1018.0 x 160.0 | >= 480 x 220 |  | 10 views: populated dark 1100 home; populated dark 1100 sessions; populated dark 1100 repos; and 7 more |
| s9 chart content box | div#chart-tokens-per-day.chart-card | 738.0 x 160.0 | >= 480 x 220 |  | 10 views: populated dark 820 home; populated dark 820 sessions; populated dark 820 repos; and 7 more |
| s9 chart content box | div#usage-charts | 1358.0 x 44.0 | >= 480 x 220 |  | 2 views: populated dark 1440 usage; populated light 1440 usage |
| s9 chart content box | div#usage-charts | 1358.0 x 140.0 | >= 480 x 220 |  | 2 views: populated dark 1440 usage; populated light 1440 usage |
| s9 chart content box | div#usage-charts | 1358.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 1440 usage; populated light 1440 usage |
| s9 chart content box | div#usage-charts | 1018.0 x 44.0 | >= 480 x 220 |  | 2 views: populated dark 1100 usage; populated light 1100 usage |
| s9 chart content box | div#usage-charts | 1018.0 x 140.0 | >= 480 x 220 |  | 2 views: populated dark 1100 usage; populated light 1100 usage |
| s9 chart content box | div#usage-charts | 1018.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 1100 usage; populated light 1100 usage |
| s9 chart content box | div#usage-charts | 738.0 x 44.0 | >= 480 x 220 |  | 2 views: populated dark 820 usage; populated light 820 usage |
| s9 chart content box | div#usage-charts | 738.0 x 140.0 | >= 480 x 220 |  | 2 views: populated dark 820 usage; populated light 820 usage |
| s9 chart content box | div#usage-charts | 738.0 x 80.0 | >= 480 x 220 |  | 2 views: populated dark 820 usage; populated light 820 usage |
| s9 headline number block | div.stat-tile | 142.2 x 182.2 | >= 220 x 96 | "tokens read (incl. cache)3.1M142.8k not " (3) | 10 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 7 more |
| s9 headline number block | div.stat-tile | 142.2 x 146.2 | >= 220 x 96 | "tokens read (incl. cache)00 not cached" (3) | 10 views: empty dark 1440 home; empty dark 1440 sessions; empty dark 1440 repos; and 7 more |
| s9 hit target | button.chart-toggle | 28.2 x 24.0 | >= 32 x 32 | "table" | 30 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 27 more |
| s9 hit target | button.dismiss-button | 53.5 x 24.0 | >= 32 x 32 | "Dismiss" | 30 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 27 more |
| s9 hit target | button.kill-button | 25.3 x 24.0 | >= 32 x 32 | "Kill" | 30 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 27 more |
| s9 hit target | button#older-toggle | 91.6 x 24.0 | >= 32 x 32 | "show 1 older" | 12 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1100 home; and 9 more |
| s9 hit target | button#refresh-button | 28.0 x 28.0 | >= 32 x 32 | "⟳" | 60 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 57 more |
| s9 hit target | button#show-dismissed-attention.show-dismissed-toggle | 99.8 x 24.0 | >= 32 x 32 | "show dismissed" | 60 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 57 more |
| s9 hit target | button#show-dismissed-sessions.show-dismissed-toggle | 99.8 x 24.0 | >= 32 x 32 | "show dismissed" | 24 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1100 home; and 21 more |
| s9 hit target | button#tab-skills | 30.3 x 33.0 | >= 32 x 32 | "Skills" | 60 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 57 more |
| s9 hit target | button#theme-toggle | 55.1 x 28.0 | >= 32 x 32 | "theme" | 60 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 57 more |
| s9 row height | li.running-row | 24.0px | >= 36px | "proj-alphamainclaude-fable-5last tool Ba" | 30 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 27 more |
| s9 row height | tr | 28.0px | >= 36px | "proj-gammamain–not running1/1/2026, 7:39" (73) | 30 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 27 more |
| s9 row height | tr.stale | 28.0px | >= 36px | "proj-yesterdaymainclaude-fable-5not runn" | 12 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1100 home; and 9 more |
| s9 text measure | div.run-line2 | 165 chars (882px) | <= 76 chars | "Q3: redacted redacted redacted redacted " | 10 views: populated dark 1440 home; populated dark 1440 sessions; populated dark 1440 repos; and 7 more |
| s9 text measure | div.run-line2 | 191 chars (1017px) | <= 76 chars | "Q3: redacted redacted redacted redacted " | 10 views: populated dark 1100 home; populated dark 1100 sessions; populated dark 1100 repos; and 7 more |
| s9 text measure | div.run-line2 | 138 chars (737px) | <= 76 chars | "Q3: redacted redacted redacted redacted " | 10 views: populated dark 820 home; populated dark 820 sessions; populated dark 820 repos; and 7 more |
| s9 text measure | li | 213 chars (1352px) | <= 76 chars | "tokens: input + output + cache creation " | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 214 chars (1352px) | <= 76 chars | "window: a message counts in a window by " | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 223 chars (1352px) | <= 76 chars | "project: the first cwd in the session's " | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 217 chars (1352px) | <= 76 chars | "skill tokens: window tokens of the sessi" | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 215 chars (1352px) | <= 76 chars | "agent invocation: a subagent transcript " | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 207 chars (1352px) | <= 76 chars | "subagent output: as recorded; subagent t" | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | li | 159 chars (1012px) | <= 76 chars | "tokens: input + output + cache creation " | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 160 chars (1012px) | <= 76 chars | "window: a message counts in a window by " | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 167 chars (1012px) | <= 76 chars | "project: the first cwd in the session's " | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 163 chars (1012px) | <= 76 chars | "skill tokens: window tokens of the sessi" | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 161 chars (1012px) | <= 76 chars | "agent invocation: a subagent transcript " | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 155 chars (1012px) | <= 76 chars | "subagent output: as recorded; subagent t" | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | li | 115 chars (732px) | <= 76 chars | "tokens: input + output + cache creation " | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | li | 116 chars (732px) | <= 76 chars | "window: a message counts in a window by " (2) | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | li | 121 chars (732px) | <= 76 chars | "project: the first cwd in the session's " | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | li | 118 chars (732px) | <= 76 chars | "skill tokens: window tokens of the sessi" | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | li | 112 chars (732px) | <= 76 chars | "subagent output: as recorded; subagent t" | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | p.never-used | 218 chars (1392px) | <= 76 chars | "Never fired in the last 24 hours: fixtur" (3) | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | p.never-used | 219 chars (1392px) | <= 76 chars | "Never fired in the last 7 days: fixture-" | 2 views: populated dark 1440 usage; populated light 1440 usage |
| s9 text measure | p.never-used | 165 chars (1052px) | <= 76 chars | "Never fired in the last 24 hours: fixtur" (4) | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | p.never-used | 121 chars (772px) | <= 76 chars | "Never fired in the last 24 hours: fixtur" (4) | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | p#usage-cost | 228 chars (1392px) | <= 76 chars | "Dollars recorded: 0 of 7 sessions, so th" (2) | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | p#usage-cost | 172 chars (1052px) | <= 76 chars | "Dollars recorded: 0 of 7 sessions, so th" (2) | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | p#usage-cost | 126 chars (772px) | <= 76 chars | "Dollars recorded: 0 of 7 sessions, so th" (2) | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |
| s9 text measure | p#usage-skipped | 221 chars (1392px) | <= 76 chars | "Files the usage report could not read: 0" | 4 views: populated dark 1440 usage; populated light 1440 usage; empty dark 1440 usage; empty light 1440 usage |
| s9 text measure | p#usage-skipped | 167 chars (1052px) | <= 76 chars | "Files the usage report could not read: 0" | 4 views: populated dark 1100 usage; populated light 1100 usage; empty dark 1100 usage; empty light 1100 usage |
| s9 text measure | p#usage-skipped | 123 chars (772px) | <= 76 chars | "Files the usage report could not read: 0" | 4 views: populated dark 820 usage; populated light 820 usage; empty dark 820 usage; empty light 820 usage |

## Contrast: every text token against every surface, as computed by the page

dark:
| text \ surface | --surface-0 #121211 | --surface-1 #1a1a19 | --surface-2 #232322 |
|---|---|---|---|
| --text-1 #ffffff | 18.74 | 17.42 | 15.73 |
| --text-2 #c3c2b7 | 10.46 | 9.72 | 8.78 |
| --text-3 #8a8a80 | 5.38 | 5.00 | 4.52 |
| --good #0ca30c | 5.59 | 5.19 | 4.69 |
| --warning #fab219 | 10.22 | 9.49 | 8.57 |
| --serious #ec835a | 7.11 | 6.60 | 5.96 |
| --critical #d03b3b | 3.90 | 3.62 | 3.27 |

light:
| text \ surface | --surface-0 #f7f7f5 | --surface-1 #fcfcfb | --surface-2 #f0efec |
|---|---|---|---|
| --text-1 #0b0b0b | 18.35 | 19.17 | 17.12 |
| --text-2 #52514e | 7.40 | 7.73 | 6.90 |
| --text-3 #77766f | 4.25 | 4.44 | 3.97 |
| --good #0ca30c | 3.13 | 3.27 | 2.92 |
| --warning #fab219 | 1.71 | 1.79 | 1.60 |
| --serious #ec835a | 2.46 | 2.57 | 2.29 |
| --critical #d03b3b | 4.48 | 4.68 | 4.18 |

## Contrast: every text colour on the surface it was drawn on (observed)

dark:
| text | surface | opacity | ratio | text nodes | example |
|---|---|---|---|---|---|
| #c3c2b7 (--text-2) | #121211 (--surface-0) | 0.6 | 4.44 | 6 | button.dismiss-button "Dismiss", 13px |
| #808080 (not a token) | #121211 (--surface-0) | 1 | 4.75 | 30 | span.note "error", 12px |
| #8a8a80 (--text-3) | #1a1a19 (--surface-1) | 1 | 5.00 | 426 | span.run-age "waiting 4h", 13px |
| #8a8a80 (--text-3) | #121211 (--surface-0) | 1 | 5.38 | 579 | h2#attention-eyebrow.eyebrow "Attention", 11px |
| #ffffff (--text-1) | #121211 (--surface-0) | 0.6 | 7.18 | 42 | td "proj-yesterday", 13px |
| #c3c2b7 (--text-2) | #1a1a19 (--surface-1) | 1 | 9.72 | 447 | div.run-line2 "Q2: redacted. Triggered by: redacted. Bl", 13px |
| #fab219 (--warning) | #121211 (--surface-0) | 1 | 10.22 | 120 | p#status.stale "Snapshot from 1/1/2026, 7:00:00 PM. Refr", 12px |
| #c3c2b7 (--text-2) | #121211 (--surface-0) | 1 | 10.46 | 288 | button#theme-toggle "theme", 13.3333px |
| #ffffff (--text-1) | #1a1a19 (--surface-1) | 1 | 17.42 | 216 | span.run-name-part "no-upstream", 13px |
| #000000 (not a token) | #efefef (not a token) | 1 | 18.26 | 6 | button#older-toggle "show 1 older", 13.3333px |
| #ffffff (--text-1) | #121211 (--surface-0) | 1 | 18.74 | 1761 | span "1", 20px |

light:
| text | surface | opacity | ratio | text nodes | example |
|---|---|---|---|---|---|
| #fab219 (--warning) | #f7f7f5 (--surface-0) | 1 | 1.71 | 120 | p#status.stale "Snapshot from 1/1/2026, 7:00:00 PM. Refr", 12px |
| #52514e (--text-2) | #f7f7f5 (--surface-0) | 0.6 | 2.85 | 6 | button.dismiss-button "Dismiss", 13px |
| #808080 (not a token) | #f7f7f5 (--surface-0) | 1 | 3.68 | 30 | span.note "error", 12px |
| #77766f (--text-3) | #f7f7f5 (--surface-0) | 1 | 4.25 | 579 | h2#attention-eyebrow.eyebrow "Attention", 11px |
| #77766f (--text-3) | #fcfcfb (--surface-1) | 1 | 4.44 | 426 | span.run-age "waiting 4h", 13px |
| #0b0b0b (--text-1) | #f7f7f5 (--surface-0) | 0.6 | 5.09 | 42 | td "proj-yesterday", 13px |
| #52514e (--text-2) | #f7f7f5 (--surface-0) | 1 | 7.40 | 288 | button#theme-toggle "theme", 13.3333px |
| #52514e (--text-2) | #fcfcfb (--surface-1) | 1 | 7.73 | 447 | div.run-line2 "Q2: redacted. Triggered by: redacted. Bl", 13px |
| #000000 (not a token) | #efefef (not a token) | 1 | 18.26 | 6 | button#older-toggle "show 1 older", 13.3333px |
| #0b0b0b (--text-1) | #f7f7f5 (--surface-0) | 1 | 18.35 | 1761 | span "1", 20px |
| #0b0b0b (--text-1) | #fcfcfb (--surface-1) | 1 | 19.17 | 216 | span.run-name-part "no-upstream", 13px |

RESULT: 85 distinct violation(s)
```

## Phase 5 round (cloud session, 2026-10-05, ark-console 259e73a)

The author's answer: "Not sure on these questions. do whatever makes the most sense for the functionality of the skills repo". The session took its recommended answer to each question. Each one is a record in ark-console docs/decisions/ with Context, Decision, Why, Not chosen, and the check that fails if it is undone. UI.md sections 1 to 7 and 10 now point at them.

- Q1 and Q6, decision 0001: new tokens --warning-text (#fab219 dark, #8c640e light) and --critical-text (#db6868 dark, #c43737 light) for words. The four status colors stay fixed for dots, borders and rules. The stale line, Kill on hover and the kill dialog's confirm word use them. Writing that check found a bug: `#kill-dialog button` (1,0,1) outranked `#kill-dialog-confirm` (1,0,0), so the confirm word stayed --text-2. Fixed with `#kill-dialog button#kill-dialog-confirm`.
- Q2, decision 0002: the third tile is "Runs finished this week", shows "not recorded", and says "The console does not record when a run finishes yet." The indexer is not changed.
- Q3, decision 0003: home keeps every floor and may scroll down, never sideways. The empty fixture is still held to one screen. noScrollCheck takes `mayScroll`; the audit's page-scroll rule applies to the empty fixture only.
- Q4, decision 0004: headings (the header sentence among them) leave the text measure; the audit no longer measures h1 to h3.
- Q5, decision 0005: inside a dimmed row, --text-2 and --text-3 resolve to --text-1; the row keeps opacity 0.6.
- Q7, decision 0006: chart 2's labels sit above their segment in --text-1 on the card, not inside it.
- Q8: the records above are the answer (docs/decisions/README.md).
- Also ported from the cloud run: below a 480px card width, chart 1 shows its 14-day token total and "See the chart on the Usage page" instead of a smaller chart (UI.md section 9). Nothing reaches it at 1440, 1100 or 820; check-page drives it at 560.
- Verified at 259e73a: `node scripts/check-page.js` exit 0, 1,420 passed, 0 failed; `node scripts/audit-ui.js` exit 0, no violation; unit tests 95 of 95 (run as an unprivileged user in the cloud container).

## Phase 6 (ark-console 9bc4d19)

scripts/mutants.js gains PAGE_MUTANTS. Each edits a copy of the repo under tmp/page-mutants/, runs check-page.js or audit-ui.js there with Chrome, and reports the target check's FAIL lines plus any other FAIL lines. The unmutated page must pass both scripts first. `node scripts/mutants.js --page-only` (with ARK_CHROME set): unmutated check-page exit 0 and audit exit 0, then every mutant caught.

| Mutant | Covers | Target check failed | Other FAIL lines |
|---|---|---|---|
| chart-below-floor (CHART_MIN_HEIGHT 220 to 140) | every box meets its floor | yes, 6 | 0 |
| pid-on-home ("PID" in the refresh aria-label) | no banned word on home | yes, 6 | 0 |
| explanation-deleted (Working card's sentence removed) | every home card has a sentence | yes, 6 | 12 (the same sentence's style and position checks) |
| text-token-below-4.5 (light --text-3 back to #77766f) | text at 4.5:1 | yes, 1 | 3 (the literal --text-3 value checks) |
| home-scrolls-when-empty (600px added under home) | no page scroll, empty fixture | yes, 1 | 0 |
| round-trip-loses-state (Back closes open rows) | state kept across the round trip | yes, 2 | 0 |
| unit-word-dropped (hours shown without "hours") | units in words | yes, 4 | 4 (row and card age literals) |
| stale-line-in-warning | decision 0001 | yes, 1 | 0 |
| kill-hover-in-critical | decision 0001 | yes, 1 | 0 |
| runs-finished-replaced ("0" in place of "not recorded") | decision 0002 | yes, 3 | 0 |
| home-scrolls-sideways (home 1600px wide) | decision 0003 | yes, 1 | 7 (layout cap and fallback width, both correct) |
| dimmed-row-text-2 (the 0005 rule removed) | decision 0005 | yes, 1 | 0 |
| chart-2-labels-inside | decision 0006 | yes, 1 | 0 |
| chart-1-shrinks (CHART_MIN_WIDTH 0) | chart 1 fallback | yes, 1 | 0 |
| chart-1-summary-zero | Phase 7 fix below | yes, 1 | 0 |
| audit-text-token-below-4.5 (audit-ui.js) | the audit's contrast rule | yes, 18 rows | 0 |

Lib mutants (the existing list): in this container node printed TAP, so the runner's `✖ T2` parse found no failing test and every mutant read as "not caught". The runner now passes `--test-reporter=spec`. After that, run as an unprivileged user: 124 of 126 caught, and every one of the 95 tests fails under at least one mutant. The two not caught (data-dir-identity-not-compared, data-dir-walk-skips-resolved-path) target K12's case-insensitive branch, which runs only on a volume that ignores case; this container's does not. NOT MEASURED here; they should be caught on the Mac.

## Phase 7 (fresh-context review of `git diff 9ac2977`)

No CRITICAL or HIGH. One MEDIUM was fixed because it breaks the anti-fabrication rule: below 480px, chart 1's summary said "0 tokens used" when no day with sessions had a recorded count. It now says "Tokens used in the last 14 days: not recorded." A no-usage check and the chart-1-summary-zero mutant cover it. After the fix: check-page exit 0, 1,421 passed; audit exit 0; unit tests 95 of 95.

Left for the author (not fixed, by the Phase 7 rule):
- MEDIUM: horizontal scroll at 1440 is only checked on populated and many-sessions home. Empty home and the detail pages at 1440 are not, and no mutant covers sideways scroll at 1100 or 820.
- MEDIUM: Kill on hover in a stale (dimmed) row is --critical-text at opacity 0.6, computed 2.50 to 2.73:1, which breaks decision 0005's "every word in --text-1". The audit never hovers.
- LOW: the fallback's "See the chart on the Usage page" button is rebuilt every poll, so Back cannot return focus to it; it also repeats the Usage detail link below it.
- LOW: decision 0006's check asserts the fill, which the base `.chart-direct-label` rule already sets; only the position assertion can fail.
- LOW: comments still describing the old behavior (stale in --warning, Kill in --critical, chart 2 labels inside segments) in app.js, style.css and check-page.js; the many-sessions precondition's comment says the home check "can fail" on scroll.
- LOW: numbers in decisions 0003 (1,282 and 1,458px) and 0005 (7.18 and 5.09) are measurements and are not marked as measured.
- LOW: the mutants.js header says "the first seven" UI.md bullets; there are six testable ones, plus the units mutant. The audit mutant's pattern matches any contrast row.
- LOW: the default screenshots are viewport-sized, so under decision 0003 docs/screenshot.png cuts home off below the fold.
