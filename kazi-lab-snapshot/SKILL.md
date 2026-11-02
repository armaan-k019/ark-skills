---
name: kazi-lab-snapshot
description: Run the kazi_lab (corvid) web UI against real data when the Neon database cannot be reached, by exporting a read-only snapshot on Armaan's Mac and loading it into a throwaway local Postgres with one script. Use for any kazi_lab UI work, screenshot, or bug that needs real corpus data from a cloud session or any machine without Neon access, and when refreshing a stale snapshot.
---

# kazi_lab Snapshot

kazi_lab's database is on Neon. As of 2026-10-27 the cloud session's network proxy and the device folder shell both refused the Neon host, so a cloud session cannot run the lab against it. What worked was a read-only export on Armaan's Mac and a local Postgres in the container. That took one long session of trial and error (pgvector missing, truncation order wiping loaded tables). This skill is the result as two scripts.

Written from the "Run kazi_lab on localhost" and "Rename and simplify the research lab" threads and the project memory note `kazi-lab-local-ui-testing`. Not adapted from a third party.

## What never changes

- **Read only against Neon.** `export-snapshot.mjs` sets `default_transaction_read_only` and runs only `SELECT`s inside read-only transactions. Never point `load-snapshot.sh` or any write at the Neon URL. The loader only ever talks to its own local cluster.
- **The snapshot is real research data.** It stays out of git and out of public places. Stage it in the session, never commit it.
- **Never present snapshot data as live.** Screenshots from it show the corpus as of the export date. Say the date.

## Step 1: Export on the Mac (Armaan runs this)

```sh
node ~/dev/ark-skills/kazi-lab-snapshot/scripts/export-snapshot.mjs ~/dev/kazi-lab ~/dev/kazi-lab-snapshot/out
```

It reads `DATABASE_URL` from the repo's `.env.local`, loads `pg` from `packages/db`, and writes one `<table>.jsonl.gz` per public table, printing each table's row count. The 2026-10-27 export was 55 tables and about 36 MB. Ask for a fresh export when the snapshot predates the migrations you are working with.

## Step 2: Stage it in the session

Get `out/` into the container: through the project's shared folder, or with folder access to the Mac. Copy it under `/tmp`, because the loader runs Postgres as the `postgres` user when the session is root, and that user cannot enter the scratchpad.

## Step 3: Load it

```sh
<ark-skills>/kazi-lab-snapshot/scripts/load-snapshot.sh <kazi_lab repo> /tmp/kazi-snapshot [work dir] [port]
```

Defaults: work dir `$TMPDIR/kazi-snapshot-pg` (or `/tmp/kazi-snapshot-pg`), port 5433. It:

1. Finds `initdb` (Debian `/usr/lib/postgresql/*/bin`, Homebrew paths, or `PGBIN`), creates a cluster if needed, starts it on a local socket and 127.0.0.1.
2. Drops and recreates a `kazi` database, so an old schema never mixes with a new snapshot.
3. Copies `packages/db/drizzle/*.sql` and patches the copies for a Postgres without pgvector: `vector(N)` becomes `text`, the `CREATE EXTENSION vector` line and the hnsw index are dropped. The repo's migrations are never edited.
4. Truncates every table in one statement (truncating one table at a time with cascade wipes children that were already loaded).
5. Imports every file in one transaction with foreign-key triggers off, so load order does not matter, and moves any serial or identity sequences past the imported ids.
6. Compares each table's row count with its file's line count, prints `ok` or `MISMATCH`, prints the `DATABASE_URL` and the stop command, and exits 1 on any mismatch.

Vector similarity does not work against this copy (embeddings are text). Pages that need nearest-neighbor search will be empty or error; say so instead of reporting a null result.

## Step 4: Point the app at it

- Repo-root `.env.local`: `DATABASE_URL=` the URL the loader printed.
- `apps/web/.env.local`: `KAZI_ACCESS_CODE` and `KAZI_GATE_SECRET` for the gate (any local values).
- Start the dev server the way kazi_lab's CLAUDE.md says, then take screenshots with `screenshot-proof`.

Never commit either `.env.local`.

## Tested

Round trip in a cloud session on 2026-11-02: all 33 migrations (0000 to 0032) applied to cluster A, rows seeded into `papers`, `claims`, and `embeddings` (quotes, backslashes, newlines, tabs, a text array, a vector), exported with `export-snapshot.mjs`, loaded into cluster B. Row counts matched, and an md5 over the seeded columns was identical in both. A second run against the same work dir was clean. Not yet run against a real Neon export, and the sequence reset has nothing to act on today, since the schema has no serial or identity columns.

## Checklist

- The export was read-only and came from Armaan's machine.
- The loader exited 0 with every table `ok`.
- The UI runs against the local URL, and the report gives the snapshot's date.
- Nothing from the snapshot or `.env.local` is staged in git.
- Stop the cluster when done (the loader prints the command).
