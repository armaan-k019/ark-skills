#!/usr/bin/env node
'use strict';
// Run: node hooks/test-hooks.js
// Feeds sample Claude Code hook payloads to each hook and checks the exit code
// (0 = allowed, 2 = blocked).

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EM = '—';
const dir = __dirname;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ark-hooks-'));
const existingTsconfig = path.join(tmp, 'tsconfig.json');
const existingEslint = path.join(tmp, 'eslint.config.mjs');
const legacyDoc = path.join(tmp, 'legacy.md');
fs.writeFileSync(existingTsconfig, '{}');
fs.writeFileSync(existingEslint, 'export default [];');
fs.writeFileSync(legacyDoc, `old line ${EM} with a dash\n`);

const cases = [
  // config-protection
  ['config-protection', { tool_name: 'Edit', tool_input: { file_path: existingTsconfig } }, 2],
  ['config-protection', { tool_name: 'Write', tool_input: { file_path: existingEslint } }, 2],
  ['config-protection', { tool_name: 'Edit', tool_input: { file_path: path.join(tmp, 'tsconfig.app.json') } }, 0],
  ['config-protection', { tool_name: 'Write', tool_input: { file_path: path.join(tmp, 'new', '.prettierrc') } }, 0],
  ['config-protection', { tool_name: 'Edit', tool_input: { file_path: path.join(tmp, 'src', 'index.ts') } }, 0],
  ['config-protection', {}, 0],

  // no-em-dash
  ['no-em-dash', { tool_name: 'Write', tool_input: { file_path: path.join(tmp, 'new.md'), content: `a ${EM} b` } }, 2],
  ['no-em-dash', { tool_name: 'Write', tool_input: { file_path: path.join(tmp, 'new.md'), content: 'a, b' } }, 0],
  ['no-em-dash', { tool_name: 'Write', tool_input: { file_path: legacyDoc, content: `old line ${EM} with a dash\nnew line\n` } }, 0],
  ['no-em-dash', { tool_name: 'Write', tool_input: { file_path: legacyDoc, content: `old ${EM} one\nnew ${EM} two\n` } }, 2],
  ['no-em-dash', { tool_name: 'Edit', tool_input: { file_path: 'x.ts', old_string: 'a', new_string: `// note ${EM} here` } }, 2],
  ['no-em-dash', { tool_name: 'Edit', tool_input: { file_path: 'x.md', old_string: `keep ${EM} this`, new_string: `keep ${EM} this, edited` } }, 0],
  ['no-em-dash', { tool_name: 'Edit', tool_input: { file_path: 'x.md', old_string: `a ${EM} b`, new_string: 'a, b' } }, 0],
  ['no-em-dash', { tool_name: 'MultiEdit', tool_input: { file_path: 'x.md', edits: [{ old_string: 'a', new_string: `b ${EM}` }] } }, 2],
  ['no-em-dash', { tool_name: 'Bash', tool_input: { command: `git commit -m "feat: add x ${EM} and y"` } }, 2],
  ['no-em-dash', { tool_name: 'Bash', tool_input: { command: `gh pr create --title "a ${EM} b"` } }, 2],
  ['no-em-dash', { tool_name: 'Bash', tool_input: { command: 'git commit -m "feat: add x and y"' } }, 0],
  ['no-em-dash', { tool_name: 'Bash', tool_input: { command: `grep -c "${EM}" README.md` } }, 0],

  // block-no-verify
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git commit --no-verify -m "x"' } }, 2],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git add . && git commit -n -m "x"' } }, 2],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git push --no-verify origin main' } }, 2],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git -c core.hooksPath=/dev/null commit -m x' } }, 2],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git commit -m "fix: parser"' } }, 0],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'git push -n origin main' } }, 0],
  ['block-no-verify', { tool_name: 'Bash', tool_input: { command: 'npm run build -- --no-verify' } }, 0],
  ['block-no-verify', {}, 0],
];

let failed = 0;
for (const [hook, payload, expected] of cases) {
  const res = spawnSync('node', [path.join(dir, `${hook}.js`)], { input: JSON.stringify(payload), encoding: 'utf8' });
  const ok = res.status === expected;
  if (!ok) failed++;
  const label = JSON.stringify(payload.tool_input || {}).slice(0, 70);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${hook} expected=${expected} got=${res.status} ${label}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} of ${cases.length} failed` : `\nall ${cases.length} passed`);
process.exit(failed ? 1 : 0);
