# Standing decisions: measure efficiency, then fix routing
SPEC: docs/runs/2026-09-30-efficiency/SPEC.md   Branch: ark-skills feat/efficiency (from main fee91b9); ark-console feat/efficiency (from main 46b8735)   Written: 2026-09-30 14:18 EDT

Class: machine-checkable (every phase has acceptance written as commands). One criterion is not: Phase 4's "whether output quality differed" is judged against a known answer where the workload has one, and reported as a judgment where it does not.

## Decide yourself
- Implementation approach within a phase
- File layout and naming
- Refactors confined to files the phase already touches
- Adding tests and fixtures
- Fixing bugs in code the build owns
- Up to two fix rounds per phase
- Creating a new branch from HEAD, including stacked branches
- How each measured quantity is defined, provided the definition is written next to the number (see Readings below)

## Stop and ask
- Merging to main; pushing (the SPEC says nothing pushed)
- Editing ~/.claude/settings.json (the fragment is proposed in PROGRESS.md for the author to apply)
- Installing anything; adding, removing, or upgrading a dependency
- Any network call, except the one clone the SPEC's router section names (see Readings)
- Changing an existing skill's body (agents/*.md frontmatter is in scope; files inside a skill directory, such as skill-creator/agents/*.md, are not)
- Re-running an eval that already has a recorded number
- Spending money
- Weakening, skipping, or deleting any test or acceptance criterion
- Anything irreversible in git: stash, reset, checkout of an existing branch, force push, history rewriting, deleting tracked files
- Any product decision about what a feature should do; anything a user sees beyond "plain defaults" (Phase 2 adds plain tables only)
- Writing anywhere outside SCOPE, including ~/.claude
- Anything not in the SPEC

## Readings of the SPEC (recorded because the SPEC does not settle them)
- **"src/" in SCOPE.** ark-console has no src/; its code is lib/ (the indexer), public/ (the page), and scripts/ (the page check). Phase 1 says "extend the indexer" and Phase 2 says "add a page section", which cannot be done outside those directories. SCOPE is read as ark-console's source directories (lib/, public/, scripts/) plus test/ and docs/. Nothing else in ark-console is written.
- **Branch in ark-console.** The SPEC names feat/efficiency for ark-skills only. ark-console now has a remote, so its work also goes on a branch named feat/efficiency rather than on main. Nothing is pushed.
- **Network.** The router section names one network action (clone https://github.com/weave-os/router to /tmp); that clone is done, vetted read-only, and deleted. Phase 3's "verified against Claude Code's current documentation" names no source that can be read without the network, and "any network call" is on the stop-and-ask list, while the SPEC gives a fallback ("If you cannot verify the name, say so and propose the per-agent frontmatter route instead"). So no documentation is fetched: the fallback is taken, the question is raised, and any local evidence (the installed Claude Code files, read-only) is reported as local evidence, not as documentation.
- **Phase 0.** Subagents this session starts run at sonnet unless the step needs judgment (a gate review is judgment and runs at opus). Phase 4's experiment runs use the models the experiment compares. PROGRESS.md lists every subagent with its model.
- **Gate reviews.** One fresh-context reviewer per code-bearing gate (Phase 1 and Phase 2 in ark-console), CRITICAL and HIGH only, at most two fix rounds. Phases 3 to 5 change frontmatter and documents and are checked by their acceptance commands.
- **Lessons.** capture-lessons writes to docs/runs/2026-09-30-efficiency/LESSONS.md, because neither repo's LESSONS.md is in this SPEC's scope. Merging them is proposed in the report.
- **Phase 4 routing.** The proposed routing change for general-purpose subagents is a settings default the author applies; the session cannot apply it. The "after" runs stand in for it by passing the proposed model on the Agent call, which is what the default would do. Agent frontmatter changes from Phase 3 are live as soon as they are committed, because ~/.claude/agents/silent-failure-hunter.md links into ark-skills' working tree.
