# ark-skills

Personal Claude Code skills library. Reusable instructions that shape how Claude Code approaches specific kinds of work.

## What's here

- **skill-creator** — Anthropic's official skill for creating and iterating on skills. Used as the foundation for building the others. Apache 2.0, from [anthropics/skills](https://github.com/anthropics/skills).
- **recruiter-demo-writer** — Consistent structure and voice for portfolio recruiter-demo pages. Enforces a fixed section skeleton, anti-fabrication rules, and voice discipline. Used when building or auditing demo pages for the portfolio at armaankazi.com.
- **impeccable** — Frontend design skill (v3.5.0, Apache 2.0). Handles design, redesign, critique, audit, and polish work across websites, landing pages, dashboards, and UI components. Includes scripts for palette generation, browser inspection, and antipattern detection. Written by a third party, credit in the skill's own SKILL.md.
- **relevance-profile**, **honest-refusal**, **query-to-corpus** — Discipline skills for a cross-domain research discovery engine project: the multi-axis relevance profile that is never collapsed into one score, the no-fabrication and adversarial-honesty rules that are the engine's identity, and how a research question becomes a contamination-guarded corpus.

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
```

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
└── README.md
```

## Adding a new skill

Use skill-creator inside a Claude Code session:

1. Ask Claude Code to invoke `/skill-creator` to build a new skill.
2. It runs an interview, drafts the SKILL.md, tests it against real prompts, and saves the file.
3. Commit and push to keep the skill in this repo.

## License

Individual skills carry their own licenses (Apache 2.0 for skill-creator and impeccable). New skills authored in this repo default to MIT unless specified otherwise.
