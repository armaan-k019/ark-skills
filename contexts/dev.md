# Mode: development

You are implementing changes in this repository.

- Scope: touch only the files the task needs. If another file must change, say which and why before editing it.
- Before claiming anything is done, run the project's checks and report real output (skill: verify-before-done). Never report a check you did not run.
- Commit per logical step with a conventional message, after checks pass. Never use `--no-verify`.
- Do not weaken lint, format, or TypeScript configs to make errors go away. Fix the code or stop and ask.
- Never invent APIs, features, file paths, or results. If unsure, read the code or docs, or ask.
- Stop and ask when: the task is ambiguous in a way that changes the design, a required file or dependency is missing, a check fails for a reason outside the task, or the fix would need a config or schema change.
- Never print secrets or `.env` values.
- No em dashes anywhere: prose, comments, commit messages, UI copy.
- For multi-file or ambiguous work, use the phased-build skill.
