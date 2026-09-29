'use strict';
// Runs the real viz/app.js against a small fake DOM, fake fetch, and a fake
// Cytoscape, taps every node, and checks each detail panel with the same
// contract smoke.mjs uses (panel-check.cjs). No browser, no dependencies.
// This checks the page's logic; it does not check drawing. smoke.mjs does that.
// Run: node --test viz/scripts/test_panel.cjs

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { readPanel, comparePanel } = require('./panel-check.cjs');

const VIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(VIZ, 'app.js'), 'utf8');
const GRAPH = JSON.parse(fs.readFileSync(path.join(VIZ, 'data', 'graph.json'), 'utf8'));

class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.childNodes = [];
    this.dataset = {};
    this.listeners = {};
    this.style = {};
    this.className = '';
  }
  get children() {
    return this.childNodes.filter((c) => c instanceof FakeElement);
  }
  get textContent() {
    return this.childNodes.map((c) => (c instanceof FakeElement ? c.textContent : c)).join('');
  }
  set textContent(value) {
    this.childNodes = [String(value)];
  }
  append(...items) {
    for (const item of items) this.childNodes.push(item instanceof FakeElement ? item : String(item));
  }
  replaceChildren(...items) {
    this.childNodes = [];
    this.append(...items);
  }
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  }
}

function fakeCytoscape(state) {
  return function cytoscape(options) {
    state.options = options;
    const nodes = options.elements.filter((e) => e.group === 'nodes');
    const handlers = {};
    const cy = {
      on(event, selector, fn) {
        handlers[`${event} ${selector}`] = fn;
      },
      tap(id) {
        const el = nodes.find((n) => n.data.id === id);
        handlers['tap node']({ target: { id: () => id, data: (k) => el.data[k] } });
      },
      nodes() {
        return { filter: () => ({ addClass() {}, removeClass() {} }) };
      },
      edges() {
        return { forEach() {}, filter: () => ({ addClass() {}, removeClass() {} }) };
      },
      getElementById() {
        return { children: () => ({ layout: () => ({ run() {} }) }) };
      },
      layout() {
        let done = null;
        return { one: (_e, fn) => { done = fn; }, run: () => done && done() };
      },
      fit() {},
      width: () => 0,
      height: () => 0,
    };
    state.cy = cy;
    return cy;
  };
}

async function loadPage(source = APP, graph = GRAPH) {
  const ids = ['graph', 'status', 'legend', 'filters', 'edge-filters', 'details'];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id === 'graph' ? 'main' : 'div')]));
  const state = {};
  const window = {};
  const context = {
    window,
    document: {
      getElementById: (id) => elements[id] || null,
      createElement: (tag) => new FakeElement(tag),
    },
    fetch: async () => ({ ok: true, status: 200, statusText: 'OK', json: async () => structuredClone(graph) }),
  };
  window.cytoscape = fakeCytoscape(state);
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'app.js' });
  for (let i = 0; i < 20 && !window.__graphReady && !window.__graphError; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  const panel = () => vm.runInContext(`(${readPanel.toString()})()`, context);
  return { window, state, elements, panel };
}

test('the page renders and signals ready', async () => {
  const page = await loadPage();
  assert.equal(page.window.__graphError, undefined);
  assert.equal(page.window.__graphReady, true);
  assert.match(page.elements.status.textContent, new RegExp(`^${GRAPH.nodes.length} nodes, ${GRAPH.edges.length} edges`));
  assert.equal(page.elements.filters.children.length, GRAPH.families.length);
  const legend = page.elements.legend.textContent;
  for (const kind of ['skill', 'agent', 'hook']) {
    assert.ok(legend.includes(`${kind} (${GRAPH.nodes.filter((n) => n.kind === kind).length})`), `legend: ${kind}`);
  }
  assert.ok(legend.includes("Node size: grows with the square root of the file's line count"), 'legend: node size');
  const vendored = GRAPH.nodes.filter((n) => n.vendored).length;
  assert.ok(legend.includes(`dashed border: vendored, carried from another repository (${vendored} nodes)`), 'legend: vendored');
  const swatches = page.elements.legend.children[1].children.map((li) => li.children[0]).filter((s) => s && s.dataset.kind);
  assert.deepEqual(swatches.map((s) => [s.dataset.kind, s.style.backgroundColor]), [['skill', '#1f77b4'], ['agent', '#ff7f0e'], ['hook', '#2ca02c']]);
  const kinds = new Set(GRAPH.edges.map((e) => e.kind));
  assert.equal(page.elements['edge-filters'].children.length, kinds.size);
  for (const label of page.elements['edge-filters'].children) {
    const kind = label.children[0].value;
    assert.ok(label.textContent.endsWith(`${kind} (${GRAPH.edges.filter((e) => e.kind === kind).length})`), label.textContent);
  }
});

test('every node panel matches graph.json', async () => {
  const page = await loadPage();
  for (const node of GRAPH.nodes) {
    page.state.cy.tap(node.id);
    const problems = comparePanel(page.panel(), GRAPH, node.id);
    assert.deepEqual(problems, [], `${node.id}: ${problems.join('; ')}`);
  }
});

test('a broken graph.json is reported on the page, not rendered', async () => {
  const bad = structuredClone(GRAPH);
  bad.edges.push({ id: 'x', source: bad.nodes[0].id, target: 'skill:nope' });
  const page = await loadPage(APP, bad);
  assert.equal(page.window.__graphReady, undefined);
  assert.match(page.window.__graphError, /missing endpoint/);
  assert.match(page.elements.status.textContent, /missing endpoint/);
});

// The panel check must catch a page that shows the wrong thing. Each mutant
// breaks app.js in one way that review gate 2 showed an earlier check missed.
const MUTANTS = [
  ['origin read from the wrong key', "if (n.origin) {", 'if (n.license_origin) {'],
  ['path row removed', "field(dl, 'Path', n.path);", ''],
  ['eval status under the wrong label', "field(dl, 'Eval status',", "field(dl, 'Lines',"],
  ["edge ends swapped", "edgeList('Outgoing', info.outgoing, graph, 'target')", "edgeList('Outgoing', info.outgoing, graph, 'source')"],
  ['origin cites the wrong line', '`${n.path}:${n.origin.line}`', '`${n.path}:${n.origin.line + 1}`'],
  ['body origin labelled as frontmatter', "n.origin.from === 'body' ?", "n.origin.from !== 'body' ?"],
  ['extra hook coverage entry', ".join('; '));", ".join('; ') + '; PostToolUse Fake');"],
];

for (const [name, from, to] of MUTANTS) {
  test(`panel check catches a mutant: ${name}`, async () => {
    assert.ok(APP.includes(from), `mutation anchor not found: ${from}`);
    const page = await loadPage(APP.replace(from, to));
    const failing = GRAPH.nodes.filter((n) => {
      page.state.cy.tap(n.id);
      return comparePanel(page.panel(), GRAPH, n.id).length > 0;
    });
    assert.ok(failing.length > 0, 'no node panel failed the check');
  });
}
