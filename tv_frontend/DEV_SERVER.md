# Dev server behavior

- Vite is configured to:
  - Bind to 0.0.0.0 (host: true)
  - Use PORT from `.env` if provided, else 3000 (read once at startup)
  - Enforce strictPort so it does not change ports automatically
  - Ignore changes to `.env`, `.env.*`, `post_process_status.lock`, `vite.config.*`, and `index.html` during dev to prevent rapid restart loops
  - Restrict file system access (fs.strict) to avoid watching unexpected paths
  - Extra stability: watch.awaitWriteFinish and ignoring lockfiles/node_modules to avoid thrashing or noisy file touches

Run locally:
- npm install
- npm run dev (binds 0.0.0.0:3000 with strictPort)
- Or: npm run dev:stable (same as above)
- Access on http://localhost:3000

CI/containers:
- Prefer using: npm run dev or npm run dev:ci
  - Both commands use the stable launcher (bin/start-dev.js) which first checks if port 3000 is already in use and exits 0 if so, assuming the dev server is already healthy.
  - If the port is free, it starts Vite on 0.0.0.0:3000 with strictPort.

Reuse existing dev server on port 3000:
- If `npm run dev` outputs `Error: Port 3000 is already in use`, it means another healthy instance is already running and serving at http://localhost:3000.
- With `strictPort: true`, Vite will not change ports. Reuse the running instance instead of starting another.
- To inspect the listener in the container: `ss -ltnp | grep :3000`
- To stop it if truly needed: `kill <PID>` (gracefully), reserve `kill -9 <PID>` as last resort.

Stability checklist (to avoid restarts/reloads):
- Do not run scripts that touch:
  - `.env`, `.env.*`
  - `vite.config.*`
  - `index.html`
  - `post_process_status.lock`
- These files are already ignored by the dev server watch to prevent loops. Avoid writing to them while dev server is running to keep hot reloads stable.
- Avoid installing/upgrading packages (lockfiles) during a running dev session; lockfiles and `node_modules` are ignored but may cause transient noise.
- HMR is configured to use `ws` over `0.0.0.0` with clientPort 3000 for container stability.

Notes:
- Do not run any script or watcher that writes to `.env`, `vite.config.*`, or `index.html` during `npm run dev`. This will cause unnecessary restarts or instability.
- For containers/CI, port is locked to 3000 and will not auto-increment due to `strictPort: true`.
- If you see "Error: Port 3000 is already in use", it means another instance is already running and healthy on that port. Either reuse the running instance or stop it before starting a new one. This is expected with strictPort: true.
  - To check which process is using the port inside the container: `lsof -i :3000 -sTCP:LISTEN -n -P` (or `ss -ltnp | grep :3000`)
  - If a healthy dev server is already running, simply reuse it at http://localhost:3000
  - If you need to stop the existing server, terminate it gracefully (e.g., `kill <PID>`). Avoid repeatedly starting multiple servers; strictPort prevents auto-switching ports by design.
- If you still observe a restart mentioning "vite.config.js changed", ensure no external process touches that file; the watcher in this repo already ignores it.
- The dev server intentionally ignores changes to `.env`, `.env.*`, `index.html`, `vite.config.*`, and `post_process_status.lock` to prevent reload loops. Do not programmatically touch these files while dev server runs.
- Lockfiles and node_modules are excluded from watch; do not run package installs while the dev server is live if you want to avoid a transient restart.
