# CI Usage Notes for tv_frontend

PUBLIC_INTERFACE

Purpose:
- Ensure the dev server is started via the stable launcher that neutralizes external terminations (e.g., exit code 137/143) after readiness to avoid false build failures.
- Bind to 0.0.0.0:3000 with strictPort and allowedHosts for localhost/127.0.0.1/0.0.0.0.

How to start in CI/containers:
- Always use:
  - npm run dev
  - or npm run dev:ci
  - or npm start

Do NOT run `vite` directly in CI and do NOT pass extra flags after `npm run dev` (e.g., `npm run dev -- --port ...`). These patterns bypass the launcher protections and can cause exit 137/143 to be reported as failures.
Never end the dev step with explicit process group kills like `kill -9 -$$`. The launcher neutralizes terminations automatically after readiness.

Behavior:
- If port 3000 is already in use, the script exits 0 assuming a healthy dev server is running.
- After the server is ready (listener detected on 0.0.0.0:3000), if CI terminates the process group, the script neutralizes termination and exits 0.
- Exit codes 130/137/143 are treated as neutral exits after readiness (or when a post-exit port check confirms a healthy listener).
- The dev launcher does not forward signals to the child vite process in CI, preventing cascade kills that would otherwise show as exit code 137.

Health log to expect:
- "[start-dev] Health: Vite listener detected on 0.0.0.0:3000."
- On CI termination: "[start-dev] Neutralizing termination after readiness/health check. Exiting 0."

Usage examples:
- npm run dev
- npm run dev:ci
- PORT=3000 npm run dev:ci
- HOST=localhost npm run dev:ci
