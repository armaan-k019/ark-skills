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

test('family cells do not overlap', () => {
  const counts = graph.families.map((f) => ({ id: f.id, count: graph.nodes.filter((n) => n.family === f.id).length }));
  const cells = app.familyCells(counts);
  const box = (c) => ({ x1: c.x1, y1: c.y1, x2: c.x1 + c.w, y2: c.y1 + c.h });
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      assert.ok(!overlap(box(cells[i]), box(cells[j])), `${cells[i].id} and ${cells[j].id} overlap`);
    }
  }
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
