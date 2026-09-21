---
name: decision-records
description: Record significant technical or design decisions as short decision records (context, decision, alternatives rejected, consequences) in docs/decisions/, and answer "why did we do X" from them. Use when choosing between real alternatives (framework, library, data model, algorithm, API shape, storage, hosting), when the user says "let's go with", "we decided", or "record this", during the plan phase of a large task, or when asked why the codebase is the way it is.
---

# Decision Records

Months later, the code shows what was chosen but not why, or what was rejected. A decision record is a two-minute read that answers that, stored next to the code.

Adapted from ECC's `architecture-decision-records` skill (MIT, see `licenses/ECC-LICENSE`), which uses Michael Nygard's lightweight ADR format.

## Rules

- **Ask before creating anything.** If `docs/decisions/` does not exist, ask the user before creating it. Present each draft record and write it only after the user approves.
- **Record only what was actually decided and actually considered.** Do not invent alternatives to make a record look thorough, and do not invent reasons the user did not give. If the rationale is unknown, write "Rationale not recorded" rather than guessing.
- **Backfilled records say so.** When recording a past decision, mark it "Backfilled on <date>; original decision around <date or unknown>".
- Skip trivial choices (naming, formatting, one-off config values).

## What is worth a record

Framework, language, or major library choices; data model or schema design; algorithm or data structure choices with performance trade-offs; API shape; storage, hosting, and deployment; auth and secret handling; test strategy; anything the user argued about or reversed.

## Format

File: `docs/decisions/NNNN-short-title.md` (next number after the highest existing one).

```markdown
# NNNN: <decision title>

Date: YYYY-MM-DD
Status: proposed | accepted | deprecated | superseded by NNNN
Deciders: <who>

## Context
<2 to 5 sentences: the problem, constraints, and forces at play>

## Decision
<1 to 3 sentences, present tense: "We use X for Y.">

## Alternatives considered
- <Alternative>: <why it was rejected>
- <Alternative>: <why it was rejected>

## Consequences
- Easier: <...>
- Harder: <...>
- Risks: <risk and mitigation, if any>
```

Keep Context under 10 lines. If it is longer, it is an essay, not a record.

Maintain an index at `docs/decisions/README.md`:

```markdown
| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-short-title.md) | ... | accepted | 2026-09-21 |
```

## Lifecycle

`proposed` -> `accepted` -> `deprecated` or `superseded by NNNN`. Never delete or rewrite an accepted record to reflect a new choice; write a new record and mark the old one superseded, linking both ways.

## Answering "why did we do X?"

1. Look in `docs/decisions/README.md` for a matching entry and read the record.
2. Answer from its Context and Decision sections, citing the record number.
3. If there is no record, say so plainly, then offer to backfill one from what the user remembers. Do not reconstruct a rationale from the code and present it as the original reason.
