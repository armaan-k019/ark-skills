---
name: query-to-corpus
description: Encodes how a user's research question becomes a seeded, relevance-filtered, contamination-guarded corpus, the front of this cross-domain research discovery engine's pipeline. Use this skill whenever building, reviewing, or modifying anything that turns a user question into a paper corpus, expands a corpus via citation graphs or search, filters candidate papers before ingestion, or checks a corpus for coherence or contamination. Make sure to consult this skill before implementing any paper ingestion step, before adding any keyword-based search or scrape, before relaxing a relevance filter to hit a size target, and whenever a request implies expanding a corpus quickly without specifying how candidates are verified.
---

# Query to Corpus

## The flow

A user arrives with a research question, not a corpus. Turning that question into a working corpus follows a specific sequence, and the order matters:

1. **Identify the relevant fields and literatures the question spans.** A cross-domain question implies at least two fields; name them explicitly before searching for anything.
2. **Seed with verified papers.** Start from a small set of papers that are actually confirmed to exist and actually confirmed to be relevant to the identified fields. This seed set is the foundation everything else is built from; if it is shaky, everything downstream inherits the shakiness.
3. **Expand via the citation graph.** Grow the corpus outward from the verified seeds by following actual citation links, not by searching for more papers that merely sound related.
4. **Relevance-filter every candidate before ingestion.** Every paper the citation graph surfaces is a candidate, not a member. It has to clear a relevance bar before it is added to the corpus.

Each step depends on the one before it. A citation-graph expansion is only as trustworthy as the seeds it started from, and a filtered corpus is only as coherent as the expansion that produced its candidates.

## The contamination guard

This is the hard-won lesson behind this whole skill, so treat it as law: **never build a corpus with a loose keyword scrape.**

A keyword search finds papers that mention the right words. It does not find papers that are actually connected to the question, the seed set, or each other. The two are not the same thing, and the gap between them is exactly where contamination comes from.

Every candidate paper must satisfy both of the following before it is allowed into the corpus, or it is skipped and the skip is reported:

- **Reached through the citation graph from a verified seed.** The candidate has an actual citation path back to a paper that was verified to exist and verified to be relevant. A paper that turned up via keyword match alone, with no such path, does not qualify no matter how relevant it looks on its face.
- **Passes a real relevance bar.** This means genuine field-fit and genuine connectivity to the existing corpus, not a single weak edge (one incidental citation, one shared keyword, one tangential reference). A paper that clears the citation-graph requirement by a single thin link is still a contamination risk and should be evaluated on the strength of that connection, not just its existence.

Why this matters as much as it does: a handful of weakly-connected, off-topic papers do not just add a little noise. They silently corrupt everything built on top of the corpus afterward. Cross-domain connections get proposed between fields that are only "connected" because one mis-included paper happens to bridge them. Distance calculations get skewed. The Critic ends up adjudicating claims that were never real questions to begin with, because the corpus itself smuggled in a false bridge. This is why the filter is not a nice-to-have quality step; it is the thing standing between the engine and discovering connections that only exist because of a data error.

## Quality over count

Corpus size targets are ceilings, not quotas. If a target says "up to 200 papers" and the relevance-filtered expansion only turns up 60 that genuinely clear the bar, the corpus has 60 papers. Do not relax the relevance bar, widen the citation-graph radius past what is defensible, or fall back to keyword search to close the gap between 60 and 200.

When the corpus falls short of a size target, report the shortfall honestly, along with why: "the citation graph from these seeds only reached 60 papers meeting the relevance bar" is a useful, actionable statement. Quietly padding the corpus to hit a number, or reporting 200 papers without noting that 140 of them are weaker than the rest, trades a visible shortfall for an invisible contamination problem. See `honest-refusal` for why reporting the shortfall plainly is the correct move, not a failure to be smoothed over.

## No fabricated papers or IDs

A paper that cannot be resolved (an ID that does not verify, a citation that cannot be tracked to a real source, a reference that turns out to be a hallucination) is skipped and reported as skipped. It is never invented to fill a gap, and it is never force-fetched or guessed into existence because the pipeline expected something to be there. An unresolvable candidate is exactly that: unresolved. Treat it the same way an unverifiable evidence claim is treated elsewhere in this engine, as something that gets dropped, not softened into a best guess.

## Coherence check

Building the corpus is not the last step. After construction, verify that the corpus actually stayed coherent, meaning the communities and fields represented in it have not drifted away from what the original question called for. A corpus that started as "field X and field Y" but has quietly accumulated a third, unrelated cluster of papers through the expansion process is a sign the filter let something through it should not have.

This coherence and contamination check is a required deliverable of building a corpus, not an optional extra step to run if there is time. Report what the check found, including if it found nothing wrong; a clean coherence check is itself useful information for anyone relying on the corpus downstream.
