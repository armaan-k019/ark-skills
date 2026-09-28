'use strict';
// The detail panel's contract, shared by smoke.mjs (real browser) and
// test_panel.cjs (fake DOM). No dependencies.
//
// readPanel() runs where `document` is the page's document and returns the
// panel as data. comparePanel() derives what the panel must show for a node
// from graph.json, independently of app.js, and lists every difference.

function readPanel() {
  const details = document.getElementById('details');
  const kids = (el) => Array.from(el.children);
  const text = (el) => el.textContent;
  const out = { nodeId: details.dataset.nodeId || null, heading: null, fields: {}, lists: {} };
  for (const child of kids(details)) {
    const tag = child.tagName.toLowerCase();
    if (tag === 'h2') out.heading = text(child);
    if (tag === 'dl') {
      let term = null;
      for (const item of kids(child)) {
        const t = item.tagName.toLowerCase();
        if (t === 'dt') term = text(item);
        if (t === 'dd' && term !== null) {
          out.fields[term] = text(item);
          term = null;
        }
      }
    }
    if (tag === 'section') {
      const h3 = kids(child).find((c) => c.tagName.toLowerCase() === 'h3');
      const list = kids(child).find((c) => c.tagName.toLowerCase() === 'ul');
      if (h3) out.lists[text(h3)] = list ? kids(list).map(text) : [];
    }
  }
  return out;
}

function edgeItem(graph, edge, end) {
  const other = graph.nodes.find((n) => n.id === edge[end]);
  const name = other ? other.name || other.id : edge[end];
  const where = Array.isArray(edge.lines) ? edge.lines.join(', ') : edge.line;
  return `${name} (${edge.kind}), ${edge.file}:${where}`;
}

function expectedPanel(graph, id) {
  const n = graph.nodes.find((x) => x.id === id);
  if (!n) throw new Error(`no node ${id} in graph.json`);
  const family = graph.families.find((f) => f.id === n.family);
  const outgoing = graph.edges.filter((e) => e.source === id).map((e) => edgeItem(graph, e, 'target')).sort();
  const incoming = graph.edges.filter((e) => e.target === id).map((e) => edgeItem(graph, e, 'source')).sort();
  return { node: n, familyLabel: family ? family.label : n.family, outgoing, incoming };
}

function comparePanel(panel, graph, id) {
  const problems = [];
  const want = expectedPanel(graph, id);
  const n = want.node;
  const f = panel.fields;
  const same = (label, actual, expected) => {
    if (actual !== expected) problems.push(`${label}: panel shows ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  };
  const has = (label, actual, part) => {
    if (typeof actual !== 'string' || !actual.includes(part)) problems.push(`${label}: panel shows ${JSON.stringify(actual)}, expected it to include ${JSON.stringify(part)}`);
  };

  same('node id', panel.nodeId, id);
  same('heading', panel.heading, n.name || n.id);
  same('Kind', f.Kind, n.kind);
  same('Family', f.Family, want.familyLabel);
  same('Description', f.Description, n.description);
  same('Path', f.Path, n.path);
  same('Lines', f.Lines, n.lines === undefined ? undefined : String(n.lines));
  if (n.origin) {
    if (n.origin.text) has('License origin', f['License origin'], n.origin.text);
    if (n.origin.license) has('License origin', f['License origin'], `license ${n.origin.license}`);
  } else {
    same('License origin', f['License origin'], 'not stated in the file');
  }
  if (n.license_notice) {
    has('License notice', f['License notice'], n.license_notice.text);
    has('License notice', f['License notice'], `${n.license_notice.file}:${n.license_notice.line}`);
  } else {
    same('License notice', f['License notice'], undefined);
  }
  if (n.kind === 'skill') {
    same('Eval status', f['Eval status'], n.eval_line ? `${n.eval_status} (${n.path}:${n.eval_line})` : n.eval_status);
  }
  if (Array.isArray(n.coverage)) {
    for (const c of n.coverage) has('Hook coverage', f['Hook coverage'], `${c.event} ${c.matcher || '(all tools)'}`);
  }
  for (const [title, items] of [['Outgoing', want.outgoing], ['Incoming', want.incoming]]) {
    const key = `${title} (${items.length})`;
    if (!(key in panel.lists)) {
      problems.push(`${title}: panel lists ${JSON.stringify(Object.keys(panel.lists))}, expected ${JSON.stringify(key)}`);
      continue;
    }
    const shown = panel.lists[key].slice().sort();
    same(`${title} items`, JSON.stringify(shown), JSON.stringify(items));
  }
  return problems;
}

module.exports = { readPanel, expectedPanel, comparePanel };
