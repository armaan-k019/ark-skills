---
name: recruiter-demo-writer
description: Use when building, deepening, or reviewing a recruiter-facing demo page under src/app/demos/ in this portfolio (the pattern behind illoca, world-labs, rho, midjourney, whop). Triggers on requests like "build the Warp demo," "deepen the Whop page," "add a demo for [company]," "write the case study copy for [demo]," or any request to add sections, rewrite copy, or extend an existing page in src/app/demos/. Also use when asked to review a demo page for consistency, tone, voice, or fabricated claims. Not for the older terracotta-palette project pages under src/app/projects/ (urban-gpt, yield, fine-print) — those follow a different template this skill does not cover.
---

Every page under `src/app/demos/` is a recruiter-facing pitch: "here is a tool I built for your product, and here is why it's good." They share one structural skeleton and one voice. This skill keeps a new or edited demo consistent with the ones already shipped, instead of drifting into generic AI-demo copy (marketing adjectives, invented stats, ad hoc section names).

## Before writing anything

Read one shipped demo in full as your reference, not just for the prose but for the exact JSX patterns. `src/app/demos/illoca/page.tsx` and `src/app/demos/world-labs/page.tsx` are the cleanest examples of the skeleton below. `src/app/demos/whop/page.tsx` is a good example of a page that is *missing* two required pieces (see the checklist at the end) — useful for seeing what "not done yet" looks like.

Check which theme export the sibling pages use before importing one: most import `CSS_VAR_COLORS` from `@/components/ThemeToggle`, but `midjourney/page.tsx` uses `MY_STYLE` from the same file instead. Open `src/components/ThemeToggle.tsx` if unsure which is current. Every demo also defines its own `COMPANY_THEME_CSS` block (same `--ct-*` variable names, values rarely change) and renders it via `<CompanyThemeStyle active={true} css={COMPANY_THEME_CSS} />` — copy this block from an existing page rather than retyping the variable names from memory.

## The section skeleton

This order is deliberate and every shipped demo follows it. Don't invent new section names for things this skeleton already covers, and don't skip a required section to save time.

1. **Header** — `h1` title, a pill badge reading "Built for [Company]" (or "Built for [Company] creators" style variants are fine), a one-line subtitle under the title, and a small "Demo by Armaan Kazi" link at the top right linking to `/`.
2. **Back link** — `&#8592; Back to Demos` linking to `/demos`, placed just inside the body, above the first section.
3. **"What [Company] does today"** *(required)* — ground the reader in the real product before pitching anything. A two-column comparison (today / with this demo) or a small before/after table works well; Rho's drift-detection page and Whop's page both do this with an actual UI mockup of the plain product view next to the augmented one. This section is also where anti-fabrication matters most: describe what the company's product actually does, not an invented feature set. If you don't know the product well enough to describe it accurately, say so and ask rather than guessing.
4. **"What this demo adds"** *(required)* — one focused paragraph. State plainly what the tool does, not what it "revolutionizes" or "unlocks." Two clauses of "it does X, and it does Y" is the right length; don't pad it into three paragraphs.
5. **"Why it's better"** *(required)* — a 3-card grid, each card a specific, falsifiable claim about why this approach beats the status quo, not a generic benefit. Optionally follow it with one callout box (colored border, accent background) making the single sharpest version of the pitch in one or two sentences. Illoca does this as an "Upstream of Tracing Paper" callout; Midjourney does it as an italic pull-quote.
6. **"Try it"** *(required)* — the interactive tool itself, behind a short eyebrow label. This is the one component that's genuinely different per demo; build it to fit the specific product being demoed, keeping the same card/border/color tokens as the rest of the page.
7. **"How this works"** *(required, this is the gap in Whop's current page)* — 3 to 4 step cards explaining the mechanism: what happens when the user submits input, in order. Every shipped demo that has this section uses the same card shape (small colored dot, bold title, one sentence of body) — see Illoca's or World Labs' "How this works" grid.
8. **Tie-in to other work** *(optional — only include with a real, checkable connection)* — when a demo genuinely extends other work in the portfolio (Illoca cites the CAADRIA 2026 Archipedia paper and the manual precedent-study process it automates), say so specifically, naming the other project and what exactly transfers. Do not add this section just to fill space, and never invent a research paper, prior project, or methodology to cite. If there's no real tie-in, skip the section entirely rather than writing a vague one.
9. **Footer** *(required)* — "Built by [Link: Armaan Kazi]. Not affiliated with [Company]." plus one line of honest disclaimer specific to the tool: what's real vs. illustrative (Whop: "This roast is AI-generated and for educational purposes only. Results are illustrative."), what's verified (World Labs: "Quoted passages are credited on the card"), or what's AI-generated content vs. real data (Illoca: "Precedents are real. Facts are checked against a curated library.").

## Voice

Read a full section of Illoca or World Labs' prose before writing your own — the register is easier to match by ear than by rule. The load-bearing rules:

- **No em dashes**, anywhere — this is a repo-wide rule (see CLAUDE.md), not specific to demos. Use a period, comma, colon, or parentheses instead.
- **No marketing adjectives.** "Revolutionary," "powerful," "seamless," "game-changing" don't appear anywhere in the shipped copy. Claims are specific and checkable instead ("three precedents" not "curated selection"; "5 to 10 minutes" not "quickly").
- **State limitations plainly, in the copy itself, not just in a footnote.** World Labs' page says outright that draft worlds take 5 to 10 minutes and that a generation can be closed and resumed via a saved link. Whop's footer says the roast is illustrative, not real feedback from real buyers. If part of a demo is stubbed, mocked, or degraded, the page should say so in plain language near the feature, not bury it.
- **Second person for the pitch sections, first person only for genuine personal context** (e.g. "This tool automates the precedent-driven design methodology I used on my own studio work").

## Anti-fabrication

This repo's CLAUDE.md already has a hard rule against inventing code, features, or stack claims that don't reflect the repo. For demo pages specifically, that rule extends to two things worth naming explicitly because they're easy to fabricate by accident:

- **The host company's product.** Don't describe features "[Company] does today" that you haven't verified. If you're not sure what the actual product does, ask the user or say so in the draft rather than inventing a plausible-sounding feature list.
- **Any reference corpus the demo cites** (precedents, source texts, example data, a research paper). Illoca's precedent library and World Labs' preloaded texts are called out in CLAUDE.md as needing individual verification against a real source, never generated in bulk from memory. If you're adding entries to a corpus like this, verify each one individually and say so; don't bulk-generate plausible-sounding entries.
- **Metrics and screenshots.** Never invent a statistic, win rate, or benchmark number to make a "Why it's better" card sound more concrete. If you don't have a real number, make the claim qualitative instead of fabricating precision.

## Deepening an existing demo

When asked to "deepen" or "finish" a demo that's already partly built (Whop and Midjourney are the current examples), diff its current sections against the skeleton above rather than rewriting the whole page. Whop right now has everything except "How this works" and a tie-in section — so deepening it means adding a How-this-works step-card grid in the same visual language as the rest of the page, and only adding a tie-in section if there's a genuine one to cite (if not, leave it out). Preserve the page's existing accent color, copy voice, and component patterns; don't restyle a working page while adding a missing section.

## New demos (e.g. a future Warp page)

Start from the skeleton above, pick an accent color (most demos use the same green `#2d5a27` "company-theme" accent; a new demo can reuse it or choose a different one if the product's own brand color fits better), and write "What [Company] does today" only once you actually know the product. If the premise of the demo isn't fully decided yet, say so and ask rather than guessing at what the company does or what problem the tool solves.
