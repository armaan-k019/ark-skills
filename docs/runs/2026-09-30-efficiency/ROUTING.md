# Routing audit (efficiency run, Phase 3)

Written 2026-09-30 from ark-skills feat/efficiency. Models observed are from the subagent transcripts under ~/.claude/projects (the `message.model` most of each transcript's assistant lines carry), counted in one pass over the subagent transcripts whose first line is at or before 2026-09-30T18:00:00Z (the Phase 1 report time; later ones are this run's own); "asked" is the `model` field in the subagent's .meta.json, which records what the caller passed on the Agent call.

The rule applied (the author's): mechanical work (running commands, collecting output, grading assertions, file search) goes to the cheapest model that can do it; judgment work (review, planning, evaluating a paper or a design) gets the strongest available.

## Agents in ark-skills/agents/ and agents referenced by a skill

| Agent | Defined in | Referenced by | Current model | Observed runs | Recommended | Reason |
|---|---|---|---|---|---|---|
| silent-failure-hunter | agents/silent-failure-hunter.md | phased-build (review phase) | opus (frontmatter) | 14 of 14 on claude-opus-5-5 (13 asked opus, 1 asked none) | opus, unchanged | Review is judgment. |
| ts-reviewer | agents/ts-reviewer.md | phased-build (review phase) | opus (frontmatter) | 0 runs recorded | opus, unchanged | Review is judgment. |
| Reviewer subagents of adversarial-review and unattended-build gates | none (general-purpose, spawned per call) | adversarial-review, unattended-build, phased-build | not pinned: the caller's `model`, else the session default, which inherits the main model | 43 general-purpose runs described as review, gate, re-review, full-diff, or fresh review: 36 asked none and ran on claude-opus-5-5, 7 asked opus and ran on claude-opus-5 | opus, passed on the Agent call | Review is judgment. They get opus today only by inheriting it; a cheaper default would move them to it unless the call passes opus. |
| skill-creator grader | skill-creator/agents/grader.md (instructions, no frontmatter; read by a general-purpose subagent) | skill-creator | not pinned | 16 runs described as Grade: all asked none, all ran on claude-opus-5-5 | sonnet; haiku NOT MEASURED | Grading assertions is mechanical under the rule. The grader's output is the eval number the author relies on, so the cheapest model that can do it is the one shown to grade the same; Phase 4 measures sonnet against the current default on a grading task. |
| skill-creator comparator | skill-creator/agents/comparator.md | skill-creator | not pinned | 0 runs identified by description | opus, passed on the call | A blind quality comparison is judgment. |
| skill-creator analyzer | skill-creator/agents/analyzer.md | skill-creator | not pinned | 0 runs identified by description | opus, passed on the call | Explaining why one version won is judgment. |
| skill-creator test runs (with and without the skill) | none (general-purpose) | skill-creator | not pinned | eval and benchmark runs ("B1", "B2", "Eval", "R1" to "R3" and similar) | the model the skill is meant to run on, the same for both arms | An eval measures a skill on a model. Running it on a cheaper model changes what is measured; it is not a routing choice. |
| Other general-purpose subagents | built in | phased-build delegation, unattended-build, ad hoc | not pinned | 175 general-purpose transcripts in all: 101 asked no model; by the model most of their lines carry, 146 on opus (claude-opus-5-5 or claude-opus-5), 16 on sonnet (claude-sonnet-5 or claude-sonnet-5-5), 13 on haiku (all 13 asked haiku) | sonnet by default, opus passed explicitly for judgment | Mechanical tasks (grading, collecting, running) inherit opus today only because nothing says otherwise. |
| Explore | built in | no SKILL.md in ark-skills names it | not pinned by ark-skills | 10 runs, none asked a model: 7 on claude-sonnet-5, 3 on claude-opus-5-5 | no change | File search is mechanical, and Explore already ran on sonnet in 7 of 10; ark-skills has no file that sets it. |

Agent files after this phase: agents/silent-failure-hunter.md lists `model: opus`; agents/ts-reviewer.md lists `model: opus`. Changed: none. Both are reviewers, and the rule gives review the strongest model.

Not changed, on the stop-and-ask list: the skill-creator agent files and every SKILL.md (changing a skill's body). Passing `model: opus` for reviewers and `model: sonnet` for graders would be a change to adversarial-review, unattended-build, phased-build, and skill-creator; that is proposed, not made.

Open: whether opus is the strongest available. The session's model list includes Fable 5.1 (claude-fable-5-1) as well as Opus 5.5, and the Agent tool accepts `fable`. No measurement in this run compares them, so nothing here says which is stronger (NOT MEASURED).

## Evidence against spending the effort only on subagent models

From the Phase 1 report at 2026-09-30T18:00:00Z (ark-console d603781): in the last 7 days, 3,113,044,200 tokens, of which cache reads were 2,989,847,490 (96.0%); 86.8% of tokens were in messages above 150k context, and 99.7% in sessions longer than 8 hours (10 sessions). General-purpose subagents were 43.3% of tokens in the 7 days and 58.3% in the last 24 hours. Routing a subagent to a cheaper model changes the price of its tokens, not their number; the volume comes from long contexts read again on every turn. Both levers are real; the numbers say the second is larger. (Share figures are the Phase 1 report's; the 24-hour general-purpose share was 58.3% at 18:00Z.)

## The settings route, and its source

The SPEC asks for the environment variable name "verified against Claude Code's current documentation, not memory". Reading the documentation needs a network call, which this run's stop-and-ask list forbids, so the name is NOT VERIFIED against documentation. What was read locally, read-only:

- `claude --version`: 2.1.282 (Claude Code), installed at /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe.
- That binary contains, verbatim: `function tre(){let e=a.CLAUDE_CODE_SUBAGENT_MODEL;return e&&e!=="inherit"?e:"inherit"}`. So this version reads an environment variable named `CLAUDE_CODE_SUBAGENT_MODEL`, and treats unset or `inherit` as "inherit the main model".
- It also contains `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` (17 occurrences). What it does is not shown by what was read; the name suggests a variant that overrides pinned models, which would imply the plain variable does not, but that is an inference, not something read.
- The settings.json `env` key, which sets environment variables for Claude Code sessions, is from memory and was not verified either.

So the proposal in PROGRESS.md leads with the per-agent frontmatter route, as the SPEC says to when the name cannot be verified, and gives the settings fragment second, marked unverified.
