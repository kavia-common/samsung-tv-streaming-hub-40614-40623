# tv_frontend Development Notes

- Current environment uses Node 18.x.
- Vite 7 requires Node >= 20.19+. To keep compatibility with Node 18, we pinned:
  - vite: ^5.4.21
  - @vitejs/plugin-react: ^4.7.0

Why this change?
- Attempting to run with Vite 7 on Node 18 caused failures in dev startup, including errors like `TypeError: crypto.hash is not a function` due to internal dependency hashing using newer Node APIs.
- Vite 5 works with Node 18 and avoids these failures.

Local development
- Run: npm install && npm run dev
- Dev server runs on port 3000 by default.
- If you upgrade your Node to >=20.19, you can consider upgrading Vite to 7+ later.

Dev server stability
- The Vite dev server is configured to ignore changes to `.env`, `.env.*`, `vite.config.*`, `index.html`, and `post_process_status.lock` during `npm run dev`. This prevents rapid restart loops in CI/containers when external processes touch these files.
- File system access is restricted (fs.strict) and chokidar ignore globs are applied via server.watch.ignored. Lockfiles and `node_modules` are also ignored.
- Chokidar `awaitWriteFinish` is enabled to smooth out bursty writes and avoid thrashing.
- Do not run any script that modifies `.env`, `vite.config.js`, or `index.html` while the dev server is running.
- CI neutral exits: the dev launcher (bin/start-dev.js) treats external terminations as success (exit 0) including signals and codes like 137 (SIGKILL) and 143 (SIGTERM) once readiness is confirmed (listener observed) or when a post-exit port check shows the listener is healthy. It also proactively exits 0 upon SIGINT/SIGTERM after readiness to avoid CI misclassification. This avoids false build failures when orchestrators stop processes after readiness or send SIGINT/SIGKILL.
- Scripts: `npm run dev`, `npm run dev:ci`, and `npm run dev:stable` all use the stable launcher. Prefer these over calling `vite` directly in CI.

Port/strictPort behavior and collision handling
- Port is fixed to 3000; if the port is already in use, `npm run dev` will fail fast with "Error: Port 3000 is already in use".
- This indicates another healthy instance is already running on 3000 (expected with `strictPort: true`). In CI/containers, reuse the running instance at http://localhost:3000.
- If you must start a fresh instance, first stop the existing one:
  - Check the listener: `lsof -i :3000 -sTCP:LISTEN -n -P` (or `ss -ltnp | grep :3000`)
  - Terminate gracefully: `kill <PID>` (or `kill -9 <PID>` only as last resort).
- Do not start multiple dev servers simultaneously; strictPort intentionally prevents auto-switching ports.

Additional hardening (already applied)
- host: true with strictPort: true on port 3000 enforced in vite.config.js
- allowedHosts explicitly includes localhost, 127.0.0.1, 0.0.0.0
- HMR stabilized via ws protocol and clientPort = 3000 for container usage
- Watch ignores: `.env`, `.env.*`, `vite.config.*`, `index.html`, `post_process_status.lock`, lockfiles, node_modules
- fs.strict with allow root only to avoid unexpected path access

Upgrading later
- When moving to Node >=20.19, update devDependencies in package.json:
  - vite to ^7 (or later)
  - @vitejs/plugin-react to ^5 (or later)
- Then test: npm run dev and ensure no regressions.
