---
name: site-cohesion
description: Keep the four armaankazi.com sections (Website, Portfolio, Lab, Workflow) reading as one site when a route, page, demo, project, or section is added, renamed, moved, or removed. Lists every file that has to change together in my-portfolio, kazi_lab, and ark-skills, and how to check none was missed. Use for any change that adds or removes something a visitor can navigate to, touches the chooser, a section header, the home buttons, or the site guide birds, or when asked whether the sites are consistent.
---

# Site Cohesion

armaankazi.com is one Next.js app (my-portfolio) that hosts four sections behind a chooser at `/`, plus data fed in from two other repos. Each section has its own header, the site guide birds answer questions about all of it, and several lists repeat the same pages. In October 2026 most cross-site bugs were one of those lists not being updated: a demo the guide could not see, a section without its home button, a stale count in CLAUDE.md. This skill is the map of what moves together.

Written from the threads "Add home buttons across all sites", "Build Huginn and Muninn site guides", "Unified armaankazi.com deployment", "Launch read-only visibility dashboard", "Rename and simplify the research lab", "Build Warp demo for portfolio", and "Build DLR demo for portfolio", checked against my-portfolio `main` at 583ce33. Paths can move: grep before trusting one.

## The map

| Section | Route | Where its content comes from |
|---|---|---|
| Chooser | `/` | `content/sites.ts` (four tiles; `building: true` makes a tile say so instead of linking) |
| Website | `/home` and everything not listed below | `content/*.ts`, MDX in `content/blog` and `content/research` |
| Portfolio | `/architecture` | `content/storybook.ts`, images in `public/storybook/` |
| Lab (corvid) | `/lab` | `content/corvid-snapshot.json`, generated in kazi_lab by `pnpm --filter web export:public <path>` |
| Workflow | `/setup` | ark-skills `viz/data/graph.json`, fetched from GitHub `main` at build and revalidated daily (`src/lib/skills-graph.ts`) |

Shared pieces that every section shows:

- **Section headers:** `src/lib/sections.ts` maps route prefixes to a section (name and start page). `src/components/Navbar.tsx` opens with `AllSitesLink` (to `/`) and then the section name (to its start). Only Website pages show Experience, Projects, and Journal.
- **Site guide (the two ravens):** mounted once in `src/app/layout.tsx`, so on every page. It answers only from `src/lib/guide/knowledge.ts`, which reads `content/projects.ts`, `content/work.ts`, `content/demos.ts`, `content/sites.ts`, and the MDX, plus two hand-kept lists in that file: `CONTACT_LINKS` and `PAGE_LINKS`. Its "take me to" only goes to an href in `guideLinks()`.
- **kazi_lab's own app** draws its own pair of home buttons in `apps/web/components/shell/site-home-buttons.tsx`, with the chooser URL as a constant. It still has the older boxed style; the deployed lab is the snapshot at `/lab`, so that only matters if the lab app is deployed itself.

## What to update, by change

**A new demo.** `src/app/demos/<slug>/`, its route under `src/app/api/demos/<slug>/` (server-side Claude call, `maxDuration` exported), and a card in `content/demos.ts`. The card is what lists it publicly and what the guide sees; a demo without a card is reachable only by URL or access code (`src/lib/demos.ts`). Then update the demo list in my-portfolio's `CLAUDE.md`. Follow `recruiter-demo-writer` for the page itself.

**A new project.** An entry in `content/projects.ts` (that is what lists it and what the guide sees). A bespoke page in `src/app/projects/<slug>/` overrides the generic renderer; a bespoke page with no entry is routable but unlisted and invisible to the guide.

**A new top-level page on the Website.** Add it to `PAGE_LINKS` in `knowledge.ts` if visitors should be able to ask the birds for it, and to the Navbar only if Armaan asks.

**A new section or route prefix.** An entry in `src/lib/sections.ts`, a tile in `content/sites.ts`, a `PAGE_LINKS` entry, and a check that the chooser grid still lays out at phone width. Ask before adding a fifth section; the chooser is designed around four.

**A rename.** Grep all three repos for the old name, not only the obvious file. The lab's display name lives in one constant in kazi_lab (`apps/web/lib/brand.ts`) and is repeated in `src/lib/sections.ts`, `content/sites.ts`, and the guide's text. Package names (`@kazi-lab/*`) and repo names stay unless Armaan says otherwise.

**A removal.** Remove the card or entry, not only the route, then grep for the slug across `content/`, `src/`, and `knowledge.ts`. Keep a recovery note (commit and path) in project memory, as the portfolio focus cuts did.

**A new skill, agent, or hook.** Add it in ark-skills, list it in `viz/scripts/families.json`, run `python3 viz/scripts/build_graph.py`, and merge. `/setup` picks it up within a day of the merge with no change in my-portfolio.

**Lab content.** Regenerate `content/corvid-snapshot.json` from kazi_lab and commit it in my-portfolio. Never hand-edit it.

## Guide facts must match the site

The birds' prompt says facts must match the site exactly, and the tone rules (no boasting about Armaan, jokes only at the birds' expense) are in the route. Anything you add to `content/` becomes something the birds can say. A placeholder, a simulated number, or a hidden `summary` in `work.ts` that overstates finished work will be repeated to visitors as fact. Check new content for that before merging.

## Check

1. `npx tsc --noEmit` and `npm run build` in my-portfolio (its CLAUDE.md; there are no tests).
2. Grep for the slug or name you changed across `content/`, `src/`, and the other two repos, and account for every hit.
3. With `screenshot-proof`, shoot `/`, the changed page, and one page from each other section at desktop and phone. Confirm the header shows All sites and the right section name, and that the birds are present.
4. If the guide should know about the change, ask it locally (`/api/guide`, needs `ANTHROPIC_API_KEY`). If there is no key in the session, say the guide was not tested; do not infer it from `knowledge.ts`.
5. Update project memory (`site-home-buttons` and related notes) and my-portfolio's `CLAUDE.md` when the map above changes.
