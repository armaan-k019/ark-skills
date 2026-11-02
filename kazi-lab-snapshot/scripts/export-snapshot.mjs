// Read-only snapshot of the kazi-lab database for local UI work.
// Runs only SELECTs. Writes one gzipped JSON-lines file per public table.
// Usage: node export-snapshot.mjs <kazi-lab repo dir> <out dir>
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { join } from "node:path";

const [repo, out] = process.argv.slice(2);
const require = createRequire(join(repo, "packages/db/package.json"));
const { Client } = require("pg");
const env = readFileSync(join(repo, ".env.local"), "utf8");
const url = env.split("\n").find((l) => l.startsWith("DATABASE_URL="))?.slice("DATABASE_URL=".length).trim();
if (!url) throw new Error("DATABASE_URL not found in .env.local");

mkdirSync(out, { recursive: true });
const c = new Client({ connectionString: url });
await c.connect();
await c.query("SET default_transaction_read_only = on");
const { rows: tables } = await c.query(
  "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
);
const PAGE = 2000;
for (const { table_name: t } of tables) {
  const gz = createGzip();
  const done = new Promise((r) => gz.pipe(createWriteStream(join(out, `${t}.jsonl.gz`))).on("finish", r));
  let n = 0;
  await c.query("begin read only");
  await c.query(`declare cur no scroll cursor for select row_to_json(x) as j from "${t}" x`);
  for (;;) {
    const { rows } = await c.query(`fetch ${PAGE} from cur`);
    for (const r of rows) gz.write(JSON.stringify(r.j) + "\n");
    n += rows.length;
    if (rows.length < PAGE) break;
  }
  await c.query("commit");
  gz.end();
  await done;
  console.log(`${t}\t${n}`);
}
await c.end();
