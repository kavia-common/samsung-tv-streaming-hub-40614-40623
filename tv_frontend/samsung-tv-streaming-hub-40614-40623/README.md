# samsung-tv-streaming-hub-40614-40623

This workspace contains the tv_frontend (Samsung Tizen TV app) built with React + Vite.

CI/containers usage for tv_frontend:
- Always start the dev server through the stable launcher:
  - npm run dev
  - or npm run dev:ci
  - or npm start
- Do NOT invoke vite directly in CI and do NOT append extra flags after npm run dev (e.g., --port/--host). Use environment variables instead:
  - PORT=3000 npm run dev
  - HOST=my-ci-host.internal npm run dev
- The launcher binds to 0.0.0.0:3000 with strictPort and neutralizes external terminations (exit codes 130/137/143) after readiness, so CI does not fail due to SIGTERM/SIGKILL.
- If port 3000 is already in use, the launcher exits 0, assuming a healthy server is already running.

Documentation:
- See tv_frontend/CI_README.md for CI-specific notes and troubleshooting.
- See tv_frontend/DEV_SERVER.md for dev server behavior and configuration.
- See tv_frontend/.env.example for supported environment variables (PORT, HOST) and how to use them instead of CLI flags. You may copy it to .env.
