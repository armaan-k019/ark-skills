#!/usr/bin/env node
'use strict';
// PreToolUse (Write|Edit|MultiEdit|Bash): block any tool call that ADDS an
// em dash (U+2014). Existing em dashes in files are not a problem on their
// own; an edit is blocked only if its new text contains more em dashes than
// the text it replaces. For Bash, only commit, tag, and gh PR/issue commands
// are checked, since those publish text.
//
// Opt-out for vendored code: set ARK_EM_DASH_ALLOW_PATHS to a colon-separated
// list of path substrings (e.g. "/skill-creator/:/node_modules/").

const fs = require('fs');
const { readInput, block } = require('./_input');

const EM = '—';
const count = (s) => (typeof s === 'string' ? s.split(EM).length - 1 : 0);

const MESSAGE =
  'BLOCKED by no-em-dash: this adds an em dash. The user never wants em dashes in any output ' +
  '(prose, comments, commit messages, copy). Use a comma, colon, period, or parentheses instead, then retry.';

const input = readInput();
const tool = input.tool_name || '';
const ti = input.tool_input || {};

const allow = (process.env.ARK_EM_DASH_ALLOW_PATHS || '').split(':').filter(Boolean);
const filePath = ti.file_path || '';
if (filePath && allow.some((p) => filePath.includes(p))) process.exit(0);

if (tool === 'Write') {
  let before = 0;
  try {
    before = count(fs.readFileSync(filePath, 'utf8'));
  } catch {
    before = 0;
  }
  if (count(ti.content) > before) block(MESSAGE);
} else if (tool === 'Edit') {
  if (count(ti.new_string) > count(ti.old_string)) block(MESSAGE);
} else if (tool === 'MultiEdit') {
  const edits = Array.isArray(ti.edits) ? ti.edits : [];
  const added = edits.reduce((n, e) => n + count(e.new_string) - count(e.old_string), 0);
  if (added > 0) block(MESSAGE);
} else if (tool === 'Bash') {
  const cmd = ti.command || '';
  const publishes = /\bgit\s+(commit|tag)\b|\bgh\s+(pr|issue)\b/.test(cmd);
  if (publishes && count(cmd) > 0) block(MESSAGE);
}
process.exit(0);
