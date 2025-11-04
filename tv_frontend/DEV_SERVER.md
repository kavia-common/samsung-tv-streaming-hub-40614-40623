# Dev server behavior

- Vite is configured to:
  - Bind to 0.0.0.0 (host: true)
  - Use PORT from `.env` if provided, else 3000
  - Enforce strictPort so it does not change ports automatically
  - Ignore changes to `.env`, `.env.*`, `post_process_status.lock`, and `vite.config.*` during dev to prevent rapid restart loops

Run locally:
- npm install
- npm run dev
- Access on http://localhost:3000

Notes:
- Do not run any script or watcher that writes to `.env` or `vite.config.*` during `npm run dev`. This will cause unnecessary restarts or instability.
- For containers/CI, port is locked to 3000 and will not auto-increment.
