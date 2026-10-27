# Research Eval

A Claude plugin with two portable skills: review completed paper drafts, or research and evaluate proposals before doing the full study. Both assess the intended conference, workshop, or journal with evidence-based comments and prioritized next steps.

The skills aim to reduce bias through explicit criteria, identity-independent judgment, and evidence-grounded comments. They cannot guarantee an unbiased result or predict a real acceptance decision.

## Use in Claude Code

From this repository, launch:

```sh
claude --plugin-dir .
```

Then invoke the skill inside Claude Code:

```text
/research-eval:review-paper Review ./draft.pdf for <venue, year, and track>. Use the official reviewer guide at <URL>.
```

Replace the angle-bracket fields with the actual target. The review guide is optional; the skill looks for public official guidance when browsing is available. You can also supply a local call for papers or review form.

```text
/research-eval:review-paper Review ./paper.tex for the attached workshop call. The appendix and bibliography are in the same folder. Focus on the current draft's readiness for submission.
```

For a downloaded plugin archive, extract `dist/research-eval-plugin.zip` and launch `claude --plugin-dir /path/to/research-eval`. The path must point to the extracted directory containing `.claude-plugin/` and `skills/`.

For standalone personal skills instead, copy either skill folder from `skills/` into `~/.claude/skills/` and invoke `/review-paper` or `/review-proposal`. Choose one installation method to avoid duplicate skill discovery. These paths and invocation conventions follow [Claude Code's skills documentation](https://code.claude.com/docs/en/skills) and [plugin creation documentation](https://code.claude.com/docs/en/plugins/create).

## Research proposals and ideas

```text
/research-eval:review-proposal Review ./proposal.md for <venue, year, and track>. Research the closest related work, check whether the main contribution has already been done, and identify the nuance and minimum study that could make it worthwhile.
```

A short idea is enough to start if the question and proposed approach are clear. A target venue helps but is optional for the literature search. You can also include preliminary results, a related-work list, resource constraints, or a historical novelty cutoff.

The proposal skill:

- Actively searches related work, including alternative terminology, neighboring fields, foundational papers, recent publications/preprints, and references or follow-ups of the closest work.
- Opens primary sources, verifies citations, and compares the research question, mechanism, assumptions, setting, and evidence. A similar title alone does not prove duplication.
- Produces a cited closest-work table and distinguishes direct precedent, partial overlap, a potentially differentiated contribution, and unresolved novelty.
- Gives a simulated **Strong accept → Strong reject** recommendation about pursuing the research plan, plus a separate conditional assessment of venue potential. It does not treat an idea as a finished paper.
- Explains what nuance would be scientifically meaningful, what claims to narrow, and whether an alternative is a clarification, new work, or a genuine pivot. Proposed pivots receive a follow-up novelty check before endorsement.
- Proposes the smallest decisive study or analysis, the right comparison/control, and evidence that would support or falsify the story.
- Reports actual searches, sources inspected, publication status, access limits, and confidence. Browsing or scholarly-search tools are needed for fresh related-work research; without them it gives a visibly provisional assessment and leaves novelty unresolved.

No bounded search proves that an idea has never been tried. The skill distinguishes "no close precedent found within this search" from "not searched," and novelty from importance. It uses public scientific concepts in searches and keeps proposal text and private details out of external search queries.

## Use in Claude chat

Upload [dist/review-paper.zip](dist/review-paper.zip) or [dist/review-proposal.zip](dist/review-proposal.zip) through **Customize → Skills → + → Create skill → Upload a skill**, enable it, then attach the draft or proposal and name the target venue if known. See [Anthropic's skill upload instructions](https://support.claude.com/en/articles/12512180-use-skills-in-claude) for availability and setup requirements. Example paper-review request:

```text
Review the attached draft for <journal and article type>. Give a candid recommendation, reviewer comments, and the changes that would most affect the decision. The journal's scope and review criteria are attached.
```

For a proposal, ask: "Research whether this idea has been done before, compare the closest papers, and assess what contribution and study would make it worthwhile for my target venue."

The same source skills work in both formats. They require no API keys, hooks, MCP servers, or custom executable runtime. Reading PDFs and researching public papers/guidance use the tools available in your Claude environment; if those capabilities are unavailable, the review reports the limitations.

## What a review contains

- A verified venue-native recommendation when available. Otherwise: **Strong accept, Accept, Weak accept, Weak reject, Reject, or Strong reject** using the included fallback definitions.
- For journal workflows, an editorial recommendation such as major revision kept separate from the simulated accept/reject judgment.
- A neutral summary, applicable quality dimensions, specific strengths and weaknesses, and questions for the authors.
- Evidence locations, concern severity, confidence, and an ordered revision plan.
- A coverage note and sources for venue criteria. An abstract-only or materially unreadable draft gets **Insufficient information**, with a partial assessment instead of a fabricated paper-level verdict.

The reviewer does not use author prestige as evidence, force positive/negative comment quotas, invent citations or numerical acceptance probabilities, or send draft content to public search engines. Novelty judgments remain qualified unless the relevant literature was actually checked. It reviews the draft as submitted and does not modify it.

## Build and validate

Python 3.9+ builds one standalone ZIP per skill and the combined plugin ZIP with the standard library:

```sh
python3 scripts/package.py
claude plugin validate . --strict
```

The packager includes only explicitly listed release files, so unrelated manuscripts, evaluation outputs, credentials, and Git history stay out of the archives. Rebuild after changing the skill, references, manifest, or this README. The plugin archive contains the README for usage; its references to the repository's `dist/` and development scripts apply to the full source checkout.

[evals/behavioral-cases.md](evals/behavioral-cases.md) provides paper-review behavioral checks. [evals/proposal-cases.md](evals/proposal-cases.md) covers renamed prior work, partial overlap, useful combinations, research access failures, conditional venue judgments, and novelty checks for pivots. Manifest/archive validation checks packaging, not review quality. Behavioral cases require actual model runs and human assessment; they are not claimed to pass merely because the plugin validates.

## Source layout

```text
.claude-plugin/plugin.json          Claude Code plugin manifest
skills/review-paper/SKILL.md        Completed-paper review workflow
skills/review-paper/references/     Paper rubric and report format
skills/review-proposal/SKILL.md     Proposal review and related-work research
skills/review-proposal/references/  Search workflow, rubric, report format
scripts/package.py                 Build the three distribution archives
evals/behavioral-cases.md           Behavioral evaluation cases
evals/proposal-cases.md             Proposal evaluation cases
dist/review-paper.zip               Uploadable standalone Claude skill
dist/review-proposal.zip            Uploadable standalone Claude skill
dist/research-eval-plugin.zip       Extractable Claude Code plugin
```
