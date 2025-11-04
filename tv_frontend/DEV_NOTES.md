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
- File system access is restricted (fs.strict) and chokidar ignore globs are applied via server.watch.ignored.
- Do not run any script that modifies `.env`, `vite.config.js`, or `index.html` while the dev server is running.
- strictPort behavior: Port is fixed to 3000; if the port is already in use, `npm run dev` will fail fast with "Port 3000 is already in use". This indicates another healthy instance is running on 3000. Reuse it or stop it before starting a new one.
  - Check the listener with `lsof -i :3000 -sTCP:LISTEN -n -P` (or `ss -ltnp | grep :3000`).
  - Stop the existing server via `kill <PID>` if you must start a fresh one.

Upgrading later
- When moving to Node >=20.19, update devDependencies in package.json:
  - vite to ^7 (or later)
  - @vitejs/plugin-react to ^5 (or later)
- Then test: npm run dev and ensure no regressions.
