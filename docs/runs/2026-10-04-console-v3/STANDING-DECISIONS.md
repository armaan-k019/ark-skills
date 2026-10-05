# Standing decisions for the v3 run

These are settled. Do not relitigate them, and do not ask about them.

- Two levels, not one dense screen. Home is for reading, detail pages hold the technical view.
- Home is written for someone who has never used Claude Code. Banned words are in UI.md section 8.
- Minimum sizes are floors, not targets. A container that cannot meet its floor shows a summary
  number and a link instead of shrinking (UI.md section 9).
- Contrast is measured, not eyeballed, and the measured number goes in the file.
- The console stays read only except for kill and dismiss, which keep their round 2 behavior and
  move to the Sessions detail page. Session delete stays refused: it writes to ~/.claude and
  destroys transcripts.
- No new dependency. Page checks keep using the existing Chrome DevTools Protocol driver.
- Usage is measurable, effectiveness is not. No skill-effectiveness claim appears in the UI.
- Every new assertion gets a mutant proving it can fail. A check that passes on the old page proves
  nothing.
- Values in UI.md are decided; where UI.md is silent, keep today's behavior and record the gap.
