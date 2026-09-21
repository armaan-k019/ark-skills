---
name: capture-lessons
description: At the end of a session or after a failure, extract transferable lessons (what went wrong, the root cause, and what to do next time) into a lessons file, merge duplicates, and promote repeated lessons into CLAUDE.md rules, hooks, or skills. Use after debugging something non-obvious, after a redo or rollback, when the user corrected Claude's approach, before ending a long session, or when asked "what did we learn", "log this", or "don't let this happen again".
---

# Capture Lessons

If the same problem costs time twice, the first time was not written down properly. This skill turns a session's mistakes and non-obvious fixes into short, reusable entries, and moves the ones that keep recurring into places Claude reads automatically.

Adapted from ECC's `growth-log` and `continuous-learning-v2` skills (MIT, see `licenses/ECC-LICENSE`). ECC's version records every tool call with hooks and a background agent; this version is deliberately manual and runs only when there is something worth learning.

## When there is nothing to capture

Skip trivial sessions: typo fixes, one-line changes, anything that worked first time with no decision involved. The test: did this involve debugging, a redo, a rollback, a user correction, or a non-obvious decision? If not, do nothing.

## What makes an entry worth keeping

1. **Failures over achievements.** "Implemented the login flow" teaches nothing. "Session cookie was dropped because SameSite defaulted to Lax across origins; set it explicitly" teaches something.
2. **Root cause, not symptom.** Ask why until you reach the mechanism, usually three to five times.
3. **Transferable.** Every entry must complete the sentence "Next time I see [signal], I will [action]." If it cannot, the pattern has not been extracted yet.
4. **Only what happened.** Record the actual error, command, or correction. Do not generalize beyond the evidence.

## Where entries go

- **Project lessons:** `LESSONS.md` at the repo root (or the path the project's `CLAUDE.md` names). Things specific to this codebase, stack, or data.
- **Cross-project lessons:** keep a personal lessons file outside any single project (for example in this skills repo) for patterns that apply everywhere. Only move a lesson here after it has shown up in two different projects.
- Never put secrets, tokens, or private data in a lessons file.

## Entry format

```markdown
## <the pattern, not the event>
Seen: <date> (<project>), <date> (<project>)   Count: <n>

Context: <what I was doing, one or two sentences>
Root cause: <the mechanism>
Next time I see <signal>, I will <action>.
Evidence: <error message, command, commit, or the user's correction>
```

Four to eight lines. If it takes longer, it is narrating the session instead of extracting the pattern.

## Procedure

1. List the candidate lessons from this session: errors that took more than one attempt, user corrections, redone work, surprising behavior.
2. For each, search the existing lessons file for the same root cause. **Same root cause, different symptom: merge** into the existing entry, add the new date, and increment the count. New root cause: new entry.
3. Write or update the entries.
4. Check for promotion (below).
5. Tell the user which entries were added or updated, in one line each.

## Promotion: move repeated lessons to where they are enforced

A lesson file that nobody reads does nothing. When a lesson recurs, move it up:

| Count or situation | Promote to |
|---|---|
| Seen 2+ times in one project | A one-line rule in that project's `CLAUDE.md` |
| Seen in 2+ projects | A line in the user-level `CLAUDE.md` or a rule in the relevant skill |
| A rule that must never be broken and can be checked mechanically | A hook (like `no-em-dash` or `config-protection` in this repo) |
| A multi-step procedure repeated 3+ times | A new skill (use `skill-creator`) |

Propose each promotion to the user with the exact line or file to add; do not edit `CLAUDE.md`, settings, or skills without their approval. After promoting, mark the entry `Promoted to: <location>` so it is not promoted twice.
