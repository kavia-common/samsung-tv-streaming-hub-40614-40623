# Dev server behavior

- Vite is configured to:
  - Bind to 0.0.0.0 (host: true)
  - Use PORT from `.env` if provided, else 3000
  - Enforce strictPort so it does not change ports automatically

Run locally:
- npm install
- npm run dev
- Access on http://localhost:3000
