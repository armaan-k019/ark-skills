#!/usr/bin/env node
// Desktop and phone screenshots of one or more pages, plus the facts a reviewer
// needs next to them: HTTP status, page errors, console errors, failed requests,
// and the rendered word count of <main>.
//
// Usage:
//   node shoot.mjs --out <dir> [--full] [--wait <ms>] [--wait-for <css>] [--only desktop|phone]
//                  <url>[=<label>] [<url>[=<label>] ...]
//
// Writes <dir>/<label>-desktop.png and <dir>/<label>-phone.png. The label defaults
// to the URL path ("/demos/dlr" -> "demos-dlr", "/" -> "root").
// Exits 1 if any page returned HTTP >= 400 or threw an uncaught error, so a
// broken page cannot pass as a screenshot.

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  try {
    ({ chromium } = require(require.resolve("playwright", { paths: [process.cwd()] })));
  } catch {
    console.error("playwright not found. Run from a project that has it installed, or install it there.");
    process.exit(2);
  }
}

const VIEWPORTS = {
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  phone: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

function parseArgs(argv) {
  const opts = { out: null, full: false, wait: 0, waitFor: null, only: null, targets: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = argv[++i];
    else if (a === "--full") opts.full = true;
    else if (a === "--wait") opts.wait = Number(argv[++i]);
    else if (a === "--wait-for") opts.waitFor = argv[++i];
    else if (a === "--only") opts.only = argv[++i];
    else if (a.startsWith("--")) throw new Error(`unknown flag ${a}`);
    else {
      const eq = a.indexOf("=", a.indexOf("://") + 3);
      const url = eq > -1 ? a.slice(0, eq) : a;
      opts.targets.push({ url, label: eq > -1 ? a.slice(eq + 1) : labelFor(url) });
    }
  }
  if (!opts.out || opts.targets.length === 0) {
    throw new Error("usage: shoot.mjs --out <dir> [--full] [--wait ms] [--wait-for css] [--only desktop|phone] <url>[=label] ...");
  }
  if (opts.only && !VIEWPORTS[opts.only]) throw new Error("--only takes desktop or phone");
  return opts;
}

function labelFor(url) {
  const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  return path ? path.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : "root";
}

async function shoot(browser, target, name, opts, outDir) {
  const { width, height, ...device } = VIEWPORTS[name];
  const context = await browser.newContext({ viewport: { width, height }, ...device });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failed = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 200)));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
  page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText ?? "failed"} ${r.url().slice(0, 120)}`));

  const res = await page.goto(target.url, { waitUntil: "load", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  if (opts.waitFor) await page.waitForSelector(opts.waitFor, { timeout: 15000 });
  if (opts.wait) await page.waitForTimeout(opts.wait);

  const words = await page.evaluate(() => {
    const main = document.querySelector("main");
    return main ? main.innerText.trim().split(/\s+/).filter(Boolean).length : null;
  });
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const file = join(outDir, `${target.label}-${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.full });
  await context.close();
  return { viewport: name, status: res?.status() ?? null, file, words, overflowX, pageErrors, consoleErrors, failed };
}

const opts = parseArgs(process.argv.slice(2));
const outDir = resolve(opts.out);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let broken = false;
try {
  for (const target of opts.targets) {
    for (const name of opts.only ? [opts.only] : Object.keys(VIEWPORTS)) {
      const r = await shoot(browser, target, name, opts, outDir);
      if ((r.status ?? 0) >= 400 || r.pageErrors.length) broken = true;
      console.log(`${target.url} [${name}] HTTP ${r.status} -> ${r.file}`);
      console.log(`  words in <main>: ${r.words ?? "no <main>"}${r.overflowX ? "   HORIZONTAL OVERFLOW" : ""}`);
      for (const e of r.pageErrors) console.log(`  page error: ${e}`);
      for (const e of r.consoleErrors) console.log(`  console error: ${e}`);
      for (const e of r.failed) console.log(`  request failed: ${e}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(broken ? 1 : 0);
