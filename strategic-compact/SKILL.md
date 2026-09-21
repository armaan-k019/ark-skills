---
name: strategic-compact
description: Decide when to /compact, /clear, or start a fresh session, and write a handoff file first so nothing important is lost. Use at phase boundaries in long Claude Code sessions (research done, plan approved, milestone finished, debugging over, approach abandoned), when switching to unrelated work, when output quality starts slipping in a long session, or when asked to "hand off", "wrap up this session", or "start fresh".
---

# Strategic Compact

Context is the scarce resource in a long session. Auto-compaction fires at an arbitrary token count, often mid-task, and keeps a lossy summary. This skill moves that decision to phase boundaries and makes sure the state that matters is on disk before anything is thrown away.

Adapted from ECC's `strategic-compact` skill (MIT, see `licenses/ECC-LICENSE`). ECC's hook-driven suggestion script is not included; this version is the decision guide plus a handoff format.

## Decide: compact, clear, fresh session, or keep going

| Transition | Action | Why |
|---|---|---|
| Research to planning | Compact | Research output is bulky; the plan is the distilled result |
| Plan approved, about to implement | Write plan to file, then compact or fresh session | Frees room for code; the file is the durable plan |
| Mid-implementation | Keep going | Losing file paths, names, and partial state costs more than it saves |
| Implementation to testing | Usually keep going | Tests reference the code just written |
| Debugging finished, next feature | Compact | Stack traces and dead ends pollute the next task |
| Approach abandoned | Compact or fresh session | Stop the failed reasoning from anchoring the retry |
| Unrelated task | `/clear` or fresh session | Nothing from the old task helps |
| Quality slipping (repeats itself, forgets earlier constraints) | Handoff file, then fresh session | A new session from a good handoff beats a compacted old one |

Default to a fresh session over `/compact` when the next phase is large. A handoff file you wrote on purpose is more reliable than a summary generated under pressure.

## Before any compact or reset: write the handoff

Do not rely on anything held only in the conversation, including in-session todo or task lists. Write the state to a file in the repo (default `progress.md` at the project root, or the path the project's `CLAUDE.md` names) and keep it out of commits unless the project tracks it.

```markdown
# Handoff: <task name>
Updated: <date>, branch: <branch>, last commit: <short sha>

## Goal
One or two sentences: what done looks like.

## Done
- <step>: <commit sha>, verified with <command> (PASS)

## Next
1. <next concrete step, with file paths>

## Decisions and constraints
- <decision>: <why> (so the next session does not relitigate it)
- <user rule that applies>, e.g. no em dashes, anti-fabrication, tsc + build before commit

## Known issues / open questions
- <issue>, or "none"

## Do not
- <approaches already tried and rejected, and why>
```

Rules for the handoff:

- Only record what actually happened. A step is under "Done" only if it was committed and verified; otherwise it goes under "Next" or "Known issues".
- Include file paths and commit SHAs, not descriptions of them.
- Never paste secrets or `.env` values into it.

## Then

- Compact with a focus line so the summary keeps the right things, for example `/compact Next: implement the parser in src/lib/parse.ts per progress.md`.
- Or start a fresh session with: "Read progress.md and continue from Next, step 1."

## What survives what

| Survives compaction and new sessions | Lost or degraded |
|---|---|
| Files on disk (including the handoff) | Intermediate reasoning |
| Git history, branches, commits | Contents of files read earlier |
| `CLAUDE.md` and project rules | Constraints stated only in chat |
| Skills and hooks | Tool output and error traces |

Anything in the right column that still matters belongs in the handoff file.
