# Recommendation and evaluation rubric

Use verified venue criteria in preference to this fallback. This rubric defines simulated judgments; it does not assert any venue's official standards.

## Fallback recommendation scale

| Label | Anchor for the current draft |
| --- | --- |
| Strong accept | Compelling, well-supported contribution that clearly exceeds the applicable bar; remaining issues do not threaten the principal claims. Exceptional does not require flawless. |
| Accept | Meets the applicable bar with a sound and useful contribution; limitations are compatible with its claims and scope. |
| Weak accept | Narrowly above the bar. Identifiable strengths outweigh bounded concerns; no unresolved flaw defeats a central claim. State what makes this a close call. |
| Weak reject | Narrowly below the bar. A promising contribution has specific consequential gaps, and current evidence does not yet justify acceptance. State what evidence or clarification could change the judgment. |
| Reject | Below the bar because of substantial shortcomings in support, contribution, or documented fit. The shortcomings are more than a marginal concern. |
| Strong reject | Far below the bar because of a clearly evidenced fundamental failure or pervasive deficiencies. Reserve for a well-substantiated case; an unreadable file, missing supplement, or personal dislike does not qualify. |

**Insufficient information** is an abstention outside this ordinal scale. Use it when the available material cannot support a paper-level recommendation. It is not a rejection.

A rating is a holistic judgment of the paper relative to the stated criteria. Do not enforce a quota, model an acceptance rate, compute a weighted average, or require every dimension to be exceptional. A decisive validity flaw may outweigh a novel idea; a small but rigorous contribution may be appropriate for a replication, resource, or workshop track.

## Native scales and editorial decisions

- Reproduce a verified official label and its definition faithfully. Do not reinterpret a native numeric score as if it belonged to this rubric. If an official borderline category exists, it can be used; there is no need to force it into weak accept or weak reject.
- If the official form uses several judgments rather than one overall score, report the actual fields and separately label any requested simulated overall recommendation.
- For journals, report the verified editorial options if available (for example accept, minor revision, major revision, reject, or reject and resubmit). If unverified, mark these as generic editorial terms. A revision decision is not mechanically equivalent to weak reject, nor is a strong eventual publication prospect acceptance of the current draft.
- When reporting a journal decision and the simulated accept/reject scale together, explain the difference: a journal may permit substantive revision while the current draft remains below the acceptance bar.
- Separate technical merit, venue fit, and administrative compliance. Flag a verified possible desk-rejection issue separately; do not claim to know the editor's action or let formatting determine the technical-quality assessment.

## Dimension judgments

Unless the venue supplies a dimension scale, use **Strong**, **Adequate**, **Concern**, **Critical concern**, or **Not assessed / Not applicable**, with a brief evidence-based reason for each dimension you report. These labels are diagnostic, not an invented official review form. Use the dimensions in SKILL.md that actually apply; do not require experiments for a theory or position paper simply to fill a row.

| Issue severity | Meaning |
| --- | --- |
| Decision-critical | Changes whether a central claim or essential venue criterion is supported. Can independently change the recommendation; explain the dependency. |
| Substantial | Materially affects trust, interpretation, or value, but is not alone shown to overturn the central result. |
| Minor | Local correction or presentation improvement without a material effect on the principal conclusions. |

Missing evidence warrants a concern only when that evidence is necessary for the claim or required by the venue. Separate an empirical counterexample from a plausible risk, and a disputed assumption from a demonstrated contradiction.

## Review confidence

- **High:** full relevant material was accessible, the core methods were assessable, and the decisive judgments are supported. State any verification limits even with high confidence.
- **Moderate:** meaningful review was possible, with specific gaps in access, specialist verification, literature checking, or venue calibration.
- **Low:** important uncertainty limits the recommendation; name the uncertainty. Abstain instead if the information is too incomplete for a defensible verdict.

Do not claim proof verification, statistical reanalysis, code execution, data inspection, or exhaustive literature coverage unless it actually occurred. Confidence is independent of the direction or strength of the recommendation. Avoid unsupported numeric probabilities.

## Calibrating criticism

Weak: "Needs more experiments."

Useful: "The conclusion claims transfer to unseen hospitals, but Section 4 reports only a random record split within one hospital. This split does not establish cross-hospital transfer. Provide a held-out-hospital evaluation or narrow the conclusion to within-hospital performance. Decision-critical for the transfer claim."

Weak: "The method is not novel."

Useful: "Section 2 describes a combination of established components, but Section 4's controlled comparison isolates a useful effect of that combination. Judge that demonstrated effect against the track's contribution criteria. A stronger claim that the combination is unprecedented would need a verified literature comparison."

Weak: "No public code; reject."

Useful: "Section 3 omits the selection procedure for the reported model. This prevents assessing whether the test set influenced tuning. Clarify the selection protocol. Treat code availability separately according to verified venue requirements."
