'use strict';
// Runs the page's family layout in the vendored Cytoscape.js, headless (no
// browser), and checks that families are clustered: no two family boxes
// overlap, and every node sits inside its own family's box and no other.
// Run: node --test viz/scripts/test_layout.cjs

const test = require('node:test');
const assert = require('node:assert/strict');
const cytoscape = require('../vendor/cytoscape.min.js');
const app = require('../app.js');
const graph = require('../data/graph.json');

function laidOut() {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: app.toElements(graph),
    style: [{ selector: 'node[size]', style: { width: 'data(size)', height: 'data(size)' } }],
  });
  app.layoutFamilies(cy, graph);
  return cy;
}

const inside = (p, bb) => p.x >= bb.x1 && p.x <= bb.x2 && p.y >= bb.y1 && p.y <= bb.y2;
const overlap = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

test('family cells do not overlap at any viewport shape', () => {
  const counts = graph.families.map((f) => ({ id: f.id, count: graph.nodes.filter((n) => n.family === f.id).length }));
  const box = (c) => ({ x1: c.x1, y1: c.y1, x2: c.x1 + c.w, y2: c.y1 + c.h });
  for (const aspect of [0.5, 1, 1.12, 2, 4]) {
    const cells = app.familyCells(counts, aspect);
    assert.equal(cells.length, counts.length);
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        assert.ok(!overlap(box(cells[i]), box(cells[j])), `aspect ${aspect}: ${cells[i].id} and ${cells[j].id} overlap`);
      }
    }
  }
});

test('no family ends with a lone member in its last row', () => {
  for (let n = 2; n <= 30; n++) {
    const cols = app.familyColumns(n);
    const last = n - cols * (Math.ceil(n / cols) - 1);
    assert.ok(cols >= Math.ceil(Math.sqrt(n)), `n=${n}: ${cols} columns is fewer than ceil(sqrt(n))`);
    assert.ok(last >= 2, `n=${n}: ${cols} columns leaves ${last} in the last row`);
  }
});

test('family cells are ordered by member count, largest first', () => {
  const counts = graph.families.map((f) => ({ id: f.id, count: graph.nodes.filter((n) => n.family === f.id).length }));
  const placed = app.familyCells(counts, 1.08).map((c) => c.count);
  assert.deepEqual(placed, [...placed].sort((a, b) => b - a));
  assert.equal(placed.length, counts.length);
});

test('family cells read from most members to fewest, row by row', () => {
  // Reading order is rows top to bottom, then cells left to right. A packer
  // that lets a smaller family fill a gap in an earlier row breaks it; this
  // repo's own counts did so in a square viewport.
  const own = graph.families.map((f) => graph.nodes.filter((n) => n.family === f.id).length);
  for (const set of [own, [7, 5, 5, 4, 3, 3, 2, 2], [9, 6, 4, 4, 3, 2]]) {
    for (const aspect of [0.5, 1, 1.12, 1.3, 2, 4]) {
      const cells = app.familyCells(set.map((count, i) => ({ id: `f${i}`, count })), aspect);
      const rows = [...new Set(cells.map((c) => c.y1))].sort((a, b) => a - b);
      const reading = rows.flatMap((y) => cells.filter((c) => c.y1 === y).sort((a, b) => a.x1 - b.x1)).map((c) => c.count);
      reading.forEach((count, i) => {
        assert.ok(i === 0 || count <= reading[i - 1], `counts ${set} at aspect ${aspect} read ${reading}`);
      });
    }
  }
});

test('a wide viewport gets more cell columns than a tall one', () => {
  const counts = graph.families.map((f) => ({ id: f.id, count: graph.nodes.filter((n) => n.family === f.id).length }));
  const columns = (aspect) => new Set(app.familyCells(counts, aspect).map((c) => c.x1)).size;
  assert.ok(columns(4) > columns(0.25), `wide ${columns(4)} vs tall ${columns(0.25)}`);
});

test('rendered family boxes do not overlap and hold only their own members', () => {
  const cy = laidOut();
  try {
    const parents = cy.nodes(':parent');
    assert.equal(parents.length, graph.families.length);
    const boxes = parents.map((p) => ({ id: p.id(), bb: p.boundingBox() }));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        assert.ok(!overlap(boxes[i].bb, boxes[j].bb), `${boxes[i].id} and ${boxes[j].id} overlap`);
      }
    }
    const members = cy.nodes().filter((n) => !n.isParent());
    assert.equal(members.length, graph.nodes.length);
    members.forEach((n) => {
      const own = n.parent().id();
      assert.equal(own, app.FAMILY_PREFIX + n.data('family'), `${n.id()} is in the wrong family box`);
      for (const b of boxes) {
        const shouldContain = b.id === own;
        assert.equal(inside(n.position(), b.bb), shouldContain, `${n.id()} ${shouldContain ? 'outside' : 'inside'} ${b.id}`);
      }
    });
  } finally {
    cy.destroy();
  }
});
