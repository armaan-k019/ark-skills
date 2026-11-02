#!/usr/bin/env bash
# Load a kazi_lab read-only snapshot into a throwaway local Postgres.
# Usage: load-snapshot.sh <kazi_lab repo dir> <snapshot dir> [work dir] [port]
#   snapshot dir: the out/ folder written by export-snapshot.mjs (one <table>.jsonl.gz per table)
#   work dir:     where the cluster and patched migrations go (default: $TMPDIR/kazi-snapshot-pg)
#   port:         default 5433, so it does not collide with a Postgres already on 5432
# Prints the DATABASE_URL to put in the repo-root .env.local.
set -euo pipefail

REPO=${1:?kazi_lab repo dir}
SNAP=${2:?snapshot dir}
WORK=${3:-${TMPDIR:-/tmp}/kazi-snapshot-pg}
PORT=${4:-5433}
DB=kazi

PGBIN=${PGBIN:-}
if [ -z "$PGBIN" ]; then
  for d in /usr/lib/postgresql/*/bin /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin; do
    [ -x "$d/initdb" ] && PGBIN=$d
  done
fi
[ -n "$PGBIN" ] && [ -x "$PGBIN/initdb" ] || { echo "initdb not found; set PGBIN" >&2; exit 1; }

MIGRATIONS="$REPO/packages/db/drizzle"
ls "$MIGRATIONS"/*.sql >/dev/null 2>&1 || { echo "no migrations in $MIGRATIONS" >&2; exit 1; }
ls "$SNAP"/*.jsonl.gz >/dev/null 2>&1 || { echo "no *.jsonl.gz in $SNAP" >&2; exit 1; }
SNAP=$(cd "$SNAP" && pwd)

# Postgres refuses to run as root; run the server and psql as the postgres user then.
if [ "$(id -u)" = 0 ]; then AS="runuser -u postgres --"; else AS=""; fi
mkdir -p "$WORK"
[ -n "$AS" ] && chown postgres "$WORK"
$AS test -w "$WORK" || { echo "the postgres user cannot write $WORK (a parent folder is not traversable); pick a work dir under /tmp" >&2; exit 1; }
PGDATA="$WORK/data"
SOCK="$WORK"
psql_() { PGOPTIONS="-c client_min_messages=warning" $AS "$PGBIN/psql" -h "$SOCK" -p "$PORT" -v ON_ERROR_STOP=1 -q "$@"; }

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  $AS "$PGBIN/initdb" -D "$PGDATA" -U postgres --auth=trust >/dev/null
fi
if ! $AS "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  $AS "$PGBIN/pg_ctl" -D "$PGDATA" -l "$WORK/server.log" -w \
    -o "-p $PORT -k $SOCK -c listen_addresses=127.0.0.1" start >/dev/null
fi

# Fresh database every run, so a stale schema never mixes with a new snapshot.
psql_ -U postgres -d postgres -c "drop database if exists $DB" -c "create database $DB"

# pgvector is usually not installed locally: store vectors as text and drop the
# hnsw index. Patch copies, never the repo's migration files.
PATCHED="$WORK/migrations"
rm -rf "$PATCHED"; mkdir -p "$PATCHED"
for f in "$MIGRATIONS"/*.sql; do
  sed -E -e '/CREATE EXTENSION IF NOT EXISTS vector/d' -e '/USING hnsw/d' \
    -e 's/vector\([0-9]+\)/text/g' "$f" > "$PATCHED/$(basename "$f")"
done
chmod -R a+r "$PATCHED"; chmod a+x "$PATCHED"
for f in "$PATCHED"/*.sql; do
  psql_ -U postgres -d "$DB" -f "$f" >/dev/null
done
echo "applied $(ls "$PATCHED"/*.sql | wc -l | tr -d ' ') migrations"

# Truncate every table in one statement first. Truncating table by table with
# cascade wipes child tables that were already loaded.
TABLES=$(psql_ -U postgres -d "$DB" -At -c \
  "select string_agg(format('%I', table_name), ', ') from information_schema.tables where table_schema='public' and table_type='BASE TABLE'")
[ -n "$TABLES" ] && psql_ -U postgres -d "$DB" -c "truncate $TABLES cascade"

# One transaction with foreign-key triggers off, so load order does not matter.
# Rows arrive as JSON lines; csv mode with control-character quote and delimiter
# keeps backslashes in the JSON intact.
SQL="$WORK/import.sql"
{
  echo "set session_replication_role = replica;"
  echo "create temp table stage (j jsonb);"
  for f in "$SNAP"/*.jsonl.gz; do
    t=$(basename "$f" .jsonl.gz)
    echo "\\echo $t"
    echo "truncate stage;"
    echo "\\copy stage from program 'gzip -dc \"$f\"' with (format csv, quote e'\\x01', delimiter e'\\x02')"
    echo "insert into \"$t\" overriding system value select r.* from stage, jsonb_populate_record(null::\"$t\", stage.j) r;"
  done
  # Move serial and identity sequences past the imported ids.
  cat <<'SQLEOF'
do $$
declare r record; s text;
begin
  for r in select table_name, column_name from information_schema.columns
           where table_schema = 'public' and (column_default like 'nextval%' or is_identity = 'YES') loop
    s := pg_get_serial_sequence(format('%I', r.table_name), r.column_name);
    if s is not null then
      execute format('select setval(%L, coalesce((select max(%I) from %I), 0) + 1, false)', s, r.column_name, r.table_name);
    end if;
  end loop;
end $$;
SQLEOF
} > "$SQL"
chmod a+r "$SQL" "$SNAP"/*.jsonl.gz
psql_ -U postgres -d "$DB" -1 -f "$SQL" >/dev/null

# Check: rows in each table against lines in its file.
bad=0
for f in "$SNAP"/*.jsonl.gz; do
  t=$(basename "$f" .jsonl.gz)
  want=$(gzip -dc "$f" | wc -l | tr -d ' ')
  got=$(psql_ -U postgres -d "$DB" -At -c "select count(*) from \"$t\"")
  status=ok; [ "$want" = "$got" ] || { status=MISMATCH; bad=1; }
  printf '%-40s %8s rows  (file %s)  %s\n' "$t" "$got" "$want" "$status"
done
echo
echo "DATABASE_URL=postgres://postgres@127.0.0.1:$PORT/$DB"
echo "stop with: ${AS:+$AS }$PGBIN/pg_ctl -D $PGDATA stop"
exit $bad
