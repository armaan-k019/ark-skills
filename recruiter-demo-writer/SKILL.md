---
name: recruiter-demo-writer
description: Use when choosing, building, deepening, or reviewing a recruiter-facing demo page under src/app/demos/ in this portfolio (the pattern behind illoca, world-labs, rho, midjourney, whop). Covers picking the demo idea for a target company and checking it for hiring signal, not only the page itself. Triggers on requests like "what demo should I build for [company]," "is this a good demo idea for [company]," "build the Warp demo," "deepen the Whop page," "add a demo for [company]," "write the case study copy for [demo]," or any request to add sections, rewrite copy, or extend an existing page in src/app/demos/. Also use when asked to review a demo page for consistency, tone, voice, hiring signal, or fabricated claims, when a demo has too much text or looks AI-generated and needs trimming, and whenever a demo is being planned for a job application even if the page is not mentioned. Not for the older terracotta-palette project pages under src/app/projects/ (urban-gpt, yield, fine-print), which follow a different template this skill does not cover.
---

Every page under `src/app/demos/` is a recruiter-facing pitch: "here is a tool I built for your product, and here is why it's good." They share one structural skeleton and one voice. This skill keeps a new or edited demo consistent with the ones already shipped, instead of drifting into generic AI-demo copy (marketing adjectives, invented stats, ad hoc section names).

## Pick the idea first

A demo page has two readers on two clocks. The first look takes a few seconds and decides whether anyone keeps reading. The second look comes from someone on the team (a hiring manager, an engineer) and asks one question: does this person understand our business? Flash wins the first look and nothing else. A demo that fails the second look is a no, however good it looked, and to an engineer a mediocre tool reads as mediocre judgment.

So the goal is not flashy versus useful. It is a useful demo whose payoff is visible in the first few seconds. Do the three steps below before writing any page code, whenever the premise isn't already decided by the user. If it is decided, still run steps 1 and 3 as a check and say plainly if the idea fails one.

### 1. Write a hiring-signal brief

Ask the user which company and role this is for, and what they already know, before researching. Then fill in this brief. Every line cites a source (a job posting, engineering blog, docs, changelog, a public talk) or says NOT AVAILABLE. Never fill a line from memory: products change, and a stale "what [Company] does today" is the most damaging error this page can make, because the reader knows their own product.

```markdown
Company:
Role: (posting URL, or NOT AVAILABLE)
Who pays them, and for what:
Core objects: (the nouns their users work with in the product)
What the team says is hard right now: (a quote, with its source)
What a reviewer on this team would check on a second look:
```

The last line is a judgment, so label it as one ("inferred from the posting's requirements") rather than presenting it as a fact.

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
- The "Try it" tool opens with a precomputed example already filled in and its output already showing, not an empty input box. Label the example as sample input.
- Above the fold, the reader should see a real result, not only a description of one. If the skeleton's order pushes "Try it" below the fold, a single compact result card under the header that links down to "Try it" is allowed.

To check it, take real screenshots of the top of the page at desktop (1280 by 800) and phone (390 by 844) widths (see `visual-loop`), give one to someone with no context (a fresh subagent works), and ask what the tool does and who it is for. If the answer needs anything below the fold, it fails. Don't pass this from memory or from an old screenshot.

## Before writing anything

Read one shipped demo in full as your reference, not just for the prose but for the exact JSX patterns. `src/app/demos/illoca/page.tsx` and `src/app/demos/world-labs/page.tsx` are the cleanest examples of the skeleton below. `src/app/demos/whop/page.tsx` is a good example of a page that is *missing* two required pieces (see "Deepening an existing demo" below), which is useful for seeing what "not done yet" looks like.

Check which theme export the sibling pages use before importing one: most import `CSS_VAR_COLORS` from `@/components/ThemeToggle`, but `midjourney/page.tsx` uses `MY_STYLE` from the same file instead. Open `src/components/ThemeToggle.tsx` if unsure which is current. Every demo also defines its own `COMPANY_THEME_CSS` block (same `--ct-*` variable names, values rarely change) and renders it via `<CompanyThemeStyle active={true} css={COMPANY_THEME_CSS} />`. Copy this block from an existing page rather than retyping the variable names from memory.

## The section skeleton

This order is deliberate and every shipped demo follows it. Don't invent new section names for things this skeleton already covers, and don't skip a required section to save time.

1. **Header**: `h1` title, a pill badge reading "Built for [Company]" (or "Built for [Company] creators" style variants are fine), a one-line subtitle under the title, and a small "Demo by Armaan Kazi" link at the top right linking to `/`.
2. **Back link**: `&#8592; Back to Demos` linking to `/demos`, placed just inside the body, above the first section.
3. **"What [Company] does today"** *(required)*: ground the reader in the real product before pitching anything. A two-column comparison (today / with this demo) or a small before/after table works well; Rho's drift-detection page and Whop's page both do this with an actual UI mockup of the plain product view next to the augmented one. This section is also where anti-fabrication matters most: describe what the company's product actually does, not an invented feature set. If you don't know the product well enough to describe it accurately, say so and ask rather than guessing.
4. **"What this demo adds"** *(required)*: one focused paragraph. State plainly what the tool does, not what it "revolutionizes" or "unlocks." Two clauses of "it does X, and it does Y" is the right length; don't pad it into three paragraphs.
5. **"Why it's better"** *(required)*: three specific, falsifiable claims about why this approach beats the status quo, not generic benefits. Don't lay them out as three identical icon, heading and body cards: that grid is one of the clearest AI-generated tells (see "Make it look made by a person" below). A plain list, or a row where one claim carries more weight than the other two, reads as a choice. Optionally follow it with one callout (a full border or a tinted background, never a thick colored stripe down one side) making the single sharpest version of the pitch in one sentence. Illoca does this as an "Upstream of Tracing Paper" callout; Midjourney does it as an italic pull-quote.
6. **"Try it"** *(required)*: the interactive tool itself, under a plain heading. No small uppercase eyebrow label above it. This is the one component that's genuinely different per demo; build it to fit the specific product being demoed, keeping the same card/border/color tokens as the rest of the page.
7. **"How this works"** *(required, this is the gap in Whop's current page)*: 3 to 4 numbered steps explaining the mechanism: what happens when the user submits input, in order. Numbers are earned here because it really is a sequence. Shipped demos use a grid of identical dot cards (small colored dot, bold title, one sentence of body) for this; treat that as a pattern to replace when trimming a page, not one to copy.
8. **Tie-in to other work** *(optional, only with a real, checkable connection)*: when a demo genuinely extends other work in the portfolio (Illoca cites the CAADRIA 2026 Archipedia paper and the manual precedent-study process it automates), say so specifically, naming the other project and what exactly transfers. Do not add this section just to fill space, and never invent a research paper, prior project, or methodology to cite. If there's no real tie-in, skip the section entirely rather than writing a vague one.
9. **Footer** *(required)*: "Built by [Link: Armaan Kazi]. Not affiliated with [Company]." plus one line of honest disclaimer specific to the tool: what's real vs. illustrative (Whop: "This roast is AI-generated and for educational purposes only. Results are illustrative."), what's verified (World Labs: "Quoted passages are credited on the card"), or what's AI-generated content vs. real data (Illoca: "Precedents are real. Facts are checked against a curated library.").

## Voice

Read a full section of Illoca or World Labs' prose before writing your own. The register is easier to match by ear than by rule. The load-bearing rules:

- **No em dashes**, anywhere. This is a repo-wide rule (see CLAUDE.md), not specific to demos. Use a period, comma, colon, or parentheses instead.
- **No marketing adjectives.** "Revolutionary," "powerful," "seamless," "game-changing" don't appear anywhere in the shipped copy. Claims are specific and checkable instead ("three precedents" not "curated selection"; "5 to 10 minutes" not "quickly").
- **State limitations plainly, in the copy itself, not just in a footnote.** World Labs' page says outright that draft worlds take 5 to 10 minutes and that a generation can be closed and resumed via a saved link. Whop's footer says the roast is illustrative, not real feedback from real buyers. If part of a demo is stubbed, mocked, or degraded, the page should say so in plain language near the feature, not bury it.
- **Second person for the pitch sections, first person only for genuine personal context** (e.g. "This tool automates the precedent-driven design methodology I used on my own studio work").

## Less text

Every shipped demo has too much text. A reviewer on the second look reads the tool's output, the before/after, and maybe two sentences; everything else is skimmed or skipped, and a wall of prose is itself a sign of generated copy. When a picture, the tool's own output, or a table can say it, cut the sentence.

Starting caps, to tune with the author as rounds go:

| Part | Cap |
|---|---|
| Header subtitle | one line, 15 words |
| "What [Company] does today" | 40 words; the before/after visual carries the rest |
| "What this demo adds" | 2 sentences |
| "Why it's better" | 3 claims of 20 words or fewer; callout 25 words |
| "How this works" | 12 words per step |
| Tie-in | 40 words |
| Footer disclaimer | 1 sentence |
| Whole page outside "Try it" | 250 words |
| Above the fold | 40 words |

The section caps add up to more than 250 on purpose: not every section gets its full cap. Count the rendered text, not the source (for example `innerText` of the page's main element in the browser, minus the tool's region), and report the counts with the page. When a cut would drop a limitation the page has to state (see Voice), keep the limitation and cut something else.

## Make it look made by a person

The demos should not look AI-generated. Hand this to `impeccable`; don't redesign from this skill. What to give it:

- **Register:** the page is a portfolio piece, so `impeccable`'s brand register (`reference/brand.md`) applies to the page; the tool inside "Try it" is product UI, so its product register applies there.
- **Detector:** run `impeccable`'s detector (`scripts/detect.mjs`) over the demo's files and fix what it reports before any taste round.
- **Absolute bans** that the old version of this skeleton walked into: identical card grids, a small uppercase eyebrow above every section, thick colored side stripes on callouts, gradient text, and the hero-metric template. Its "AI slop test" is the bar: if someone could say "AI made that" without doubt, it fails.
- **Company theme:** the page's job is to look like it belongs next to the company's product, so take cues from their real product (with screenshots as the source), not from a generic SaaS look.

Then run the look as `visual-loop` rounds: screenshots to the author, numbered decisions back, each decision turned into a check. The author decides the look; the session does not.

## Trimming the shipped demos

To bring an existing page down to these rules, do it as two separate passes so each one can be reviewed on its own: first text (apply the caps, report before and after word counts), then look (detector, bans, `visual-loop` rounds). Keep the page's accent color and anything else the author has already decided, and don't change what the tool does while trimming.

## Anti-fabrication

This repo's CLAUDE.md already has a hard rule against inventing code, features, or stack claims that don't reflect the repo. For demo pages specifically, that rule extends to two things worth naming explicitly because they're easy to fabricate by accident:

- **The host company's product.** Don't describe features "[Company] does today" that you haven't verified. If you're not sure what the actual product does, ask the user or say so in the draft rather than inventing a plausible-sounding feature list.
- **Any reference corpus the demo cites** (precedents, source texts, example data, a research paper). Illoca's precedent library and World Labs' preloaded texts are called out in CLAUDE.md as needing individual verification against a real source, never generated in bulk from memory. If you're adding entries to a corpus like this, verify each one individually and say so; don't bulk-generate plausible-sounding entries.
- **Metrics and screenshots.** Never invent a statistic, win rate, or benchmark number to make a "Why it's better" card sound more concrete. If you don't have a real number, make the claim qualitative instead of fabricating precision.

## Deepening an existing demo

When asked to "deepen" or "finish" a demo that's already partly built (Whop and Midjourney are the current examples), diff its current sections against the skeleton above rather than rewriting the whole page. Whop right now has everything except "How this works" and a tie-in section, so deepening it means adding a How-this-works step-card grid in the same visual language as the rest of the page, and only adding a tie-in section if there's a genuine one to cite (if not, leave it out). Preserve the page's existing accent color, copy voice, and component patterns; don't restyle a working page while adding a missing section.

## New demos (e.g. a future Warp page)

Start from the skeleton above, pick an accent color (most demos use the same green `#2d5a27` "company-theme" accent; a new demo can reuse it or choose a different one if the product's own brand color fits better), and write "What [Company] does today" only from the hiring-signal brief, never from memory. If the premise isn't decided yet, run "Pick the idea first" and bring the brief and the scored ideas to the user rather than guessing at what the company does or what problem the tool solves.

Hand the visual pass (layout, type, color, polish) to `impeccable`, and run the portfolio's checks with `verify-before-done` before calling any demo page done. The five-second test in step 3 is part of done.
