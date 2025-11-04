# Samsung Tizen TV Frontend Skeleton

Features implemented:
- Ocean Professional theme with Retro accents (scanlines, neon highlights).
- Navigation rail (Home/Search) with remote focus.
- Home screen with horizontal carousels for categories (mock data).
- Search screen with on-screen keyboard and live results.
- Player screen using HTML5 video suited for Tizen runtime.
- Lightweight global store for focus and selection.
- Router between views using react-router-dom.
- Vite 5 dev server bound to port 3000 with strictPort and host: true (0.0.0.0), with allowedHosts for localhost/127.0.0.1/0.0.0.0.

Run locally:
- npm install
- npm run dev
- Open http://localhost:3000

Notes for CI and local scripts:
- Use env variables PORT/HOST instead of passing flags after npm run dev (see .env.example).
- Example: PORT=3000 npm run dev
- Do not use: npm run dev -- --port 3000 --host 0.0.0.0

Remote keys:
- LEFT/RIGHT/UP/DOWN navigate; ENTER selects; BACK goes back from Player.
- On real Tizen device, BACK at root would exit via tizen.application APIs (omitted in dev).

Structure:
- src/router.jsx: route definitions
- src/ui/AppShell.jsx: layout + nav + header
- src/views/Home.jsx: carousels and item focus
- src/views/Search.jsx: keyboard grid + results list
- src/views/Player.jsx: HTML5 video playback
- src/store.js: global state and focus management
- src/mockData.js: categories and items
- src/theme.css: theme and component styles
