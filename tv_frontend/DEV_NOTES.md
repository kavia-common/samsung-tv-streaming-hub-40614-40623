# tv_frontend Development Notes

- Current environment uses Node 18.x.
- Vite 7 requires Node >= 20.19+. To keep compatibility with Node 18, we pinned:
  - vite: ^5.4.11
  - @vitejs/plugin-react: ^4.3.4

Why this change?
- Attempting to run with Vite 7 on Node 18 caused failures in dev startup, including errors like `TypeError: crypto.hash is not a function` due to internal dependency hashing using newer Node APIs.
- Vite 5 works with Node 18 and avoids these failures.

Local development
- Run: npm install && npm run dev
- Dev server runs on port 3000 by default.
- If you upgrade your Node to >=20.19, you can consider upgrading Vite to 7+ later.

Upgrading later
- When moving to Node >=20.19, update devDependencies in package.json:
  - vite to ^7 (or later)
  - @vitejs/plugin-react to ^5 (or later)
- Then test: npm run dev and ensure no regressions.
