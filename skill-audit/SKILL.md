---
name: skill-audit
description: Audit installed Claude Code skills, subagents, and CLAUDE.md files for context cost, overlap, staleness, and quality, then recommend keep, improve, merge, or retire for each. Use after adding skills or agents, when sessions feel slow or context fills quickly, periodically (for example monthly) on a skills repo, before publishing a skills repo, or when asked "which skills do I actually need" or "audit my setup".
---

# Skill Audit

Every installed skill's description sits in context in every session, and every one is a chance for the wrong skill to trigger. A skills library that only grows ends up like a 400-line CLAUDE.md. This skill measures the setup and recommends what to cut.

Adapted from ECC's `skill-stocktake` and `context-budget` skills (MIT, see `licenses/ECC-LICENSE`). Numbers come from `scripts/inventory.py`, not from estimates made while reading.

## Step 1: Measure

Run the inventory script. With no arguments it scans `~/.claude/skills`, `~/.claude/agents`, `~/.claude/CLAUDE.md`, and the current project's `.claude/skills` and `CLAUDE.md`:

```sh
python3 <this skill's directory>/scripts/inventory.py
python3 <this skill's directory>/scripts/inventory.py ~/dev/ark-skills      # audit a skills repo
python3 <this skill's directory>/scripts/inventory.py --json > audit.json   # machine-readable
```

It reports, per skill or agent: line count, estimated tokens (words x 1.3), description length, and flags (no frontmatter, missing description, description over 1024 characters, SKILL.md over 500 lines, long agent descriptions, broken symlinks, duplicate names). Quote its numbers in the report; label them as estimates.

Also check what the script cannot see: run `/context` in a live Claude Code session for the real breakdown, and list MCP servers with `/mcp`. MCP tool schemas are often the largest fixed cost, and a server that wraps a CLI already available (`gh`, `git`, `npm`) is a candidate to remove.

## Step 2: Judge each item

Read every flagged item and every pair of skills whose descriptions overlap. For each, decide:

| Verdict | Meaning |
|---|---|
| Keep | Useful, current, no significant overlap |
| Improve | Worth keeping; name the specific change (section, trigger wording, target length) |
| Update | References tools, flags, APIs, or versions that may be outdated; verify against current docs before changing |
| Merge into X | Substantial overlap with X; say what content moves |
| Retire | Unused, stale, or covered elsewhere; say what covers the need instead |

Judge on:

- **Trigger quality.** Does the description say when to use it, in words a user would actually type? Too vague, and it never fires; too broad, and it fires on unrelated work.
- **Actionability.** Steps, commands, or checklists you can act on, not general advice.
- **Uniqueness.** Not already covered by CLAUDE.md, another skill, or the model's default behavior.
- **Currency.** Technical references still valid. Verify with docs before claiming something is outdated.
- **Usage.** Ask the user which skills they have actually used recently. Do not invent usage numbers; if unknown, say unknown.

Every verdict needs a self-contained reason. Not "overlaps with X", but "phased-build's Review step already covers the reviewer list in lines 40 to 55; move the two missing checks there and retire this".

## Step 3: Report

```markdown
# Skill Audit: <scope>   <date>

Scanned: <paths>
Skills: <n> (~<t> description tokens always loaded)   Agents: <n>   MCP servers: <n or not checked>

| Item | Kind | Est. tokens | Verdict | Reason |
|---|---|---:|---|---|

## Top 3 changes by impact
1. <change>: <why>, saves ~<t> tokens or removes <problem>
```

Do not delete, move, or edit any skill, agent, or settings file as part of the audit. Present the report; the user decides and applies changes.
