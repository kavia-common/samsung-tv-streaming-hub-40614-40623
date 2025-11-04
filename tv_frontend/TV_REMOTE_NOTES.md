# Tizen TV Remote Interactions

This app implements directional navigation using the TV remote:
- UP/DOWN/LEFT/RIGHT: Move focus within carousels, keyboard, and results grid.
- ENTER: Activate focused element:
  - Home: Opens the selected item in the Player.
  - Search: Types the focused key, or plays the focused result.
  - Player: Toggles play/pause.
- BACK:
  - Player: Returns to the previous view.
  - Home/Search: No-op in dev (would exit the app on a real device).

Focus Model:
- Global store tracks focus positions for:
  - Navigation rail (Home/Search).
  - Home carousels (row/col).
  - Search view (zone: keyboard/results and indices).
- Visual focus is rendered via CSS classes (focused) based on store state.

Routing:
- /           Home with horizontal carousels
- /search     Search with on-screen keyboard + results
- /player/:id HTML5 video player (Tizen Web runtime compatible)

Theme:
- Ocean Professional + Retro accents:
  - Primary #2563EB, Secondary/Success #F59E0B, Error #EF4444
  - Background #f9fafb, Surface #ffffff, Text #111827
  - Retro scanline overlay and subtle neon highlights
