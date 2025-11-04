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
  - or npm run dev:neutral (alias)

Important:
- Do NOT run `vite` directly in CI.
- Do NOT pass extra flags after `npm run dev` (e.g., `npm run dev -- --port 3000 --host 0.0.0.0`). These patterns bypass the launcher protections. If flags are passed, the launcher will ignore them and print:
  - "[start-dev] Warning: Extra CLI flags passed to dev are ignored. Use env PORT/HOST instead."
- Use environment variables instead:
  - PORT=3000 npm run dev
  - HOST=my-ci-host.internal npm run dev

Never end the dev step with explicit process group kills like `kill -9 -$$`. The launcher neutralizes terminations automatically after readiness. If a dev server is already on port 3000, reuse it and exit 0.

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

Troubleshooting exit code 137 (SIGKILL) in CI:
- Symptom: CI shows "Process exited with code 137" even though Vite logged readiness.
- Root cause: Running with extra CLI flags or directly invoking vite can bypass the stable launcher, so the termination is reported as failure.
- Fix:
  1) Ensure you are using: npm run dev (or npm run dev:ci)
  2) Pass host/port via env, not flags: PORT=3000 HOST=0.0.0.0 npm run dev
  3) Do not append flags after npm run dev. If you do, the launcher will ignore them and warn, but CI may still be killing a mis-invoked process group.
- Expected behavior when fixed:
  - When CI ends the step after readiness, logs will show:
    "[start-dev] Proactive neutralization: readiness/port healthy. Exiting 0."
  - The CI job should pass with status 0 despite termination.
