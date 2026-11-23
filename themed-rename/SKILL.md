---
name: themed-rename
description: Use when a product is being renamed to a new theme or brand and every name a user can see (UI text, page titles, buttons, README) must change while internal names (env vars, package names, file paths, storage keys) stay put, ending with a search that proves no visible old name is left.
---

# Themed Rename

A rename has two halves that pull in opposite directions. Everything a person sees must change, or the product looks half-finished. Everything code depends on must stay, or the rename breaks deploys, imports, and saved user data. This skill keeps the two apart and ends with a search that proves the visible half is finished.

Written from the TidePool hackathon app (HackPrinceton), whose user-facing names were swept to one product theme.

## Decisions to ask about (do not guess)

Ask before changing anything:

- **The old names.** Every name being replaced, including short forms and earlier working titles. Offer the list you found (see Step 1) and let the person correct it; do not rename a word they did not confirm.
- **The new name, exactly as written.** Its capitalization is part of the name (`TidePool`, not `Tidepool` or `Tide Pool`). Ask whether any lowercase or spaced form is allowed anywhere visible, such as a URL or a domain.
- **Gray areas.** Whether these count as visible: code comments, log and console messages, error messages shown only in dev tools, URL paths and route names, page slugs, email or notification text, alt text and `aria-label`s, the browser tab title, the web manifest and favicon text, commit messages, and the repo description.
- **Images and video.** Text baked into logos, screenshots, or demo video cannot be found by a text search. Ask whether they are in scope; if so, list them for the person rather than claiming they are done.
- **Internal names to keep.** Confirm the default list below and ask about anything else that looks like an identifier.

Default internal names to leave alone: environment variable names, package and module names, import paths, file and folder names, local storage, cookie, and database keys, API field names, CSS class names and test IDs, analytics event names, and config keys. Renaming a storage key silently loses saved user data; renaming an env var breaks a deploy that still sets the old one.

## Steps

### 1. Inventory, and prove the search works

Search the repo for every case variant of each old name (`Old Name`, `OldName`, `oldName`, `old-name`, `old_name`, `OLD_NAME`, `oldname`), for example `git grep -n -i -E` with all variants joined by `|`. Include untracked files the app ships, and leave out `node_modules`, build output, and lockfiles.

Save this count. It must be above zero, because it is the proof that the final search can fail. If it is zero before you change anything, the search is wrong; fix it before going on.

### 2. Sort every hit

Put each hit in one of three buckets and show the person the sorted list:

- **Visible:** change it.
- **Internal:** keep it, with the reason (for example, a storage key).
- **Unsure:** ask. A string used both as a label and as a key goes here; split it into a key that stays and a label that changes.

### 3. Rename the visible hits

Change only the visible bucket. Write the new name with its exact capitalization every time. Keep surrounding grammar right (articles, plurals, possessives). Do not touch the internal bucket, and do not rename files or folders unless the person put them in the visible bucket.

### 4. Check nothing broke

Run the project's own build, typecheck, and tests, and open the app if it can run. Report each as PASS, FAIL, or NOT RUN, as `verify-before-done` does.

### 5. Final search

Run the Step 1 search again. Every hit left must be in the internal bucket, with its reason. Report the count of visible hits, which must be 0, next to the Step 1 count.

Then check the new name's capitalization: search case-insensitively for the new name and list every visible hit that is not spelled exactly right (for TidePool, `git grep -n -i tidepool` and drop the lines that contain `TidePool`, then drop internal ones). That list must be empty too.

## Report

- Old names and the exact new name, as confirmed.
- Step 1 count and final count, with each remaining hit and why it stays.
- Wrong-capitalization hits: 0, or the list.
- Build, typecheck, tests: PASS, FAIL, or NOT RUN each.
- Anything not searchable (images, video, external sites, app store text) listed as not done, not as done.
