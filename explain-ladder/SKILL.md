---
name: explain-ladder
description: Explain a concept by climbing a ladder of rungs, from an ELI5 version to analogies, then real terms, then the mechanism, then full depth, pausing after the analogy rung so the reader chooses how deep to go. Use this skill when asked to "eli5", "explain X", "explain X simply", "help me understand X", "what is X", "how does X work", "I don't get X", or "teach me X", and whenever a concept needs teaching rather than a one-line answer.
---

# Explain Ladder

People understand a concept fastest when it arrives in layers: the simplest true version first, then a familiar picture, then the real vocabulary, then how it actually works, then the full technical treatment. Each rung builds on the one below it, so no rung should need a word or idea that a lower rung has not introduced.

This skill is a base that other skills can build on (a study mode, a code walkthrough, a paper explainer). Keep the rungs, their names, and their order stable so those skills can refer to them by number.

## The rungs

| Rung | Name | What it does |
|------|------|--------------|
| 1 | ELI5 | The simplest true version, in one short paragraph, with no jargon. |
| 2 | Analogy | One or two everyday analogies, each followed by where it breaks. |
| 3 | Real names | The actual terms, each mapped to the part of the analogy it replaces. |
| 4 | Mechanism | How it actually works, step by step, with one small worked example. |
| 5 | Full depth | Formal definitions, math or code, edge cases, tradeoffs, and sources. |

### Rung 1: ELI5

- At most five sentences. Words a curious ten-year-old knows.
- Simple, not wrong. Leave details out, but never say something a higher rung will have to take back. "Your computer asks a phone book for the address" is a fine first rung for DNS; "the internet looks up the website" with no lookup step is too vague to build on.
- Say what the thing is for before saying what it is.

### Rung 2: Analogy

- One analogy, or two when they show different sides of the concept. Never more than two.
- Pick something from daily life (kitchens, mail, traffic, libraries, plumbing), not from another technical field the reader may not know.
- After each analogy, add a line that starts with **Where it breaks:** and name the specific point where the analogy stops matching. This line is required. Analogies that are never qualified are where wrong mental models come from.

### Pause

Stop after rung 2. End with one short line offering the next rung, for example: "Want to go deeper? Next is the real terms and how they map onto this." Do not write rungs 3 to 5 until the reader asks.

Skip the pause and continue in the same answer only when:
- The reader asks for the whole ladder ("full ladder", "all the way", "go deep", "explain fully").
- The reader asks to start higher ("skip the ELI5", "I know the basics"). Start at the rung they name, or at rung 3 if they name none, and pause after that rung instead.

When the reader says "deeper", "more", "keep going", or "next", give the next single rung, then pause again. When they ask about something inside a rung, answer it at that rung's level before moving on.

### Rung 3: Real names

- Introduce the real vocabulary, a few terms at a time. Bold each term the first time it appears.
- Map each term to the analogy part it replaces: "The phone book is the **resolver**." A short two-column table works when there are more than three terms.
- Point out any term whose everyday meaning differs from its technical one.

### Rung 4: Mechanism

- Walk through how it works in order, as numbered steps.
- Include one small worked example with concrete values the reader could check by hand or run. Use a real command or snippet only if you are confident it runs as written; otherwise label it as illustrative.
- Name the one or two misconceptions people most often have at this level, and correct them.

### Rung 5: Full depth

- Formal definitions, the math or the code, edge cases, failure modes, and tradeoffs against alternatives.
- Cite sources for specific facts (a spec, a paper, official docs). If you cannot point to a source for a specific number, version, or claim, say it is unverified rather than stating it smoothly. A confident wrong detail at this rung undoes everything the lower rungs built.
- End with two or three pointers for going further (the primary spec, a canonical paper, the source file), only ones you are sure exist.

## Format

- Head each rung with its number and name, for example `### 2. Analogy`, so the reader can scan and other skills can point at a rung.
- Short paragraphs. No rung should be longer than the one above it by more than it needs to be; rung 1 is the shortest, rung 5 the longest.
- Never use em dashes. Use commas, periods, colons, or parentheses.

## Honesty rules

- Every rung must be true at its level of detail. Simplifying means leaving things out, not making things up.
- If the concept is contested or not well understood (an open research question, a disputed mechanism), say so at rung 1, not only at rung 5.
- If you do not know the concept well enough to reach rung 5 accurately, stop at the highest rung you can do honestly and say where your knowledge runs out.

## Example (rungs 1 and 2, then the pause)

**Concept:** a hash table.

### 1. ELI5
A hash table is a way to find things fast. Instead of searching every shelf, you use a rule that turns the thing's name into a shelf number, so you walk straight to the right shelf.

### 2. Analogy
A coat check. You hand over your coat and get a ticket with a number, and later the number takes the attendant straight to your hook without looking at every coat.
**Where it breaks:** at a coat check, the attendant picks the number. In a hash table, the number is computed from the item itself, so the same item always gets the same number, and two different items can end up with the same number (a collision).

Want to go deeper? Next is the real terms (hash function, bucket, collision) and how they map onto the coat check.
