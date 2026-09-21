---
name: scholar-evaluation
description: Evaluate a paper, abstract, proposal, thesis chapter, or literature review against a repeatable rubric, including checking whether each claim is supported by what its citation actually says. Use for pre-submission review of your own drafts (conference papers, abstracts, fellowship statements), reviewing others' papers, comparing papers, or requests like "review my paper", "is this ready to submit", or "how strong is this study".
---

# Scholar Evaluation

A score is not feedback. The output of this skill is a list of specific, located problems ranked by how much they threaten the work, with the scores as a summary.

Adapted from the `scholar-evaluation` skill distributed in ECC (MIT, see `licenses/ECC-LICENSE`), with a self-review mode and design-research methods added.

## Rules

- Every criticism points to a location (section, paragraph, figure, or line) and quotes or paraphrases the passage.
- Claim checks are real checks: open the cited source and confirm it says what the paper claims. If the source cannot be accessed, mark the claim "unchecked", not "supported".
- Do not judge quality by venue, citation count, or author reputation.
- Do not penalize a work for omitting something outside its stated scope.
- When reviewing the user's own draft, be as strict as an external reviewer would be. Kind but vague feedback is useless before a deadline.

## 1. Identify the artifact and the scope

Artifact type: empirical paper, design research paper, technical or systems paper, literature review, proposal or fellowship statement, abstract or short paper, thesis chapter.

Scope:

- **Comprehensive:** all rubric dimensions.
- **Targeted:** one or two dimensions (for example, only methods or only citations).
- **Comparative:** several works against the same rubric.
- **Pre-submission:** comprehensive, plus the venue's own call for papers and review criteria, and its formatting and length rules.

## 2. Read in this order

1. Abstract, introduction, figures, conclusion: what contribution is claimed?
2. Methods and results: does the evidence support that contribution?
3. The three to five strongest claims: check each against its cited source.
4. Everything else.

## 3. Score each applicable dimension (1 to 5, or N/A)

5 excellent, ready; 4 good, minor fixes; 3 adequate, meaningful gaps; 2 weak, substantial revision; 1 poor, validity or clarity problems.

1. **Problem and contribution.** Is the question specific? Does the claimed contribution match what the work actually does?
2. **Literature and context.** Relevant prior work covered and synthesized, not listed? Is the gap stated accurately?
3. **Method.** Does the method answer the question? Are choices justified? Could someone reproduce it? For design research (research through design, case study, prototype evaluation, parametric or generative studies): is the design process documented well enough to follow, are evaluation criteria stated before results, and is it clear what generalizes beyond the specific project?
4. **Data and evidence.** Sources credible and appropriate? Sample, corpus, or site coverage adequate? Selection and preprocessing documented?
5. **Analysis.** Appropriate methods, fair baselines, uncertainty or variance reported where results are noisy, alternative explanations considered?
6. **Results and interpretation.** Do claims stay inside the evidence? Are null or negative results reported honestly?
7. **Limitations.** Specific rather than generic? Speculation separated from demonstrated results?
8. **Writing and structure.** Argument easy to follow? Figures and tables readable on their own? Terms defined?
9. **Citations.** Claims supported by the sources attached to them? Primary sources where possible? Preprints labeled?

## 4. Separate blockers from revisions

- **Critical:** would cause rejection or makes a claim false (unsupported central claim, method cannot answer the question, missing baseline, citation that does not say what is claimed).
- **Major:** weakens the work substantially but is fixable in a revision.
- **Minor:** clarity, formatting, style.

## Output

```markdown
# Scholar Evaluation: <artifact>
Scope: comprehensive | targeted | comparative | pre-submission (<venue>)

## Overall
Score: <1-5>   Confidence in this review: high | medium | low
Summary: <3 to 5 sentences: the contribution, the main strength, the main threat>

## Dimension scores
| Dimension | Score | Evidence (location) | Priority |
|---|---:|---|---|

## Critical issues
1. <location>: <issue>. Why it matters: <...>. Fix: <...>

## Major revisions
## Minor revisions

## Claim checks
| Claim (location) | Cited source | Source says it? yes / no / partially / unchecked |
|---|---|---|

## Next edits, in order
```

For pre-submission reviews of high-stakes drafts, follow this with `adversarial-review` mode A using this rubric, so two independent reviewers check the same draft.
