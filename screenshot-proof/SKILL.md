---
name: screenshot-proof
description: Take desktop and phone screenshots of a running web page with one script, check them, and hand them to the person as proof that a UI change works, saved where they can open them. Use after any user-visible change to a site or demo, before opening a PR for one, when asked for screenshots or "show me what it looks like", and when another skill (visual-loop, recruiter-demo-writer, verify-before-done) asks for a screenshot of a state.
---

# Screenshot Proof

Almost every UI thread on armaankazi.com in October 2026 ended the same way: start the dev server, write a one-off Playwright script, take a desktop and a phone shot, look at them, copy them to the project folder, attach them to the reply. Each thread wrote that script again. This skill is the script plus the rules that made those screenshots worth trusting. It is the mechanics only: `visual-loop` decides what states to show and who judges them, `verify-before-done` decides whether the work is done.

Written from the project-files folders those threads left (`bird-guide/`, `chooser/`, `dlr-demo/`, `warp-demo/`, `home-buttons/`, `storybook/`, `kazi-lab-ui/`, and others), not adapted from a third party.

## Step 1: Run the real page

Start the app the way the project says (its CLAUDE.md or `run` skill), on a port nothing else holds. Screenshot a production build (`next build` then `next start`) when the result depends on rendering, such as word counts or anything that differs between dev and production. Note which one you used in the report.

## Step 2: Take the shots

```sh
node <ark-skills>/screenshot-proof/scripts/shoot.mjs --out <dir> \
  http://localhost:3000/demos/dlr=dlr http://localhost:3000/=chooser
```

- Two viewports every time: desktop 1280 by 800 and phone 390 by 844 (the sizes `recruiter-demo-writer` uses). `--only desktop` or `--only phone` when one is all that changed.
- `--full` for a full-page shot; default is what loads above the fold, which is what a first-time visitor sees.
- Three.js, canvas, or animated pages need `--wait-for <css>` or `--wait <ms>`, or the shot catches an empty frame.
- For a state that needs a click or typing (an open modal, a chat answer, a selected node), write a short Playwright step for that state instead of shooting the default page and describing the rest.

The script prints, per page and viewport: HTTP status, rendered words in `<main>`, horizontal overflow, page errors, console errors, and failed requests. It exits 1 on any HTTP status of 400 or more or an uncaught page error. A failing page is a result to report, not a screenshot to send.

`shoot.mjs` loads Playwright from wherever Node can resolve it. In Claude Code cloud sessions Chromium and Playwright are preinstalled. On a Mac, run it from a project that has Playwright installed.

## Step 3: Look at every image yourself

Open each PNG and check it before anyone else sees it. Things those threads caught only by looking: an empty Three.js canvas, a modal behind the navbar, text overflowing on phone, a chat bubble cut off. A shot you did not look at is not evidence.

## Step 4: Save where the person can open it

In a project, save to the shared folder under a subfolder named for the work: `/mnt/project-files/<topic>/<label>-desktop.png`, for example `dlr-demo/` or `home-buttons/`. Re-read the folder after writing, since it is a network mount. Outside a project, save to the session's scratchpad or the repo's ignored output folder. Never commit screenshots to the app repo unless asked.

Attach the files to the reply that reports the change. Name the state each one shows ("chat open after asking about demos, phone").

## What a screenshot cannot prove

Say these plainly in the report instead of letting a picture imply them:

- **Live API calls.** Cloud sessions in this project had no `ANTHROPIC_API_KEY`, so Warp and DLR were screenshotted with a stand-in response. Label any stand-in as one, and tell the person to load the deployed page once.
- **Deployed behavior.** The cloud network policy blocked armaankazi.com and Vercel previews, so a local build is the closest check. Give the preview link for the person to open.
- **Interaction.** A still shows one state. Hover, drag, and animation need a sequence of shots or a description of what was tested.

## Checklist

- The page ran from a real build, and the report says dev or production.
- Desktop and phone, unless only one changed.
- The script exited 0, or its failures are in the report.
- You opened every image.
- Files are in the project folder (or scratchpad), named by label and viewport, and attached to the reply with the state each shows.
- Anything the screenshots cannot prove is stated.
