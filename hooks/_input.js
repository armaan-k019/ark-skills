'use strict';
// Shared helper: read the Claude Code hook payload from stdin.
// Returns {} on empty or malformed input so hooks fail open rather than
// blocking every tool call if the payload format changes.
const fs = require('fs');

function readInput() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return {};
  }
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function block(message) {
  process.stderr.write(message + '\n');
  process.exit(2);
}

module.exports = { readInput, block };
