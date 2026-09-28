# 0001: Use Cytoscape.js for the skills graph page

Date: 2026-09-28
Status: accepted
Deciders: the unattended skills-graph session, under STANDING-DECISIONS.md (the run prompt delegated the choice between Cytoscape.js and React Flow and asked for this record)

## Context
viz/ needs a static page that renders the generated graph (30 nodes, 36 edges today), clusters nodes by family, filters by family, and shows node details on click. The run allows exactly one runtime dependency, the chosen graph library, plus a dev-only Playwright; any other dependency is a stop-and-ask. The page is served as plain files by `python3 -m http.server`, with no build step.

## Decision
We use Cytoscape.js 3.34.3, vendored as `viz/vendor/cytoscape.min.js` with its MIT license in `viz/vendor/cytoscape-LICENSE`, loaded by a plain script tag. Families are compound parent nodes. Each family is placed in its own cell, sized by member count, and its members are laid out inside the cell with Cytoscape's built-in `grid` layout, animation off. (The built-in `cose` layout was tried first; review gate 2 showed it let family boxes overlap.)

## Alternatives considered
- React Flow: rejected because it is a React component library, so the page would also need React and ReactDOM, which are dependencies beyond the graph library, and a build step or module import setup for a page that is otherwise plain files.

## Consequences
- Easier: one self-contained file with no runtime dependencies (the registry metadata for 3.34.3 lists none); works offline; compound nodes express families directly; `window.cy` gives the smoke test the model's node and edge counts, the family bounding boxes, and each node's drawn position for a real click.
- Harder: the vendored file is updated by hand. Provenance for this copy: tarball https://registry.npmjs.org/cytoscape/-/cytoscape-3.34.3.tgz, registry integrity sha512-yfYGhRcGAntq6YBD583j4n0Eg3jIxvWmZtz/5uz9UYkeIStSlMxuUja+ec5j3iBD8nv1rwaOAYMW09tBdkSeaQ==, matched before extraction; sha256 of the extracted cytoscape.min.js 5f3b5b529546d5af1fc5628590af033b74511a5b6f789f5f4682845863228b91.
- Risks: the page renders to a canvas, so tests cannot count nodes in the DOM; they read `window.cy`, which is Cytoscape's model of what it drew, not a pixel check. The smoke test's screenshot is the visual check.
