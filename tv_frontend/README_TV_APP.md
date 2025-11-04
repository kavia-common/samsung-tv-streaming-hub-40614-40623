# Samsung Tizen TV Frontend Skeleton

Features implemented:
- Ocean Professional theme with Retro accents (scanlines, neon highlights).
- Scrollable UI support: scrolling can be enabled per axis (vertical/horizontal) via settings; or disabled for pure focus/pagination UX.
- GPU-friendly animations: transform/opacity only with will-change hints and translate3d for 60fps feel.
- Navigation rail (Home/Search) with remote focus.
- Home screen with horizontal carousels (pagination still used for focus UX; horizontal scroll can be allowed).
- Search screen with on-screen keyboard and results grid (supports scrolling when enabled).
- Player screen using HTML5 video suited for Tizen runtime.
- Lightweight global store for focus and selection.
- Router between views using react-router-dom.
- Vite 5 dev server bound to port 3000 with strictPort and host: true (0.0.0.0), with allowedHosts for localhost/127.0.0.0.

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

Scroll and smoothness:
- Control scroll in src/uiSettings.js:
  - disableScroll=false to enable scrolling
  - allowVerticalScroll / allowHorizontalScroll to pick axes
- Home carousels still use pagination for predictable remote focus; when horizontal scroll is enabled users can also pan.
- Search results paginate by COLS x ROWS; when scroll is enabled, overflow allows natural scrolling in addition to focus moves.
- Animations leverage transform/opacity, with will-change and translate3d to shift work to the GPU.

Structure:
- src/router.jsx: route definitions
- src/ui/AppShell.jsx: layout + nav + header (applies scroll settings)
- src/views/Home.jsx: carousels and item focus with pagination
- src/views/Search.jsx: keyboard grid + paginated results list
- src/views/Player.jsx: HTML5 video playback
- src/store.js: global state and focus management
- src/mockData.js: categories and items
- src/theme.css: theme and component styles
- src/uiSettings.js: global UI settings for scroll and pagination
