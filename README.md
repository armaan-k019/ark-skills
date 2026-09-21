# ark-skills

Personal Claude Code skills library. Reusable instructions that shape how Claude Code approaches specific kinds of work.

## What's here

- **skill-creator**: Anthropic's official skill for creating and iterating on skills. Used as the foundation for building the others. Apache 2.0, from [anthropics/skills](https://github.com/anthropics/skills).
- **recruiter-demo-writer**: Consistent structure and voice for portfolio recruiter-demo pages. Enforces a fixed section skeleton, anti-fabrication rules, and voice discipline. Used when building or auditing demo pages for the portfolio at armaankazi.com.
- **impeccable**: Frontend design skill (v3.5.0, Apache 2.0). Handles design, redesign, critique, audit, and polish work across websites, landing pages, dashboards, and UI components. Includes scripts for palette generation, browser inspection, and antipattern detection. Written by a third party, credit in the skill's own SKILL.md.
- **relevance-profile**, **honest-refusal**, **query-to-corpus**: Discipline skills for a cross-domain research discovery engine project: the multi-axis relevance profile that is never collapsed into one score, the no-fabrication and adversarial-honesty rules that are the engine's identity, and how a research question becomes a contamination-guarded corpus.
- **ponytail**: Enforces a lazy-senior-dev discipline: climb a laziness ladder (YAGNI, reuse, stdlib, native, existing dependency, one-liner, minimum code) before writing anything new. The full six-skill suite (`ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`) is vendored in this repo, but only the core `ponytail` skill is installed below; the other five are available under `ponytail/skills/` if you want to symlink them yourself. Vendored from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT, credit in `ponytail/LICENSE`.
- **verify-before-done**: Runs the project's own build, typecheck, lint, and tests, reviews the diff against the task, and reports each check as PASS, FAIL, or NOT RUN. Never reports a check it did not run. Adapted from ECC's `verification-loop`.
- **strategic-compact**: When to `/compact`, `/clear`, or start a fresh session, plus a `progress.md` handoff format so state lives on disk, not in the conversation. Adapted from ECC's `strategic-compact`.

### Workflow and research skills (adapted from ECC)

- **phased-build**: Runs a coding task as gated phases (intake, research, plan, implement, review, verify, commit). Each phase writes one file the next phase reads; the user approves the plan and the commit. Covers add, change, fix, and refactor operations, subagent delegation, and parallel worktrees.
- **adversarial-review**: Independent reviewers for high-stakes output. Dual review (two fresh reviewers must both pass, max 3 rounds) or a generator-evaluator loop with a scored rubric and plateau stop. Includes pass@k vs pass^k.
- **literature-review**: Logged, reproducible literature search with verified citations, including architecture and computational design sources (CumInCAD, EDRA). Unverifiable citations are dropped, not softened.
- **scholar-evaluation**: Rubric review of papers, abstracts, and proposals, with claim-by-claim citation checks and a pre-submission mode.
- **experiment-discipline**: Experiment cards, reproducibility (SHA, config, seeds, hardware), benchmarking method (correctness first, warm-up, repeats, median and spread, input scaling), and an experiment ledger.
- **capture-lessons**: Extracts transferable lessons after failures into `LESSONS.md`, merges duplicates by root cause, and proposes promoting repeated lessons into CLAUDE.md rules, hooks, or skills.
- **decision-records**: Short decision records in `docs/decisions/` (context, decision, alternatives, consequences), written only with approval.
- **skill-audit**: Measures installed skills, agents, and CLAUDE.md with `scripts/inventory.py` and recommends keep, improve, merge, or retire.
- **vet-third-party**: Static scan (`scripts/scan.py`) plus a reading checklist for any skill, hook, plugin, or MCP config before installing it.

## Subagents (`agents/`)

- **silent-failure-hunter**: Reviews changed code for swallowed errors, fallbacks that hide failure, lost error propagation, and unchecked network or API calls. Every finding cites a line; "no findings" is a valid result.
- **ts-reviewer**: Runs the project's typecheck and lint, then reviews TypeScript, React, and Next.js changes for security, type safety, async correctness, and scope creep.

Both report findings only and never edit code. Adapted from ECC agents of the same purpose.

## Hooks (`hooks/`)

Hooks run on every matching tool call, so rules that must always hold do not depend on the model remembering them.

- **config-protection.js**: Blocks edits to existing eslint, prettier, biome, ruff, stylelint, markdownlint, and tsconfig files, so Claude fixes the code instead of loosening the check. Adapted from ECC.
- **no-em-dash.js**: Blocks any Write, Edit, or MultiEdit that adds an em dash, and any `git commit`, `git tag`, or `gh pr`/`gh issue` command containing one. Existing em dashes in a file do not block unrelated edits.
- **block-no-verify.js**: Blocks `--no-verify`, `git commit -n`, and `-c core.hooksPath=` so git hooks cannot be skipped. Simplified from ECC's version; a commit message containing the literal text `--no-verify` is also blocked.

Test them with `node hooks/test-hooks.js`. Requires Node on your `PATH`.

ECC-derived files are credited in `licenses/ECC-LICENSE` (MIT, [affaan-m/ECC](https://github.com/affaan-m/ECC)).

## Mode contexts (`contexts/`)

`dev.md`, `review.md`, and `research.md` are short behavior profiles you load per session instead of putting everything in one CLAUDE.md. Use `--append-system-prompt-file`, which adds to Claude Code's default system prompt; `--system-prompt` would replace it entirely.

```sh
alias claude-dev='claude --append-system-prompt-file ~/dev/ark-skills/contexts/dev.md'
alias claude-review='claude --append-system-prompt-file ~/dev/ark-skills/contexts/review.md'
alias claude-research='claude --append-system-prompt-file ~/dev/ark-skills/contexts/research.md'
```

## How to install

Clone the repo:

```sh
git clone https://github.com/armaan-k019/ark-skills.git ~/dev/ark-skills
```

Symlink individual skills into Claude Code's skills directory:

```sh
mkdir -p ~/.claude/skills
ln -s ~/dev/ark-skills/skill-creator ~/.claude/skills/skill-creator
ln -s ~/dev/ark-skills/recruiter-demo-writer ~/.claude/skills/recruiter-demo-writer
ln -s ~/dev/ark-skills/impeccable ~/.claude/skills/impeccable
ln -s ~/dev/ark-skills/relevance-profile ~/.claude/skills/relevance-profile
ln -s ~/dev/ark-skills/honest-refusal ~/.claude/skills/honest-refusal
ln -s ~/dev/ark-skills/query-to-corpus ~/.claude/skills/query-to-corpus
ln -s ~/dev/ark-skills/ponytail/skills/ponytail ~/.claude/skills/ponytail
ln -s ~/dev/ark-skills/verify-before-done ~/.claude/skills/verify-before-done
ln -s ~/dev/ark-skills/strategic-compact ~/.claude/skills/strategic-compact
ln -s ~/dev/ark-skills/phased-build ~/.claude/skills/phased-build
ln -s ~/dev/ark-skills/adversarial-review ~/.claude/skills/adversarial-review
ln -s ~/dev/ark-skills/literature-review ~/.claude/skills/literature-review
ln -s ~/dev/ark-skills/scholar-evaluation ~/.claude/skills/scholar-evaluation
ln -s ~/dev/ark-skills/experiment-discipline ~/.claude/skills/experiment-discipline
ln -s ~/dev/ark-skills/capture-lessons ~/.claude/skills/capture-lessons
ln -s ~/dev/ark-skills/decision-records ~/.claude/skills/decision-records
ln -s ~/dev/ark-skills/skill-audit ~/.claude/skills/skill-audit
ln -s ~/dev/ark-skills/vet-third-party ~/.claude/skills/vet-third-party
```

Symlink the subagents:

```sh
mkdir -p ~/.claude/agents
ln -s ~/dev/ark-skills/agents/silent-failure-hunter.md ~/.claude/agents/silent-failure-hunter.md
ln -s ~/dev/ark-skills/agents/ts-reviewer.md ~/.claude/agents/ts-reviewer.md
```

Enable the hooks by merging the `hooks` block from `hooks/settings.example.json` into `~/.claude/settings.json` (all projects) or a project's `.claude/settings.json` (one project). Merge by hand if you already have a `hooks` key; do not overwrite it. To exempt vendored code from the em dash hook, export `ARK_EM_DASH_ALLOW_PATHS` (colon-separated path substrings, e.g. `/skill-creator/:/node_modules/`) in your shell profile before launching Claude Code.

Symlinks (not copies) let updates in this repo propagate everywhere without duplicating files.

Verify installation:

```sh
ls -la ~/.claude/skills/
```

Each entry should show as a symlink pointing to `~/dev/ark-skills/`.

## Structure

```
ark-skills/
├── skill-creator/
│   └── SKILL.md, agents/, scripts/, references/, ...
├── recruiter-demo-writer/
│   └── SKILL.md
├── impeccable/
│   └── SKILL.md, reference/, scripts/
├── relevance-profile/
│   └── SKILL.md
├── honest-refusal/
│   └── SKILL.md
├── query-to-corpus/
│   └── SKILL.md
├── ponytail/
│   ├── LICENSE, README.md, AGENTS.md
│   └── skills/
│       ├── ponytail/SKILL.md
│       ├── ponytail-review/SKILL.md
│       ├── ponytail-audit/SKILL.md
│       ├── ponytail-debt/SKILL.md
│       ├── ponytail-gain/SKILL.md
│       └── ponytail-help/SKILL.md
├── verify-before-done/
│   └── SKILL.md
├── strategic-compact/
│   └── SKILL.md
├── phased-build/, adversarial-review/, literature-review/,
│   scholar-evaluation/, experiment-discipline/, capture-lessons/,
│   decision-records/
│   └── SKILL.md
├── skill-audit/
│   └── SKILL.md, scripts/inventory.py
├── vet-third-party/
│   └── SKILL.md, scripts/scan.py
├── contexts/
│   └── dev.md, review.md, research.md
├── agents/
│   ├── silent-failure-hunter.md
│   └── ts-reviewer.md
├── hooks/
│   ├── config-protection.js, no-em-dash.js, block-no-verify.js
│   ├── _input.js, test-hooks.js
│   └── settings.example.json
├── licenses/
│   └── ECC-LICENSE
└── README.md
```

## Adding a new skill

Use skill-creator inside a Claude Code session:

1. Ask Claude Code to invoke `/skill-creator` to build a new skill.
2. It runs an interview, drafts the SKILL.md, tests it against real prompts, and saves the file.
3. Commit and push to keep the skill in this repo.

## License

Individual skills carry their own licenses (Apache 2.0 for skill-creator and impeccable, MIT for ponytail, MIT for the ECC-derived skills, agents, and hooks, see `licenses/ECC-LICENSE`). New skills authored in this repo default to MIT unless specified otherwise.
