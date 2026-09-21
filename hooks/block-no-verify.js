#!/usr/bin/env node
'use strict';
// PreToolUse (Bash): block git commands that skip git hooks
// (--no-verify, commit -n, or -c core.hooksPath=...).
//
// Idea from ECC scripts/hooks/block-no-verify.js (MIT, see
// licenses/ECC-LICENSE). This is a much simpler pattern match than ECC's
// argument parser. Known trade-off: a commit MESSAGE that contains the literal
// text "--no-verify" will also be blocked; rephrase the message.

const { readInput, block } = require('./_input');

const input = readInput();
if (input.tool_name && input.tool_name !== 'Bash') process.exit(0);
const cmd = (input.tool_input && input.tool_input.command) || '';

// Split on shell separators so each git invocation is checked on its own.
const segments = cmd.split(/&&|\|\||;|\n|\|/);
for (const seg of segments) {
  if (!/\bgit\b/.test(seg)) continue;
  const bypass =
    /(^|\s)--no-verify(\s|=|$)/.test(seg) ||
    /-c\s+core\.hookspath=/i.test(seg) ||
    /\bcommit\b.*(^|\s)-n(\s|$)/.test(seg);
  if (bypass) {
    block(
      'BLOCKED by block-no-verify: skipping git hooks is not allowed. ' +
      'Fix whatever the pre-commit or pre-push hook is reporting, then commit normally. ' +
      'If the hook itself is broken, stop and tell the user.'
    );
  }
}
process.exit(0);
