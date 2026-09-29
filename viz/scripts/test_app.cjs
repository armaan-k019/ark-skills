'use strict';
// Node tests for the page's data functions (no browser, no dependencies).
// Run: node --test viz/scripts/test_app.cjs
// These check the data-to-elements mapping and the detail lookup. They do not
// render anything; the rendered page is checked by scripts/smoke.mjs.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = require('../app.js');
const graph = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'graph.json'), 'utf8'));

test('graph.json passes the page-side shape check', () => {
  assert.equal(app.checkGraph(graph), graph);
});

test('one element per node, family, and edge', () => {
  const els = app.toElements(graph);
  const parents = els.filter((e) => e.data.kind === 'family');
  const nodes = els.filter((e) => e.group === 'nodes' && e.data.kind !== 'family');
  const edges = els.filter((e) => e.group === 'edges');
  assert.equal(nodes.length, graph.nodes.length);
  assert.equal(parents.length, graph.families.length);
  assert.equal(edges.length, graph.edges.length);
});

test('every node sits inside its family parent', () => {
  const els = app.toElements(graph);
  const parentIds = new Set(els.filter((e) => e.data.kind === 'family').map((e) => e.data.id));
  for (const n of els.filter((e) => e.group === 'nodes' && e.data.kind !== 'family')) {
    assert.ok(parentIds.has(n.data.parent), `${n.data.id} has no parent ${n.data.parent}`);
  }
});

test('node details list exactly the edges touching the node', () => {
  for (const n of graph.nodes) {
    const info = app.nodeDetails(graph, n.id);
    assert.equal(info.outgoing.length, graph.edges.filter((e) => e.source === n.id).length);
    assert.equal(info.incoming.length, graph.edges.filter((e) => e.target === n.id).length);
  }
  assert.equal(app.nodeDetails(graph, 'skill:does-not-exist'), null);
});

test('shape check rejects a missing endpoint and an unknown family', () => {
  const badEdge = structuredClone(graph);
  badEdge.edges.push({ id: 'x', source: 'skill:phased-build', target: 'skill:nope' });
  assert.throws(() => app.checkGraph(badEdge), /missing endpoint/);
  const badFamily = structuredClone(graph);
  badFamily.nodes[0].family = 'readme:nope';
  assert.throws(() => app.checkGraph(badFamily), /unknown family/);
  assert.throws(() => app.checkGraph({ nodes: [] }), /expected shape/);
  const dupEdge = structuredClone(graph);
  dupEdge.edges.push({ ...dupEdge.edges[0] });
  assert.throws(() => app.checkGraph(dupEdge), /duplicate id/);
  const badKind = structuredClone(graph);
  badKind.nodes[0].kind = 'command';
  assert.throws(() => app.checkGraph(badKind), /unknown kind/);
});

test('a node is measured only when its eval status states a score', () => {
  assert.equal(app.isMeasured({ eval_status: 'measured: 8/8' }), true);
  assert.equal(app.isMeasured({ eval_status: 'unmeasured' }), false);
  assert.equal(app.isMeasured({}), false);
  const one = structuredClone(graph);
  one.nodes[0].eval_status = 'measured: 8/8';
  const flags = app.toElements(one).filter((e) => e.group === 'nodes' && e.data.kind !== 'family').map((e) => e.data.measured);
  assert.equal(flags.filter(Boolean).length, 1);
  assert.equal(app.toElements(graph).filter((e) => e.data.measured).length, graph.nodes.filter(app.isMeasured).length);
});

test('labels may wrap at hyphens and keep their text', () => {
  const zwsp = String.fromCharCode(0x200b);
  assert.equal(app.nodeLabel('verify-before-done'), `verify-${zwsp}before-${zwsp}done`);
  assert.equal(app.nodeLabel('verify-before-done').split(zwsp).join(''), 'verify-before-done');
});

test('kind colors are three distinct colors', () => {
  assert.deepEqual(Object.keys(app.KIND_COLORS), ['skill', 'agent', 'hook']);
  assert.equal(new Set(Object.values(app.KIND_COLORS)).size, 3);
});

test('node size grows with line count and tolerates a missing count', () => {
  assert.equal(app.nodeSize(undefined), 16);
  assert.ok(app.nodeSize(762) > app.nodeSize(46));
});
