// Smoke test for the skills graph page. Needs Playwright (a dev-only
// dependency) and a server for viz/:
//
//   python3 -m http.server 8123 --bind 127.0.0.1 --directory viz &
//   node viz/scripts/smoke.mjs http://127.0.0.1:8123/
//
// Loads the page, checks that the rendered node and edge counts equal the
// counts in data/graph.json, clicks one node, checks every field and edge in
// the detail panel against graph.json (the contract in panel-check.cjs, also
// used by test_panel.cjs), and writes viz/screenshot.png. Exits non-zero on
// any failure.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import panelCheck from './panel-check.cjs';
import app from '../app.js';

const { readPanel, comparePanel } = panelCheck;

const base = process.argv[2] || 'http://127.0.0.1:8123/';
const graphPath = new URL('../data/graph.json', import.meta.url);
const screenshotPath = fileURLToPath(new URL('../screenshot.png', import.meta.url));

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const graph = JSON.parse(await readFile(graphPath, 'utf8'));

// The node with the most edges, ties broken by id, so the panel has lists to check.
const degree = new Map(graph.nodes.map((n) => [n.id, 0]));
for (const e of graph.edges) {
  degree.set(e.source, degree.get(e.source) + 1);
  degree.set(e.target, degree.get(e.target) + 1);
}
const target = [...degree.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
const outgoing = graph.edges.filter((e) => e.source === target).length;
const incoming = graph.edges.filter((e) => e.target === target).length;

const browser = await chromium.launch();
let result;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  const response = await page.goto(base);
  check(response && response.ok(), `GET ${base} failed: ${response && response.status()}`);
  await page.waitForFunction(() => window.__graphReady === true || Boolean(window.__graphError), null, {
    timeout: 20000,
  });
  const pageError = await page.evaluate(() => window.__graphError || null);
  check(!pageError, `page reported: ${pageError}`);

  const counts = await page.evaluate(() => ({
    nodes: window.cy.nodes().filter((n) => !n.isParent() && n.visible()).length,
    edges: window.cy.edges().filter((e) => e.visible()).length,
    parents: window.cy.nodes().filter((n) => n.isParent()).length,
  }));
  check(counts.nodes === graph.nodes.length, `rendered ${counts.nodes} nodes, JSON has ${graph.nodes.length}`);
  check(counts.edges === graph.edges.length, `rendered ${counts.edges} edges, JSON has ${graph.edges.length}`);
  check(counts.parents === graph.families.length, `rendered ${counts.parents} families, JSON has ${graph.families.length}`);

  // Clustered by family: no two family boxes overlap as drawn.
  const overlaps = await page.evaluate(() => {
    const boxes = window.cy.nodes(':parent').map((p) => ({ id: p.id(), bb: p.renderedBoundingBox() }));
    const hit = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].bb;
        const b = boxes[j].bb;
        if (a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2) hit.push(`${boxes[i].id} / ${boxes[j].id}`);
      }
    }
    return hit;
  });
  check(overlaps.length === 0, `family boxes overlap: ${overlaps.join(', ')}`);

  // Encoding: color by kind, outline only on nodes whose own SKILL.md states a
  // score, and a legend whose swatches match and which says what size means.
  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
  };
  const kindColors = Object.fromEntries(Object.entries(app.KIND_COLORS).map(([k, v]) => [k, rgb(v)]));
  check(new Set(Object.values(kindColors)).size === Object.keys(kindColors).length, 'kind colors are not distinct');
  const measured = (n) => typeof n.eval_status === 'string' && n.eval_status.startsWith('measured:');
  const drawn = await page.evaluate(() =>
    window.cy
      .nodes()
      .filter((n) => !n.isParent())
      .map((n) => ({ id: n.id(), bg: n.style('background-color'), border: parseFloat(n.style('border-width')) })),
  );
  for (const d of drawn) {
    const json = graph.nodes.find((n) => n.id === d.id);
    check(d.bg.replace(/\s/g, '') === kindColors[json.kind], `${d.id} (${json.kind}) is drawn ${d.bg}, expected ${kindColors[json.kind]}`);
    check(d.border > 0 === measured(json), `${d.id}: outline ${d.border}px but measured is ${measured(json)}`);
  }
  const legend = await page.evaluate(() => ({
    swatches: [...document.querySelectorAll('#legend .swatch[data-kind]')].map((s) => ({
      kind: s.dataset.kind,
      color: getComputedStyle(s).backgroundColor,
    })),
    text: document.getElementById('legend').textContent,
  }));
  for (const [kind, color] of Object.entries(kindColors)) {
    const swatch = legend.swatches.find((s) => s.kind === kind);
    check(swatch && swatch.color.replace(/\s/g, '') === color, `legend swatch for ${kind} is ${swatch && swatch.color}, expected ${color}`);
  }
  check(legend.text.includes("Node size: grows with the square root of the file's line count"), 'legend does not say what node size means');
  const measuredCount = graph.nodes.filter(measured).length;
  check(legend.text.includes(`(${measuredCount} ${measuredCount === 1 ? 'node' : 'nodes'})`), 'legend outline count does not match the data');

  // Legibility: labels at least 12 px as drawn, no label box over any node
  // circle, and the whole graph inside the viewport after load.
  const legibility = await page.evaluate(() => {
    const cy = window.cy;
    const zoom = cy.zoom();
    const members = cy.nodes().filter((n) => !n.isParent());
    const minFontPx = Math.min(...members.map((n) => parseFloat(n.style('font-size')) * zoom));
    const circles = members.map((n) => ({ id: n.id(), bb: n.boundingBox({ includeLabels: false, includeOverlays: false }) }));
    const labels = cy
      .nodes()
      .map((n) => ({ id: n.id(), bb: n.boundingBox({ includeNodes: false, includeEdges: false, includeLabels: true, includeOverlays: false }) }))
      .filter((l) => l.bb.w > 0 && l.bb.h > 0);
    const hit = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    const labelOnCircle = [];
    for (const l of labels) for (const c of circles) if (hit(l.bb, c.bb)) labelOnCircle.push(`${l.id} label over ${c.id}`);
    let labelOnLabel = 0;
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (hit(labels[i].bb, labels[j].bb)) labelOnLabel++;
    const all = cy.elements().renderedBoundingBox();
    return { zoom, minFontPx, labelOnCircle, labelOnLabel, labels: labels.length, box: { x1: all.x1, y1: all.y1, x2: all.x2, y2: all.y2 }, view: { w: cy.width(), h: cy.height() } };
  });
  check(legibility.minFontPx >= 12, `smallest label is ${legibility.minFontPx.toFixed(1)} px as drawn, expected at least 12`);
  check(legibility.labelOnCircle.length === 0, `labels over node circles: ${legibility.labelOnCircle.join(', ')}`);
  const { box, view } = legibility;
  check(box.x1 >= -1 && box.y1 >= -1 && box.x2 <= view.w + 1 && box.y2 <= view.h + 1, `graph does not fit the viewport: ${JSON.stringify({ box, view })}`);

  // Filters: unchecking a family hides exactly its members; unchecking an edge
  // kind hides exactly that kind's edges. Each is restored afterwards. Cytoscape
  // applies class changes on its next frame, so wait (up to 5 s) for the counts.
  async function expectVisible(nodes, edges, what) {
    const count = () => ({
      nodes: window.cy.nodes().filter((n) => !n.isParent() && n.visible()).length,
      edges: window.cy.edges().filter((e) => e.visible()).length,
    });
    const ok = await page
      .waitForFunction(
        ({ n, e }) =>
          window.cy.nodes().filter((x) => !x.isParent() && x.visible()).length === n &&
          window.cy.edges().filter((x) => x.visible()).length === e,
        { n: nodes, e: edges },
        { timeout: 5000 },
      )
      .then(() => true, () => false);
    const now = await page.evaluate(count);
    check(ok, `${what}: ${now.nodes} nodes and ${now.edges} edges visible, expected ${nodes} and ${edges}`);
  }
  const family = graph.families[0].id;
  const members = graph.nodes.filter((n) => n.family === family).length;
  const familyEdges = graph.edges.filter((e) => {
    const inFamily = (id) => graph.nodes.find((n) => n.id === id).family === family;
    return inFamily(e.source) || inFamily(e.target);
  }).length;
  await page.uncheck(`#filters input[value="${family}"]`);
  await expectVisible(graph.nodes.length - members, graph.edges.length - familyEdges, `family filter (${family})`);
  await page.check(`#filters input[value="${family}"]`);
  await expectVisible(graph.nodes.length, graph.edges.length, 'family filter restored');
  const kind = graph.edges[0].kind;
  const ofKind = graph.edges.filter((e) => e.kind === kind).length;
  await page.uncheck(`#edge-filters input[value="${kind}"]`);
  await expectVisible(graph.nodes.length, graph.edges.length - ofKind, `edge kind filter (${kind})`);
  await page.check(`#edge-filters input[value="${kind}"]`);
  await expectVisible(graph.nodes.length, graph.edges.length, 'edge kind filter restored');

  // Click the node where it is drawn, as a user would.
  const point = await page.evaluate((id) => {
    const node = window.cy.getElementById(id);
    const pos = node.renderedPosition();
    const box = window.cy.container().getBoundingClientRect();
    return { x: box.left + pos.x, y: box.top + pos.y };
  }, target);
  await page.mouse.click(point.x, point.y);
  await page.waitForFunction((id) => document.getElementById('details').dataset.nodeId === id, target, {
    timeout: 5000,
  });

  const panel = await page.evaluate(readPanel);
  const problems = comparePanel(panel, graph, target);
  check(problems.length === 0, `detail panel for ${target} is wrong: ${problems.join('; ')}`);

  await page.screenshot({ path: screenshotPath });
  check(pageErrors.length === 0, `page errors: ${pageErrors.join(' | ')}`);
  result = { counts, target, outgoing, incoming, legibility };
} finally {
  await browser.close();
}

console.log(
  `OK: rendered ${result.counts.nodes} nodes and ${result.counts.edges} edges ` +
    `(JSON ${graph.nodes.length} and ${graph.edges.length}), ${result.counts.parents} families; ` +
    `clicked ${result.target}, panel shows Outgoing (${result.outgoing}) and Incoming (${result.incoming}); ` +
    `smallest label ${result.legibility.minFontPx.toFixed(1)} px, 0 labels over circles, ` +
    `${result.legibility.labelOnLabel} label pairs overlapping each other; wrote ${screenshotPath}`,
);
