---
name: relevance-profile
description: Defines the multi-axis relevance profile that this cross-domain research discovery engine reports for every candidate connection. Use this skill whenever building, reviewing, or modifying anything that scores, ranks, filters, or summarizes cross-domain connections, including the Critic's output, the Experimentalist's output, any dashboard or report surface, or any code that computes a "relevance" or "quality" value for a connection. Make sure to consult this skill before adding any new scoring field, before combining existing scores, and before designing how a researcher filters or sorts connections, even if the request just says "add a score" or "rank these by relevance."
---

# The Relevance Profile

## The core principle

A cross-domain connection does not have one quality. It has several, and they do not move together.

Think about what actually varies independently when two fields get linked:

- How strong is the evidence under each leg of the claim (grounding)?
- How far apart were the two fields to begin with (distance)?
- Did the claim survive someone actively trying to break it (survival)?
- Can it be turned into an experiment someone could actually run (actionability)?
- Has the citation graph already linked the two bodies of evidence (bridging)?

A connection can be extremely well grounded but obvious (low distance, both papers already in the same subfield). A connection can be startlingly distant but built on one shaky citation (low grounding). A connection can survive adversarial review on three of four legs and collapse on the fourth. None of these facts is captured by, or recoverable from, a single number.

If you average or sum these into one score, two things go wrong at once:

1. **It hides the truth.** A 0.7 "relevance score" could mean "solidly grounded, moderately distant, fully survived, easy to test" or it could mean "weakly grounded but wildly distant, half-survived, no clear test." A researcher reading a single number cannot tell these apart, and the difference is exactly what they need to decide whether to spend a week on it.
2. **It hands a gameable knob to the search process.** Once there is one number to maximize, anything that pushes the number up looks like progress, whether or not it is real. A weak-but-broad connection (touches many things thinly) can average out to the same score as a strong-but-narrow one. Optimizing against a blended score quietly steers the whole engine toward whatever inflates the average, not toward what is actually worth a researcher's time.

Averaging is not a rounding error here. It is the mechanism by which a system optimized to look good stops being honest. This engine's whole value proposition rests on refusing that shortcut. See `honest-refusal` for the broader discipline this profile is one instance of.

## The five axes

Report these side by side, always. Never compute an extra number from them.

### 1. Grounding (per-leg)

**What it measures:** how strong the real evidence is under each individual leg of the connection.

**Why per-leg matters:** a connection typically has multiple legs (e.g., "concept A in field X relates to concept B in field Y via mechanism M" might rest on separate claims about A, about B, and about M). If you average grounding across legs, a connection with one rock-solid leg and one fabricated-sounding leg reports as "medium," which is a lie. Report each leg's grounding on its own, so the weak link stays visible. A profile that shows "leg 1: grounded, leg 2: overreach" is doing its job; a profile that shows "grounding: 0.6" is hiding the one thing the researcher most needs to know.

**How it is computed:** this reuses existing engine output. The Critic already produces a grounding verdict per leg (grounded / partially-grounded / overreach) along with a count of supporting papers per leg. This axis is a direct surface of that existing verdict, not a new computation. When implementing, resist the urge to collapse the per-leg verdicts into a single grounding score for the profile; that would reintroduce the exact averaging problem this skill exists to prevent.

### 2. Distance

**What it measures:** how genuinely far apart the two fields or communities are.

**Why it matters:** distance is what makes a connection non-obvious. A connection between two subfields that already cite each other constantly is not a discovery, no matter how well grounded it is. High distance is the raw material of surprise; without it, grounding alone just measures how well-cited an unremarkable statement is.

**How it is computed:** this reuses existing engine output. Distance already exists as the distance-forcing factor used elsewhere in the engine (embedding distance between communities and/or differing fields of study). Surface that existing value directly as its own axis rather than recomputing it.

### 3. Survival

**What it measures:** whether the connection withstood someone actively trying to destroy it, and how much of it survived.

**Why it matters:** a connection that has never been challenged is an unverified claim wearing the costume of a finding. Survival is what separates "a plausible-sounding link the search process produced" from "a link that held up when a skeptic tried to take it apart." Report survival per connection as a count or fraction of legs/claims that survived adversarial cross-examination, not a single pass/fail.

**How it is computed, honestly:** the raw material for this exists today. The Critic already produces cross-domain verdicts per claim (confirmed / promoted / demoted / rejected). What does not yet exist is the wiring that rolls those per-claim verdicts up into a per-connection survival axis on the profile. This is light new wiring, not a new judgment call, but it has not been built yet. Do not report a survival axis that is actually just restating grounding, and do not fabricate a survival value if the rollup has not been implemented; say plainly that survival is pending wiring rather than inventing a number.

### 4. Actionability

**What it measures:** whether the connection can be turned into a testable experiment design. Note precisely what this does *not* measure: it is not asking whether the experiment could actually be run (funding, equipment, time), only whether a coherent, falsifiable experiment design exists in principle.

**Why it matters:** a connection that cannot be turned into any concrete test is speculation, however well-grounded and however distant. Actionability is what turns "interesting fact" into "thing a researcher can act on this week."

**How it is computed, honestly:** this is new computation this project adds, not a reuse. The Experimentalist can already design experiment specs for a connection, but the engine does not currently surface a yes/no (or graded) actionability axis on the relevance profile derived from that capability. Flag this clearly as new work whenever it comes up in planning or implementation; do not describe it as "already there" or as a minor extension of existing Experimentalist output.

### 5. Bridging

**What it measures:** whether the citation graph already links the evidence on one side of the connection to the evidence on the other. Three statuses, never a number:

- **established**: some paper cites evidence papers from both sides, or one side's evidence paper cites the other side's, or the two sides share an evidence paper. The bridging papers are listed by name.
- **open**: no bridging paper was found, and the search was complete: every evidence paper resolved to a citation-database record, and every one of their citing-paper lists was fetched to the end with no shortfall against the database's own count. The record states exactly what was searched (which evidence papers, how many citing papers each).
- **unknown**: no bridging paper was found, but some part of the search was incomplete (a paper did not resolve, a lookup failed or was rate-limited, a list was truncated, or fewer citing papers came back than the database reports). Never reported as open.

**Why it matters:** a connection whose two sides already cite each other, or are co-cited by the same papers, is probably known to at least part of the literature, however well grounded and however distant it looks. Query 53e163c2 showed the failure this axis exists to catch: both surviving connections were already stated by papers in the corpus, and nothing in the other four axes could tell.

**How it is computed, honestly:** this is new computation (Phase 10), from Semantic Scholar citation data only, with no LLM call. Two limits are part of the definition, not footnotes. First, established means linked in the citation graph, not that a paper states the claim: co-citation is weaker than a statement, and it is reported as exactly that. Second, open covers only the citation lists that were searched; it is never a claim that nobody has made the connection anywhere. A bridge found in a partial search still counts as established (positive evidence stands), and the record says the search was partial.

## Hard rules

- **Never collapse the axes.** Always display grounding (per-leg), distance, survival, actionability, and bridging side by side. Never sum, average, weight, or otherwise combine them into a single relevance score, ranking number, or star rating. If a consumer of the profile (a UI, a report, a downstream filter) seems to need one number, that is a sign the consumer's design is wrong, not a reason to compute one.
- **The no is as loud as the yes.** A connection that lost two of its legs to the Critic must report low survival, prominently, as a primary product of the profile, not as a footnote or a small red icon buried under a headline score. The engine's job includes surfacing failure clearly; a profile that makes bad connections look tolerable has failed at its one job.
- **Incomplete is not negative.** A search that could not finish reports unknown, never open. The same holds for every axis: "the call failed" and "found nothing" are different results and must stay different in the profile.
- **Every value must trace to real computation.** No axis may be estimated, guessed, defaulted, or fabricated to fill in a gap. If survival has not been wired up yet, or actionability has not been implemented, the profile must say so explicitly rather than showing a plausible-looking placeholder value. A missing axis reported as missing is honest; a missing axis reported as a number is a fabrication, and fabrication is the one thing this engine exists to never do.

## The steering principle

The axes are not just a report, they are the controls. A researcher steers discovery by filtering and sorting on these independent dimensions: "show me high-grounding, high-distance, hard connections," or "hide anything low-distance, that's too obvious to be interesting," or "just show me what's actionable regardless of distance," or "only connections whose bridging is open or unknown." Because the axes stay separate, a researcher can express exactly the tradeoff they want instead of hoping a blended score happens to reflect their priorities. Design any UI, filter, or sort feature around this: expose the axes as independent filter/sort dimensions, not as inputs into a computed rank.

## Still excluded: novelty (and why bridging is not novelty under another name)

It is tempting to add an axis that answers "has this specific bridge already been made in the literature?" with a yes or a "novel!". That axis stays excluded.

The reason is structural. Proving a negative like "no one has connected these two things before" requires either an exhaustive search of all relevant literature (which no engine can actually do) or a confident-sounding heuristic standing in for that search. A "novel!" claim built on an incomplete search is exactly the kind of overclaim this engine exists to refuse; it fabricates certainty about an absence.

Bridging is the honestly bounded measurement this section used to ask for. It is honest where novelty was not because:

- **It is falsifiable.** Established names specific bridging papers anyone can check. Open names the exact evidence papers and the exact number of citing papers checked, so anyone can rerun the same search and get the same answer or find the gap.
- **It never asserts an absence beyond its search.** Open means "no bridging paper found in the citation graph searched", not "novel". Its reason text says so on every row.
- **It separates "did not find" from "could not look".** Any incomplete search is unknown, never open, so a rate-limited lookup can never masquerade as a discovery.
- **Its positive result is conservative.** Established requires a concrete citation link; it never infers a bridge from similar wording.

Do not describe a connection as "novel" on the strength of an open bridging status, do not let a novelty-flavored score slip into the profile under another name, and do not round unknown up to open.
