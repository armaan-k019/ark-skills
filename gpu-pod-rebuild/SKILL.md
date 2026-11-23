---
name: gpu-pod-rebuild
description: Use when a rented GPU pod (RunPod or similar) has lost its data or been replaced and the app on it must be rebuilt from scratch, reconnected from the Mac over an SSH tunnel, and checked as working or not, without ever reading the person's API keys.
---

# GPU Pod Rebuild

A rented GPU pod can come back empty. When RunPod migrated our pod during the TidePool build (HackPrinceton), nothing came with it, and the app had to be rebuilt by hand. This skill is the order to do that in, plus the lines it never crosses.

Written for another Claude. Keep host names, pod IDs, IP addresses, and ports out of anything committed or posted; they belong in the person's own notes, not in a public repo.

## Hard rules

1. **Never read, print, copy, or store an API key or token.** That covers the Hugging Face login, the OpenAI key, and anything in `.env` files, `~/.cache/huggingface/`, shell history, or `env` output. Do not `cat` them, `echo` them, `grep` for them, or ask the person to paste one into the chat. The person types them into the pod themselves.
2. **Never stop or terminate the pod yourself.** If the person asks to stop it, give the warning in Step 6 first and wait for a plain yes.
3. **Report only what you checked.** "Working" means every service in the check list answered just now. A script that exited 0 is not a working app.

## Decisions to ask about (do not guess)

Ask these at the start of the first run. If the answers are already written down somewhere the person points you to, read them there instead.

- The names and paths of the rebuild script and the control script, and what arguments the control script takes (for example `start`, `stop`, `status`).
- Which services count as "up" (the editor, a model server, a worker, anything else), and for each one the port or URL that proves it is up.
- The editor's port on the pod and the local port to use on the Mac.
- The SSH command to reach the pod. Use the one RunPod's Connect panel shows; do not build one from memory. Ask whether the person runs the tunnel in their own terminal or wants you to run it.
- Where the persistent volume is mounted, if there is one, so you know which files survive a stop.
- Whether this is a fresh pod (run the rebuild) or an existing one that only needs the services restarted (skip to Step 3).

## Steps

### 1. Confirm the pod is reachable

Run the SSH command the person gave you with a harmless command (`hostname`, `nvidia-smi`). If it fails, stop and say which part failed (connection refused, auth, timeout). Do not retry in a loop.

### 2. Rebuild

Run the rebuild script on the pod. It installs the code and downloads the models, so it can take a long time; run it in the background or under `tmux`/`nohup` so a dropped SSH session does not kill it, and say where its log goes.

When it reaches a step that needs a key (the Hugging Face download, anything calling OpenAI), stop and hand over:

> The rebuild needs your Hugging Face login and OpenAI key now. On the pod, run the login and set the key yourself, then tell me "done". I will not read them.

After "done", check only that they are present, never their value. For example `hf auth whoami` (or `huggingface-cli whoami` on older installs) prints a username, not the token; a check such as `test -n "$OPENAI_API_KEY" && echo set` prints one word. If a key is meant to live in a file, check the file exists and is non-empty with `test -s`, not by reading it.

Read the end of the rebuild log. If any step failed, report the first failing step and its error line, and stop.

### 3. Start the services

Run the control script's start command. Then run its status command if it has one, and keep that output for Step 5.

### 4. Open the SSH tunnel

From the Mac, forward the editor port: `ssh -N -L` with the local port, `localhost`, and the pod's editor port, plus the connection details from the SSH command the person gave. If the person runs it, give them the exact single line to paste, with real values filled in and no placeholders. Then check from the Mac that the local port answers (`curl -sS -o /dev/null -w '%{http_code}'` against `http://127.0.0.1` and the local port).

### 5. Working or not

Check every service in the list from the decisions above, on the pod and through the tunnel. Then give the person one line first:

- **Working.** Every service answered, followed by one row per service with what you checked and what came back.
- **Not working: name of the service.** What you ran, what came back, and the one next step you would try.

If you could not run a check, say NOT RUN for that service and why. Never fill the gap with what usually happens.

### 6. Before anything stops the pod

If the person asks to stop the pod, or you see they are about to, warn them first, in plain words:

> Stopping this pod can wipe its disk. Last time a migration brought nothing back. Anything outside the persistent volume (code, installed packages, downloaded models) may have to be rebuilt. Do you still want to stop it?

List what would be lost if you can tell (for example, models downloaded outside the volume). Wait for a yes. Terminating is the person's action, never yours.

## Done means

- The rebuild log shows no failed step, or you reported the one that failed.
- The control script started the services.
- The tunnel answers on the Mac.
- The person has a "Working" or "Not working" line backed by checks run in this session.
- No key or token value appears anywhere in the transcript, a file you wrote, or a commit.
