# Live Claude Code session monitor: evaluation

Date: 2026-09-28. Nothing was installed, built, or run. Each repo was shallow-cloned into `/tmp/monitor-eval/`, scanned with `vet-third-party/scripts/scan.py`, and read by a separate read-only vetting pass following the vet-third-party reading checklist. The load-bearing claims marked (verified) were re-read in the source by the author of this file; the rest come from the vetting passes, with file and line references kept in `/tmp/monitor-eval/<repo>.vet.md`.

| | ccboard | claude-agents-dashboard | agent-mission-control |
|---|---|---|---|
| Repo | github.com/florianbruniaux/ccboard | github.com/futin/claude-agents-dashboard | github.com/evanchakrin/agent-mission-control |
| Commit vetted | c1a36a0ed5296279ce85b0009a3aa63ea62e78b8 (v0.25.0) | 320f5539e101c41a3631c2144fec1961f0d74c80 | 50a805a1233d394b8597207ea9157e0c45473864 (v7.34.1) |
| What it is | Rust binary: terminal UI, plus an optional web mode | Node (TypeScript via tsx) server with a React web UI | Node `server.js` web dashboard; a separate Go backend is Windows-oriented and optional |
| Scan | 96 HIGH, 106 MEDIUM | 440 HIGH, 295 MEDIUM | 8 HIGH, 128 MEDIUM |
| License | MIT (verified) | No LICENSE file; package.json says MIT (verified) | MIT (verified) |

## What each one reads

- **ccboard:** `~/.claude/projects/**/*.jsonl`, `stats-cache.json`, global and project `settings.json` and `settings.local.json` (including `env` and `apiKey` values), `~/.claude.json`, MCP config, agents, commands, skills, CLAUDE.md, and hook scripts. Also Codex, Gemini, Cursor, OpenCode, and Copilot data whenever those directories exist. Finds live sessions with `ps aux` and `lsof`. No credential files.
- **claude-agents-dashboard:** `~/.claude/projects/*/*.jsonl`, settings files, CLAUDE.md, agents, skills, hook scripts, the process list with full argv. By default it also reads your Claude OAuth access token, from the `CLAUDE_CREDENTIALS_JSON` variable, the macOS Keychain item "Claude Code-credentials", or `~/.claude/.credentials.json`.
- **agent-mission-control:** `~/.claude/projects` and `~/.codex/sessions` transcripts. No reads of credential files, the Keychain, `~/.ssh`, `~/.aws`, or API-key variables.

## What each one writes

- **ccboard:** on every run, `~/.claude/cache/session-metadata.db` (a SQLite copy of each session's first user message, with a full-text index); `~/.ccboard/`; an OS cache directory. `ccboard setup` rewrites `~/.claude/settings.json` and replaces the whole hook array for five events, dropping any hooks you already have there (verified: `setup.rs:85` uses `insert`). Setup never runs on its own.
- **claude-agents-dashboard:** its own state files in the checkout, and `~/.claude/dashboard-refresh/` for token renewal, which runs `claude -p ok --model haiku` on your account when the stored token has expired (on by default). The server never writes `settings.json`. `pnpm hooks:install`, only if you run it, adds seven user-global hooks to `~/.claude/settings.json` and symlinks into `~/.claude/hooks/`.
- **agent-mission-control:** `.jsonl` files under `~/.claude/mission-control` from its ingestion endpoint. On an explicit click, "Brain Save" can overwrite `~/.claude/settings.json`, `settings.local.json`, `~/.claude/CLAUDE.md`, project settings, and `~/.codex/config.toml` after showing a diff; "Standing orders" append to CLAUDE.md or AGENTS.md and can `git commit` and `git push`.

## Network

- **ccboard:** no outbound calls by default and no telemetry found. `ccboard pricing update` fetches a price list from raw.githubusercontent.com. The terminal UI starts no server. Web mode (`ccboard web` or `both`) binds `0.0.0.0:3333` with CORS allowing any origin and no authentication (verified: `lib.rs:34`, `router.rs:140-143`), and serves unmasked settings `env`, `apiKey`, and MCP env values plus session content.
- **claude-agents-dashboard:** listens on every interface with no host argument (verified: `server/index.ts:345`). Read endpoints have no authentication, so anyone on the same network can read transcripts and settings file bodies. Write endpoints accept anyone while `ANSWER_TOKEN` is empty, which is the default (verified: `server/api.ts:487-493`, `config.ts:127`). Calls `https://api.anthropic.com/api/oauth/usage` with your OAuth token by default (verified: `usage.ts:42,64`). Optional push notifications to ntfy.sh. The browser loads Google Fonts on every page.
- **agent-mission-control:** listens on every interface with no host argument (verified: `server.js:5011`). Transcript-serving API routes are loopback-only, but without `--token` anyone on the network can post fake sessions to the ingestion endpoint. Checks for updates against raw.githubusercontent.com on each UI load (verified: `server.js:4356`), with no working opt-out; it compares versions only and downloads no code.

## Permission-bypass flags

None of the three passes a permission-bypass flag by default. ccboard only calls `claude --print` and `claude --resume`. claude-agents-dashboard can spawn headless sessions only if `CLAUDE_BIN` is set, capped at `auto` unless you set `SPAWN_MAX_PERMISSION=bypassPermissions`. agent-mission-control never starts Claude (verified: no bypass flag anywhere in its .js, .go, .mjs, or .json files).

## Install footprint

- **ccboard:** one binary. Cargo.lock lists 572 packages (verified). The documented `curl ... | bash` installer downloads the latest release with no checksum (verified: no checksum step in `install.sh`). The Homebrew formula pins a sha256 per asset. Building this exact commit needs a Rust toolchain.
- **claude-agents-dashboard:** Node 18+ and pnpm; 5 dependencies and 9 devDependencies in package.json (verified), 178 lockfile entries, no install scripts. Runs from the checkout.
- **agent-mission-control:** Node only; package.json has no dependencies and no install scripts (verified). The optional Go backend lists 27 modules in go.sum (verified). The documented quick start `npx github:evanchakrin/agent-mission-control` runs whatever is on main, not the vetted commit.

## Verdicts

- **ccboard:** install with mitigations. Use only the terminal UI and CLI; never `ccboard web` or `both`; never `ccboard setup`; build the vetted commit instead of piping the installer to bash; accept or clear the cache database in `~/.claude/cache`.
- **claude-agents-dashboard:** install with mitigations, one of them required: bind the server to 127.0.0.1 (a one-line local patch) or firewall ports 4173 and 5174. Also set `ANSWER_TOKEN`, `REMOTE_ANSWER=false`, `USAGE_AUTO_REFRESH=false`; leave `CLAUDE_BIN` and `NTFY_TOPIC` empty; do not run `pnpm hooks:install`. Without the loopback fix, reject it.
- **agent-mission-control:** install with mitigations. Run `node server.js` from the vetted clone, not `npx`; always pass `--token`; block inbound port 4173; do not use Brain Save, starter hooks, or Standing orders; accept or block the update check.

## Recommendation

**ccboard, terminal UI only.** It is the only one of the three that, used as recommended, opens no network port, makes no outbound calls, and reads no credentials, and it needs no hooks to see live sessions. The trade-offs: it is a terminal UI rather than a browser dashboard; it keeps a copy of every session's first prompt in `~/.claude/cache/session-metadata.db`; pinning it means building from source with a Rust toolchain; and its web mode and `setup` command must be avoided entirely, because both are unsafe as shipped and its SECURITY.md contradicts the code on binding, CORS, and writes.

If a browser dashboard is required, agent-mission-control is the smaller risk of the other two: no npm dependencies, transcripts served only on loopback, and nothing written to global config without a click. It still listens on every interface, so it needs `--token` and a firewall rule. claude-agents-dashboard is the riskiest as shipped, because it serves transcripts and settings files to the network without authentication and uses your OAuth token by default.

## A gap in the vetting tool itself

`vet-third-party/scripts/scan.py` scans only the extensions in its `TEXT_EXT` set, which has no `.rs`. None of ccboard's 175 Rust source files were scanned, and every serious ccboard finding (the `0.0.0.0` bind, the CORS setting, the unmasked secrets, the hook overwrite) is in Rust. They were found by reading, not by the scanner. The scanner's HIGH and MEDIUM counts for ccboard therefore describe its docs and scripts, not its code.
