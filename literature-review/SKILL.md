---
name: literature-review
description: Find, screen, synthesize, and cite a body of academic or technical literature with a logged, reproducible search and verified citations. Use for a paper's related-work or background section, a research proposal or fellowship statement, mapping prior work before starting a research project, precedent research in architecture and computational design, or any request like "what's the literature on X", "find papers on", or "write the related work".
---

# Literature Review

A literature review is only as trustworthy as its weakest citation. The failure this skill exists to prevent is the confident paragraph citing a paper that does not exist, or a real paper for a claim it never makes.

Adapted from the `literature-review` skill distributed in ECC (MIT, see `licenses/ECC-LICENSE`), with sources for architecture and computational design added and the citation rules tightened.

## Hard rules

- **Never cite a source you have not located.** Every reference must resolve: a DOI, arXiv ID, a proceedings or publisher page, or a PDF you actually read. No reference is ever written from memory.
- **Never attribute a claim you have not read in the source.** An abstract supports only what the abstract says. If you only read the abstract, say so in the evidence log.
- **Unverifiable means dropped.** If a citation cannot be confirmed, remove it and the claim that depends on it, and list it under "could not verify". Do not soften it into "some studies suggest".
- **Label source types.** Preprint, peer-reviewed paper, conference proceedings, review article, book, thesis, standard, or grey literature.
- **Report conflicting and negative findings.** Omitting them is a form of fabrication.

## 1. Define the question and the review type

Turn the request into a searchable question. For technical and design work:

- domain or system (for example: timber mass-housing, shape grammars, embodied carbon in facades)
- method or intervention
- comparison baseline
- evaluation measure or outcome

Choose the rigor level and state it:

- **Narrative:** orientation; broad and selective. Fine for a background section.
- **Scoping:** maps concepts, methods, and gaps. Default for starting a research project.
- **Systematic:** predefined protocol, reproducible search, logged exclusions. Required before claiming "no prior work has done X".

## 2. Plan the search before searching

Write the protocol: databases, date range, languages, publication types, inclusion and exclusion criteria, and exact search strings.

Sources to consider:

- **CS, ML, computation:** arXiv, Semantic Scholar, ACM Digital Library, IEEE Xplore, Google Scholar.
- **Architecture and computational design:** CumInCAD (CAADRIA, eCAADe, ACADIA, SIGraDi, ASCAAD, CAAD Futures proceedings), the relevant society's proceedings site, Environment and Planning B, Automation in Construction, Building and Environment, Design Studies.
- **Environment-behavior and health design:** EDRA proceedings, Environment and Behavior, HERD, Journal of Environmental Psychology.
- **Broad discovery:** Semantic Scholar, Crossref, Google Scholar (use citation chaining: who cites a key paper, and whom it cites).
- **Standards and grey literature:** standards bodies, government reports, official technical documentation. Label these as grey literature.

## 3. Search and log

Keep a search log so the review is reproducible:

```markdown
| Source | Date searched | Query | Filters | Results | Kept after screening |
|---|---|---|---|---:|---:|
| CumInCAD | 2026-09-21 | "shape grammar" AND "machine learning" | 2015-2026 | 41 | 9 |
```

Save identifiers (DOI, arXiv ID, URL) and notes separately from the prose.

## 4. Deduplicate, then screen

Deduplicate by DOI, then arXiv ID, then exact title, then normalized title plus first author and year. Screen in three passes: title, abstract, full text. For scoping and systematic reviews, record exclusion reasons (off-topic, wrong method, not primary research, duplicate, full text unavailable, outside date range).

## 5. Extract into a table

```markdown
| Source | Type | Data / corpus / site | Method | Baseline | Measure | Key finding | Limitations | Read level |
|---|---|---|---|---|---|---|---|---|
| Author Year | proceedings | ... | ... | ... | ... | ... | ... | full text / abstract only |
```

## 6. Synthesize by theme, not paper by paper

Group evidence into themes and, within each theme, state:

- strongest evidence and where it agrees
- where sources conflict, and the likely reason (method, dataset, context)
- methodological weaknesses common to the theme
- the gap: what is not yet shown, stated precisely enough to motivate the work

Grade claims:

- **High confidence:** replicated, strong methods, multiple independent sources.
- **Medium:** plausible but limited by sample, method, context, or recency.
- **Low:** single source, early, speculative, or weakly measured.

## 7. Verify every citation before finishing

For each reference: confirm it resolves, confirm authors, year, and venue, confirm the specific claim appears in the source, and confirm the type label. Fix citation metadata from the source page, never from memory. Use the citation style the venue requires.

## Output

```markdown
# Literature Review: <topic>

Review type: narrative | scoping | systematic
Search window: <dates>   Sources: <list>

## Research question
## Search strategy
## Inclusion and exclusion criteria
## Evidence summary (table)
## Thematic synthesis
## Gaps and limitations of this review
## Could not verify
## References
## Search log
```

The "Gaps and limitations of this review" section is required: which databases were not searched, what was read only at abstract level, and what language or date limits apply.
