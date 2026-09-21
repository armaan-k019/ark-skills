#!/usr/bin/env node
'use strict';
// PreToolUse (Edit|Write|MultiEdit): block edits to existing linter,
// formatter, and TypeScript config files, so the agent fixes the code
// instead of weakening the check. Creating a new config file is allowed.
//
// Adapted from ECC scripts/hooks/config-protection.js (MIT, see
// licenses/ECC-LICENSE). Change from ECC: tsconfig files are protected too.

const fs = require('fs');
const path = require('path');
const { readInput, block } = require('./_input');

const PROTECTED = new Set([
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json',
  '.eslintrc.yml', '.eslintrc.yaml',
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs',
  'eslint.config.ts', 'eslint.config.mts', 'eslint.config.cts',
  '.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json',
  '.prettierrc.yml', '.prettierrc.yaml',
  'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs',
  'biome.json', 'biome.jsonc',
  '.ruff.toml', 'ruff.toml',
  'tsconfig.json',
  '.stylelintrc', '.stylelintrc.json', '.stylelintrc.yml',
  '.markdownlint.json', '.markdownlint.yaml', '.markdownlintrc',
]);

function isProtected(basename) {
  const lower = basename.toLowerCase();
  if (PROTECTED.has(lower)) return true;
  // tsconfig.base.json, tsconfig.app.json, etc.
  return /^tsconfig\..+\.json$/.test(lower);
}

function exists(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (err) {
    // Only a genuine "not found" counts as absent; any other error fails closed.
    return !(err && err.code === 'ENOENT');
  }
}

const input = readInput();
const filePath = (input.tool_input && (input.tool_input.file_path || input.tool_input.path)) || '';
if (!filePath) process.exit(0);

const base = path.basename(filePath);
if (isProtected(base) && exists(filePath)) {
  block(
    `BLOCKED by config-protection: ${base} is a lint/format/type config. ` +
    'Fix the code to satisfy the check instead of changing the config. ' +
    'If the config change is what the user actually asked for, stop and ask them to make it or to disable this hook.'
  );
}
process.exit(0);
