---
name: recruiter-demo-writer
description: Use when choosing, building, deepening, or reviewing a recruiter-facing demo page under src/app/demos/ in this portfolio (the pattern behind illoca, world-labs, rho, midjourney, whop). Covers picking the demo idea for a target company and checking it for hiring signal, not only the page itself. Triggers on requests like "what demo should I build for [company]," "is this a good demo idea for [company]," "build the Warp demo," "deepen the Whop page," "add a demo for [company]," "write or cut the copy for [demo]," or any request to add sections, rewrite copy, or extend an existing page in src/app/demos/. Also use when asked to review a demo page for consistency, tone, voice, hiring signal, or fabricated claims, when a demo has too much text (every demo page must render under 200 words) or looks AI-generated and needs trimming, and whenever a demo is being planned for a job application even if the page is not mentioned. Not for the older terracotta-palette project pages under src/app/projects/ (urban-gpt, yield, fine-print), which follow a different template this skill does not cover.
---

Every page under `src/app/demos/` is a recruiter-facing pitch: "here is a tool I built for your product." They share one short page structure and one voice. This skill keeps a new or edited demo consistent with the ones already shipped, instead of drifting into generic AI-demo copy (marketing adjectives, invented stats, ad hoc section names).

## Pick the idea first

A demo page has two readers on two clocks. The first look takes a few seconds and decides whether anyone keeps reading. The second look comes from someone on the team (a hiring manager, an engineer) and asks one question: does this person understand our business? Flash wins the first look and nothing else. A demo that fails the second look is a no, however good it looked, and to an engineer a mediocre tool reads as mediocre judgment.

So the goal is not flashy versus useful. It is a useful demo whose payoff is visible in the first few seconds. Do the three steps below before writing any page code, whenever the premise isn't already decided by the user. If it is decided, still run steps 1 and 3 as a check and say plainly if the idea fails one.

### 1. Write a hiring-signal brief

Ask the user which company and role this is for, and what they already know, before researching. Then fill in this brief. Every line cites a source (a job posting, engineering blog, docs, changelog, a public talk) or says NOT AVAILABLE. Never fill a line from memory: products change, and a stale claim about their product is the most damaging error this page can make, because the reader knows their own product.

```markdown
Company:
Role: (posting URL, or NOT AVAILABLE)
Who pays them, and for what:
Core objects: (the nouns their users work with in the product)
What the team says is hard right now: (a quote, with its source)
What a reviewer on this team would check on a second look:
```

The last line is a judgment, so label it as one ("inferred from the posting's requirements") rather than presenting it as a fact. The sourcing rule covers every claim about the company anywhere in your answer, not only the brief. A feature named in passing while scoring an idea ("their API makes this easy") needs a source or an "unchecked" just the same.

### 2. Score three candidate ideas

Write down three ideas and score each one yes, partly, or no on four questions, with a one-line reason per cell:

- **Native:** is it built on the company's core objects and their users' workflow? Run the relabel test: swap in a competitor's name. If the demo still works with nothing else changed, it is not native. An existing portfolio project with the company's name on it (a Datum page relabeled for Clay, say) shows you can engineer, and nothing about whether you understand their business.
- **Hook:** is the payoff visible on load, with no click, typing, or waiting?
- **Buildable:** can the working core ship for real in the time available, on real data or clearly labeled sample data? A mocked core fails this.
- **Honest:** can the page be written without inventing their features, their metrics, or their customers' data?

Choose among the ideas that are native and honest first, and only then on hook. A weak hook is fixable with design (step 3); a non-native idea is not fixable at all. Don't drop a native idea because it looks boring. Show the user the brief and the scored table and let them pick before building.

### 3. Design for the five-second test

At load, with no scroll, click, or typing, a stranger should be able to say what the tool does and who it is for. Build toward that from the start rather than checking it at the end:

- The header subtitle says what the tool does in the company's own nouns, not in general terms.
- The tool opens with a precomputed example already filled in and its output already showing, not an empty input box. Label the example as sample input.
- Above the fold, the reader should see a real result, not only a description of one. With the page structure below, the tool sits right under one or two sentences, so its first output should already be on screen.

To check it, take real screenshots of the top of the page at desktop (1280 by 800) and phone (390 by 844) widths (see `visual-loop`), give one to someone with no context (a fresh subagent works), and ask what the tool does and who it is for. If the answer needs anything below the fold, it fails. Don't pass this from memory or from an old screenshot.

## Before writing anything

Read one shipped demo in full for the exact JSX patterns. After the October 2026 pass, Illoca (111 words) and Whop (71 words) are the shortest examples of the structure below.

Check which theme export the sibling pages use before importing one: most import `CSS_VAR_COLORS` from `@/components/ThemeToggle`, but `midjourney/page.tsx` uses `MY_STYLE` from the same file instead. Open `src/components/ThemeToggle.tsx` if unsure which is current. Every demo also defines its own `COMPANY_THEME_CSS` block (same `--ct-*` variable names, values rarely change) and renders it via `<CompanyThemeStyle active={true} css={COMPANY_THEME_CSS} />`. Copy this block from an existing page rather than retyping the variable names from memory.

## The hard limit: under 200 words

Every page under `src/app/demos/` must render under 200 words, counted as the `innerText` of `<main>` on the built page. Buttons, labels, chart ticks and the footer all count. Measure it on the built page (a production build, served), for example by running `document.querySelector('main').innerText.trim().split(/\s+/).length` in the browser console. Do not estimate from source: labels, ticks and generated output only show up once rendered. Report the number with the page.

The tool is the page. A reviewer looks at what the tool produces; prose around it is skimmed or skipped, and a wall of it reads as generated.

## Page structure

This replaces the old nine-section skeleton. Nothing else goes on the page.

1. **Header:** `h1` title, a pill badge reading "Built for [Company]", one plain subtitle that says what the tool does, and the small "Demo by Armaan Kazi" link at the top right linking to `/`. No taglines and no three-beat slogans ("Understand. Recreate. Step inside.").
2. **Back link:** `&#8592; Back to Demos` linking to `/demos`.
3. **One or two sentences:** what the tool does and what it runs on. If the data is synthetic, say so here.
4. **The tool itself.** This is the page.
5. **Optional finding box:** one or two sentences, only when the demo produces a real result (Clay does).
6. **Optional collapsed `<details>`:** for assumptions or method tables.
7. **Footer, one line:** "Built by Armaan Kazi. Not affiliated with [Company]." plus one honesty note if needed ("A model, not data.").

## Cut on sight

- "What [Company] does today" sections and today/with-this-demo comparison tables.
- "What this demo adds" paragraphs that restate the subtitle.
- "Why it's better" card grids and "Why this is different" callouts or pull-quotes.
- "How this works" step cards. If the mechanism matters, say it in one sentence.
- "Why this matters" or "Built for [Company]" closing essays about the company's mission.
- Helper text that repeats a placeholder or an obvious control ("Moving a slider resets the run").
- Any claim about the company or product that is not checked against a source (Whop's fee and creator count, "No other platform has this data").
- Any claim about the tool that the code does not do ("score updates automatically").

## Sentence rules

- Say what the tool does, not why it is impressive. No "exactly", "actually", "instantly", "uniquely", and no marketing adjectives.
- One idea per sentence. Prefer 10 to 20 words.
- Keep concrete numbers from the code (1,200 prospects, $2M budget). Drop numbers nobody can verify.
- Short UI labels: "Inbox size" not "Emails per inbox today"; "1x speed" not "1 day per frame".
- Never " - " or an em dash as punctuation. Use a period, comma, colon, or parentheses.
- State limitations plainly near the feature, in as few words as the footer or the opening sentences allow. When a cut would drop a limitation the page has to state, keep the limitation and cut something else.

## Process

1. Build the page and record its rendered word count.
2. Delete whole sections first, then shorten sentences, then shorten labels.
3. Never add a claim while cutting. Rewording must keep the original meaning.
4. Rebuild, re-measure, and confirm under 200 before committing. One commit per page.

The October 2026 pass, measured this way: World Labs 497 to 178, Illoca 372 to 111, Rho drift 606 to 192, Rho trajectory 282 to 194, Midjourney 387 to 104, Clay 926 to 194, Terranox 738 to 169, Whop 287 to 71.

## Make it look made by a person

The demos should not look AI-generated. Hand this to `impeccable`; don't redesign from this skill. What to give it:

- **Register:** the page is a portfolio piece, so `impeccable`'s brand register (`reference/brand.md`) applies to the page; the tool is product UI, so its product register applies there.
- **Detector:** run `impeccable`'s detector (`scripts/detect.mjs`) over the demo's files and fix what it reports before any taste round.
- **Absolute bans:** identical card grids, a small uppercase eyebrow above every section, thick colored side stripes on callouts, gradient text, and the hero-metric template. Its "AI slop test" is the bar: if someone could say "AI made that" without doubt, it fails.
- **Company theme:** the page should look like it belongs next to the company's product, so take cues from their real product (with screenshots as the source), not from a generic SaaS look.

Then run the look as `visual-loop` rounds: screenshots to the author, numbered decisions back, each decision turned into a check. The author decides the look; the session does not. Do text and look as separate passes so each can be reviewed on its own, and don't change what the tool does in either.

## Anti-fabrication

This repo's CLAUDE.md already has a hard rule against inventing code, features, or stack claims that don't reflect the repo. For demo pages it extends to:

- **The host company's product.** No claim about the company goes on the page unless it is checked against a source (the hiring-signal brief is where those sources live). If it can't be checked, cut it.
- **The tool itself.** No sentence may claim the tool does something the code does not do.
- **Any reference corpus the demo cites** (precedents, source texts, example data, a research paper). Illoca's precedent library and World Labs' preloaded texts are called out in CLAUDE.md as needing individual verification against a real source, never generated in bulk from memory. Verify each new entry individually and say so.
- **Metrics.** Never invent a statistic, win rate, or benchmark number. Numbers on the page come from the code or from a cited source.

## New demos (e.g. a future Warp page)

If the premise isn't decided yet, run "Pick the idea first" and bring the brief and the scored ideas to the user. Then build to the page structure above, pick an accent color (most demos use the green `#2d5a27` "company-theme" accent; a new demo can use the product's own brand color if it fits better), and follow the process. Run the portfolio's checks with `verify-before-done` before calling it done. Under 200 rendered words and the five-second test in step 3 are both part of done.

## Known cost

Measured with `skill-creator` on 2026-10-05 for the "Pick the idea first" section only (written before the 200-word page rules and the "Make it look made by a person" section, which are not measured). Three questions (a Clay role with a plan to rebrand an existing project, a flashy 3D idea for a Linear role, a Warp page plan), each answered by one session with this skill and one with the version before it, graded on 8 assertions by an agent that was not told which version wrote which and spot-checked company facts on the web. With this skill the pass rate was 92% (22 of 24); with the previous version, 62% (15 of 24). The previous version gave no explicit scoring and, in two of three answers, nothing on what loads first; once it proposed a single idea. This version's two misses were each one company fact named in passing with no source, which is why the sourcing rule above now names that case. That sentence was added after the eval and has not been re-measured.
