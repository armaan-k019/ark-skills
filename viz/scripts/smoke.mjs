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
const focusShotPath = fileURLToPath(new URL('../screenshot-focus.png', import.meta.url));
const FOCUS_NODE = 'skill:phased-build';

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

  // Packing: boxes in reading order go from most members to fewest, no box ends
  // with a lone member in its last row, and no empty rectangle larger than a
  // tenth of the canvas (measured on a 16 by 16 grid over the canvas).
  const packing = await page.evaluate(() => {
    const cy = window.cy;
    const parents = cy.nodes(':parent').map((p) => {
      const bb = p.renderedBoundingBox();
      const ys = p.children().map((c) => Math.round(c.position('y')));
      const rows = [...new Set(ys)].sort((a, b) => a - b);
      const lastRow = ys.filter((y) => y === rows[rows.length - 1]).length;
      return { id: p.id(), count: p.children().length, x1: bb.x1, y1: bb.y1, y2: bb.y2, lastRow };
    });
    const W = cy.width();
    const H = cy.height();
    const N = 16;
    const boxes = cy.nodes(':parent').map((p) => p.renderedBoundingBox());
    const occupied = [];
    for (let i = 0; i < N; i++) {
      occupied.push([]);
      for (let j = 0; j < N; j++) {
        const c = { x1: (j * W) / N, x2: ((j + 1) * W) / N, y1: (i * H) / N, y2: ((i + 1) * H) / N };
        occupied[i].push(boxes.some((bb) => bb.x1 < c.x2 && c.x1 < bb.x2 && bb.y1 < c.y2 && c.y1 < bb.y2));
      }
    }
    let largest = 0;
    for (let i1 = 0; i1 < N; i1++) for (let j1 = 0; j1 < N; j1++) for (let i2 = i1; i2 < N; i2++) for (let j2 = j1; j2 < N; j2++) {
      let empty = true;
      for (let i = i1; i <= i2 && empty; i++) for (let j = j1; j <= j2 && empty; j++) if (occupied[i][j]) empty = false;
      if (empty) largest = Math.max(largest, (i2 - i1 + 1) * (j2 - j1 + 1));
    }
    return { parents, largestEmpty: largest / (N * N) };
  });
  // Reading order: boxes whose vertical extents overlap share a row; rows top to
  // bottom, boxes in a row left to right.
  const rowsOfBoxes = [];
  for (const p of [...packing.parents].sort((a, b) => a.y1 - b.y1)) {
    const row = rowsOfBoxes.find((r) => p.y1 < r.y2);
    if (row) {
      row.boxes.push(p);
      row.y2 = Math.max(row.y2, p.y2);
    } else rowsOfBoxes.push({ y2: p.y2, boxes: [p] });
  }
  const reading = rowsOfBoxes.flatMap((r) => r.boxes.sort((a, b) => a.x1 - b.x1));
  for (let i = 1; i < reading.length; i++) {
    check(reading[i].count <= reading[i - 1].count, `family boxes out of order: ${reading.map((p) => `${p.id}(${p.count})`).join(', ')}`);
  }
  for (const p of packing.parents) check(p.count < 2 || p.lastRow >= 2, `${p.id} ends with ${p.lastRow} member in its last row`);
  check(packing.largestEmpty <= 0.1, `largest empty rectangle is ${(packing.largestEmpty * 100).toFixed(1)}% of the canvas, expected at most 10%`);

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
      .map((n) => ({
        id: n.id(),
        bg: n.style('background-color'),
        border: parseFloat(n.style('border-width')),
        borderStyle: n.style('border-style'),
      })),
  );
  for (const d of drawn) {
    const json = graph.nodes.find((n) => n.id === d.id);
    check(d.bg.replace(/\s/g, '') === kindColors[json.kind], `${d.id} (${json.kind}) is drawn ${d.bg}, expected ${kindColors[json.kind]}`);
    const width = measured(json) ? app.MEASURED_OUTLINE.width : json.vendored ? app.VENDORED_BORDER.width : 0;
    check(d.border === width, `${d.id}: border ${d.border}px, expected ${width} (measured ${measured(json)}, vendored ${json.vendored})`);
    const style = json.vendored ? 'dashed' : 'solid';
    check(width === 0 || d.borderStyle === style, `${d.id}: border style ${d.borderStyle}, expected ${style}`);
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
  const vendoredCount = graph.nodes.filter((n) => n.vendored).length;
  check(
    legend.text.includes(`dashed border: vendored, carried from another repository (${vendoredCount} ${vendoredCount === 1 ? 'node' : 'nodes'})`),
    'legend vendored count does not match the data',
  );

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
  check(legibility.minFontPx >= app.MIN_LABEL_PX, `smallest node label is ${legibility.minFontPx.toFixed(1)} px as drawn, expected at least ${app.MIN_LABEL_PX}`);

  // Family labels: uppercase, letterspaced, 11 px as drawn, gray.
  const thin = String.fromCharCode(0x2009);
  const familyLabels = await page.evaluate(() =>
    window.cy.nodes(':parent').map((p) => ({
      id: p.id(),
      label: p.data('label'),
      px: parseFloat(p.style('font-size')) * window.cy.zoom(),
      color: p.style('color'),
    })),
  );
  for (const f of familyLabels) {
    const json = graph.families.find((x) => `${app.FAMILY_PREFIX}${x.id}` === f.id);
    check(f.label === [...json.label.toUpperCase()].join(thin), `family label of ${f.id} is not uppercase and letterspaced: ${JSON.stringify(f.label)}`);
    check(Math.abs(f.px - app.FAMILY_LABEL.px) < 0.5, `family label of ${f.id} is ${f.px.toFixed(2)} px, expected ${app.FAMILY_LABEL.px}`);
    check(f.color.replace(/\s/g, '') === rgb(app.FAMILY_LABEL.color), `family label of ${f.id} is ${f.color}, expected ${rgb(app.FAMILY_LABEL.color)}`);
  }
  check(legibility.labelOnCircle.length === 0, `labels over node circles: ${legibility.labelOnCircle.join(', ')}`);
  const { box, view } = legibility;
  check(box.x1 >= -1 && box.y1 >= -1 && box.x2 <= view.w + 1 && box.y2 <= view.h + 1, `graph does not fit the viewport: ${JSON.stringify({ box, view })}`);

  // Edges never pass over a node they do not connect, which would read as a
  // reference that does not exist. Measured on the path Cytoscape draws, with an
  // implementation separate from the page's router.
  const unrouted = await page.evaluate(() => window.__unroutedEdges || null);
  check(Array.isArray(unrouted) && unrouted.length === 0, `edges the page could not route around nodes: ${JSON.stringify(unrouted)}`);
  const routing = await page.evaluate(() => {
    const cy = window.cy;
    const members = cy.nodes().filter((n) => !n.isParent());
    const crossings = [];
    cy.edges().forEach((edge) => {
      const ctrl = [edge.sourceEndpoint(), ...(edge.controlPoints() || []), edge.targetEndpoint()];
      const points = [];
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        let level = ctrl;
        while (level.length > 1) {
          const next = [];
          for (let j = 0; j < level.length - 1; j++) {
            next.push({ x: level[j].x + u * (level[j + 1].x - level[j].x), y: level[j].y + u * (level[j + 1].y - level[j].y) });
          }
          level = next;
        }
        points.push(level[0]);
      }
      members.forEach((n) => {
        if (n.id() === edge.source().id() || n.id() === edge.target().id()) return;
        const q = n.position();
        const r = n.width() / 2;
        if (points.some((p) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 < r * r)) crossings.push(`${edge.id()} over ${n.id()}`);
      });
    });
    return { crossings, bent: cy.edges().filter((e) => e.data('bend') !== undefined).length };
  });
  check(routing.crossings.length === 0, `edges drawn over nodes they do not connect: ${routing.crossings.join(', ')}`);

  // Filters: every family and every edge kind, checked by the exact set of
  // hidden nodes and edges, plus one combined case. Cytoscape applies class
  // changes on its next frame, so wait (up to 5 s) for the expected sets.
  const familyOf = Object.fromEntries(graph.nodes.map((n) => [n.id, n.family]));
  const hiddenNow = () => ({
    n: window.cy.nodes().filter((x) => !x.isParent() && !x.visible()).map((x) => x.id()).sort(),
    e: window.cy.edges().filter((x) => !x.visible()).map((x) => x.id()).sort(),
  });
  async function expectHidden(nodeIds, edgeIds, what) {
    const want = { n: [...new Set(nodeIds)].sort(), e: [...new Set(edgeIds)].sort() };
    const ok = await page
      .waitForFunction(
        (w) => {
          const n = window.cy.nodes().filter((x) => !x.isParent() && !x.visible()).map((x) => x.id()).sort();
          const e = window.cy.edges().filter((x) => !x.visible()).map((x) => x.id()).sort();
          return JSON.stringify(n) === JSON.stringify(w.n) && JSON.stringify(e) === JSON.stringify(w.e);
        },
        want,
        { timeout: 5000 },
      )
      .then(() => true, () => false);
    if (!ok) check(false, `${what}: hidden ${JSON.stringify(await page.evaluate(hiddenNow))}, expected ${JSON.stringify(want)}`);
  }
  const familyNodes = (f) => graph.nodes.filter((n) => n.family === f).map((n) => n.id);
  const familyEdges = (f) => graph.edges.filter((e) => familyOf[e.source] === f || familyOf[e.target] === f).map((e) => e.id);
  const kindEdges = (k) => graph.edges.filter((e) => e.kind === k).map((e) => e.id);
  for (const f of graph.families) {
    await page.uncheck(`#filters input[value="${f.id}"]`);
    await expectHidden(familyNodes(f.id), familyEdges(f.id), `family filter ${f.id}`);
    await page.check(`#filters input[value="${f.id}"]`);
    await expectHidden([], [], `family filter ${f.id} restored`);
  }
  const kinds = [...new Set(graph.edges.map((e) => e.kind))].sort();
  for (const k of kinds) {
    await page.uncheck(`#edge-filters input[value="${k}"]`);
    await expectHidden([], kindEdges(k), `edge kind filter ${k}`);
    await page.check(`#edge-filters input[value="${k}"]`);
    await expectHidden([], [], `edge kind filter ${k} restored`);
  }
  const k0 = kinds[0];
  const f0 = graph.families[0].id;
  await page.uncheck(`#edge-filters input[value="${k0}"]`);
  await page.uncheck(`#filters input[value="${f0}"]`);
  await expectHidden(familyNodes(f0), [...kindEdges(k0), ...familyEdges(f0)], `kind ${k0} and family ${f0} hidden`);
  await page.check(`#filters input[value="${f0}"]`);
  await expectHidden([], kindEdges(k0), `family ${f0} shown again, kind ${k0} still hidden`);
  await page.check(`#edge-filters input[value="${k0}"]`);
  await expectHidden([], [], 'all filters restored');

  // Focus: edges are faint by default; hovering or selecting a node draws its
  // edges and neighbors at full opacity and dims every other node.
  const neighborsOf = (id) => new Set([id, ...graph.edges.filter((e) => e.source === id).map((e) => e.target), ...graph.edges.filter((e) => e.target === id).map((e) => e.source)]);
  async function expectFocus(id, what) {
    const want = {
      nodes: Object.fromEntries(graph.nodes.map((n) => [n.id, id && !neighborsOf(id).has(n.id) ? app.DIM_OPACITY : 1])),
      edges: Object.fromEntries(graph.edges.map((e) => [e.id, id && (e.source === id || e.target === id) ? 1 : app.EDGE_OPACITY])),
    };
    const drawn = () => ({
      nodes: Object.fromEntries(window.cy.nodes().filter((n) => !n.isParent()).map((n) => [n.id(), parseFloat(n.style('opacity'))])),
      edges: Object.fromEntries(window.cy.edges().map((e) => [e.id(), parseFloat(e.style('opacity'))])),
    });
    const ok = await page
      .waitForFunction(
        (w) => {
          const close = (a, b) => Math.abs(a - b) < 0.01;
          const nodes = window.cy.nodes().filter((n) => !n.isParent());
          return nodes.every((n) => close(parseFloat(n.style('opacity')), w.nodes[n.id()])) &&
            window.cy.edges().every((e) => close(parseFloat(e.style('opacity')), w.edges[e.id()]));
        },
        want,
        { timeout: 5000 },
      )
      .then(() => true, () => false);
    if (!ok) {
      const now = await page.evaluate(drawn);
      const off = [
        ...Object.keys(want.nodes).filter((k) => Math.abs(now.nodes[k] - want.nodes[k]) >= 0.01).map((k) => `${k} ${now.nodes[k]} (want ${want.nodes[k]})`),
        ...Object.keys(want.edges).filter((k) => Math.abs(now.edges[k] - want.edges[k]) >= 0.01).map((k) => `${k} ${now.edges[k]} (want ${want.edges[k]})`),
      ];
      check(false, `${what}: ${off.slice(0, 6).join('; ')}${off.length > 6 ? ` and ${off.length - 6} more` : ''}`);
    }
  }
  const drawnPoint = (id) =>
    page.evaluate((nodeId) => {
      const pos = window.cy.getElementById(nodeId).renderedPosition();
      const box = window.cy.container().getBoundingClientRect();
      return { x: box.left + pos.x, y: box.top + pos.y };
    }, id);
  const emptyPoint = await page.evaluate(() => {
    const box = window.cy.container().getBoundingClientRect();
    return { x: box.left + 4, y: box.top + 4 };
  });
  await expectFocus(null, 'default (no focus)');
  // The default screenshot: nothing selected, nothing hovered.
  await page.mouse.move(0, 0);
  const emptyStart = await page.evaluate(() => {
    const box = window.cy.container().getBoundingClientRect();
    return { x: box.left + 4, y: box.top + 4 };
  });
  await page.mouse.move(emptyStart.x, emptyStart.y);
  await expectFocus(null, 'default before the screenshot');
  await page.screenshot({ path: screenshotPath });
  const hovered = graph.nodes.find((n) => n.id !== target && graph.edges.some((e) => e.source === n.id || e.target === n.id)).id;
  const hoverAt = await drawnPoint(hovered);
  await page.mouse.move(hoverAt.x, hoverAt.y);
  await expectFocus(hovered, `hover on ${hovered}`);
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expectFocus(null, 'hover ended');

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
  await expectFocus(target, `selection of ${target}`);
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expectFocus(target, `selection of ${target} kept after the pointer leaves`);

  await page.mouse.click(emptyPoint.x, emptyPoint.y);
  await expectFocus(null, 'selection cleared by clicking empty canvas');

  // The focus screenshot: phased-build selected, pointer away from the graph.
  const focusId = graph.nodes.some((n) => n.id === FOCUS_NODE) ? FOCUS_NODE : target;
  const focusAt = await drawnPoint(focusId);
  await page.mouse.click(focusAt.x, focusAt.y);
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expectFocus(focusId, `selection of ${focusId} for the focus screenshot`);
  await page.screenshot({ path: focusShotPath });
  check(pageErrors.length === 0, `page errors: ${pageErrors.join(' | ')}`);

  // The outline's positive case: serve a copy of graph.json in which one skill
  // states a score, and check the drawn outline, its label clearance, and the legend.
  const scored = structuredClone(graph);
  const scoredNode = scored.nodes.find((n) => n.kind === 'skill' && !n.vendored && !measured(n));
  scoredNode.eval_status = 'measured: 1/1';
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page2.route('**/data/graph.json', (route) => route.fulfill({ json: scored }));
  await page2.goto(base);
  await page2.waitForFunction(() => window.__graphReady === true || Boolean(window.__graphError), null, { timeout: 20000 });
  const error2 = await page2.evaluate(() => window.__graphError || null);
  check(!error2, `page with a scored node reported: ${error2}`);
  const outline = await page2.evaluate(({ id, width }) => {
    const cy = window.cy;
    const outlined = cy
      .nodes()
      .filter((n) => !n.isParent() && parseFloat(n.style('border-width')) >= width)
      .map((n) => ({ id: n.id(), width: parseFloat(n.style('border-width')), color: n.style('border-color') }));
    const node = cy.getElementById(id);
    const c = node.boundingBox({ includeLabels: false, includeOverlays: false });
    const l = node.boundingBox({ includeNodes: false, includeEdges: false, includeLabels: true, includeOverlays: false });
    const labelClear = !(l.x1 < c.x2 && c.x1 < l.x2 && l.y1 < c.y2 && c.y1 < l.y2);
    return { outlined, labelClear, legend: document.getElementById('legend').textContent };
  }, { id: scoredNode.id, width: app.MEASURED_OUTLINE.width });
  const expectedOutlined = scored.nodes.filter(measured).map((n) => n.id).sort();
  check(JSON.stringify(outline.outlined.map((o) => o.id).sort()) === JSON.stringify(expectedOutlined), `outlined nodes ${JSON.stringify(outline.outlined)}, expected ${expectedOutlined.join(', ')}`);
  const scoredOutline = outline.outlined.find((o) => o.id === scoredNode.id);
  check(
    scoredOutline.width === app.MEASURED_OUTLINE.width && scoredOutline.color.replace(/\s/g, '') === rgb(app.MEASURED_OUTLINE.color),
    `outline on ${scoredNode.id} is ${JSON.stringify(scoredOutline)}`,
  );
  check(outline.labelClear, `the label of ${scoredNode.id} overlaps its outlined circle`);
  check(outline.legend.includes(`(${expectedOutlined.length} ${expectedOutlined.length === 1 ? 'node' : 'nodes'})`), 'legend does not count the scored node');
  await page2.close();

  // Routing on a denser graph: scripts/fixtures/graph-routing.json is this
  // repo's graph with spec-writing and visual-loop added (32 nodes, 64 edges).
  // Its visual-loop -> impeccable edge cannot be routed by bending at the
  // midpoint alone, so this fails if the router stops trying other points.
  const dense = JSON.parse(await readFile(new URL('./fixtures/graph-routing.json', import.meta.url), 'utf8'));
  const page3 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page3.route('**/data/graph.json', (route) => route.fulfill({ json: dense }));
  await page3.goto(base);
  await page3.waitForFunction(() => window.__graphReady === true || Boolean(window.__graphError), null, { timeout: 20000 });
  const error3 = await page3.evaluate(() => window.__graphError || null);
  check(!error3, `page with the routing fixture reported: ${error3}`);
  const denseUnrouted = await page3.evaluate(() => window.__unroutedEdges || null);
  check(Array.isArray(denseUnrouted) && denseUnrouted.length === 0, `routing fixture: edges the page could not route around nodes: ${JSON.stringify(denseUnrouted)}`);
  await page3.close();
  result = { counts, target, outgoing, incoming, legibility, routing, packing, families: graph.families.length, kinds: kinds.length, scored: scoredNode.id, focusId, denseEdges: dense.edges.length };
} finally {
  await browser.close();
}

console.log(
  `OK: rendered ${result.counts.nodes} nodes and ${result.counts.edges} edges ` +
    `(JSON ${graph.nodes.length} and ${graph.edges.length}), ${result.counts.parents} families; ` +
    `clicked ${result.target}, panel shows Outgoing (${result.outgoing}) and Incoming (${result.incoming}); ` +
    `smallest label ${result.legibility.minFontPx.toFixed(1)} px, 0 labels over circles, ` +
    `${result.legibility.labelOnLabel} label pairs overlapping each other; ` +
    `0 edges over unconnected nodes (${result.routing.bent} bent around them); ` +
    `filters exact for ${result.families} families and ${result.kinds} edge kinds; ` +
    `focus checked for default, hover, selection, and clearing; ` +
    `boxes ordered by size, no lone last-row member, largest empty rectangle ${(result.packing.largestEmpty * 100).toFixed(1)}% of the canvas; ` +
    `outline drawn on ${result.scored} in a scored copy; routing fixture: all ${result.denseEdges} edges routed; wrote ${screenshotPath} (no focus) and ${focusShotPath} (${result.focusId} selected)`,
);
