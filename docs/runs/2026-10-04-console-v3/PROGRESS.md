# Progress: ark-console v3, readable by someone who did not build it
Updated: 2026-10-04 22:56 EDT   Branches: ark-console feat/console-v3 (from docs/ui-v3-simple bc38b4e), ark-skills docs/console-v3-run   Last commit: ark-console 8adc739

Class (unattended-build Step 0): machine-checkable. Every Phase 0 to 4 acceptance criterion is a command or a computed-style assertion that can fail; the taste in it (type scale, floors, explanation wording) goes to the author at the Phase 5 gate, as the SPEC says. The stop-and-ask and decide-yourself lists are the SPEC's own ("Stop and ask", "Decide yourself") plus STANDING-DECISIONS.md, which is left as the author wrote it.

## Now
Phase 3 (SPEC "Phase 3: plain language"), step: a sonnet builder is working; a fresh-context reviewer reads the Phase 2 diff and fix round 1 (e3e3557..8adc739) in parallel.

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
- Fix round 1 (main session, opus), ark-console 8adc739: H1 fixed (toggleAttribute on the svg; the toggle checks read what is drawn: 6 toggle FAILs and 2 round-trip FAILs on the old code, observed, then pass); round-trip checks assert the state changed first (L2); M1 hit targets on Sessions, Repos and Skills pages; M3 and M4 in the audit (removing the measure cap gives 43 measure violations, observed, then restored); measure: `--measure: 56ch` (60ch gave a longest line of 79), the check asserts a cap no wider than 76ch plus the line length in characters; `.row-question` (the one-line ellipsis cell, UI.md section 4) leaves the prose list. Verified: tests 95 of 95 (b77bca1); `node scripts/check-page.js` 1,198 passed, 2 failed (both Q3: home 1114px on the populated fixture, 1282px on many-running); `node scripts/audit-ui.js` exit 1, 58 distinct: contrast 23, horizontal scroll 2 (Usage page 1241 wide at 1100 and 820), page scroll on home 1, banned word 2, chart box 12, headline block 3, hit target 15, text measure 0.
- Home heights at 1440x900 after Phase 2 (builder's measurement): populated 1114 (waiting 255, working 115, usage 534, footer 74, header 56); empty 900; many-running 1282 (working 283).

## In flight
- Nothing.

## Open questions
- Q1: `--warning` as text. UI.md section 6 turns the stale snapshot line `--warning`; section 1 says status colors are "fixed, never themed". Measured: #fab219 on light --surface-0 #f7f7f5 is 1.71:1 (the audit's lowest). No single color reaches 4.5:1 on both #f7f7f5 and #121211 (it would need relative luminance at most 0.157 for light and at least 0.203 for dark), so section 9's rule cannot be met without theming a status token or not using --warning for that text. Triggered by: a design decision UI.md does not cover (two of its sections conflict). Blocks: Phase 4's "every ratio at or above 4.5" for the stale line in light mode only. Raised: not yet (Phase 5 report).
- Q2: the third headline number. UI.md section 4 names "runs finished this week"; the snapshot has no record of a run finishing (runs carry status_line, updated, waiting_on_human; nothing marks done), so it needs the indexer to collect something new. Triggered by: SPEC stop-and-ask "Changing what the indexer collects". Blocks: the third headline number; until answered it stays today's "share from general-purpose" tile. Raised: not yet.
- Q3: home height. UI.md's values (24px home card padding, 36px rows, 34px big numbers, a 220px chart, an explanation sentence per card) and "no page scroll at 1440x900" do not fit together once home has a few rows: estimated about 1,020px on the populated fixture after Phase 2, and the many-sessions fixture is already 1003px at Phase 1's smaller sizes. UI.md sets no cap on waiting rows. Triggered by: a design decision UI.md does not cover (sections 2, 3 and 9 conflict). Blocks: the no-scroll check on populated data after Phase 2 (measured then). Raised: not yet.

## Gaps (UI.md silent; today's behavior kept unless noted) and review leftovers
- No body font family in UI.md or style.css: the page renders in the browser default serif (Times). Not changed.
- Detail pages show no snapshot time, stale marker, theme toggle or refresh (they sit in home's header and footer). Review M2. Not changed; for the author.
- "See all runs" opens the Sessions page at its top; the "Waiting on you" section is below the sessions table there (review L4), and the link is after the rows in tab order.
- Back to home focuses the opener only if it still exists; if a poll hid "Show all n running", focus falls to the body (review L1, LOW).
- Detail views are outside the `<main>` landmark (review nit).
- Chart 1's direct label ("3.1M") is clipped at the top of the chart (seen in docs/screenshot-light.png after Phase 2).
- Phase 2 choices (UI.md section 2 does not say): #status and the dismissed label in label style; chart axis text 12px and direct labels 12px monospace; usage table captions as prose; the usage-window h3 and problems h2 in title style, titles in --text-1; the detail "Waiting on you" heading kept as a micro eyebrow; .run-line2 line-height 22px; home rows height 36, table rows min-height 36; the kill dialog as a detail card.
- --measure 56ch: chosen by the session so lines hold at most 76 characters in this font.

## Decisions
- The two fixtures are test/fixtures/snapshot.json (populated) and snapshot-empty.json, made by scripts/make-snapshot-fixtures.js. The SPEC names scripts/make-fixtures.js, which makes transcript fixtures, not page fixtures; UI.md section 10's "the empty and the populated fixture" are these two.
- Audit, banned words: "PID" matches any case (UI.md lists "PID" and "pid"); "SHA" and "HEAD" match uppercase only (the English "head" is not banned); the rest any case, plurals included; the model rule is `claude-[a-z0-9-]+`, any case. The check reads the home root's innerText plus every title, aria-label, alt and placeholder inside it.
- Audit, measures: row height is a floor (>= 36); text measure counts a wrapping block holding more than 76 characters of its own text whose content width, divided by the average character width of that text in its own font, exceeds 76; contrast composites every ancestor's background over white and multiplies the text alpha by every ancestor's opacity, so dimmed rows are measured as drawn. Home before v3 is the whole page (there was no home root), so the round 2 tab panels count as home in the before state.

- Phase 1 views are shown and hidden in place (no re-render, no URL change), so state round-trips by construction; the URL fragment is left to the kill token.
- Run Dismiss moves off home with the attention cards: the Sessions page holds a "Waiting on you" section with the full cards, their Dismiss buttons and "show dismissed"; home's "See all runs" opens it. (The SPEC moves kill and dismiss to the Sessions page; runs had no other place there.)
- Gates: each phase boundary gets a fresh-context review of that phase's diff, run in parallel with the next phase's builder (the reviewer only reads), fixes in at most two rounds.

## Next action
Wait for the Phase 3 builder and the Phase 2 reviewer; verify Phase 3 against the artifact (home innerText, screenshots, check counts).

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
