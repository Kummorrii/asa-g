# ASA — Bisaya for "where?"

ASA is a deliberately terrible Google Maps parody built for MALFUNCTION 2026 (iDE.A). It gives you a Google-Maps-style trip picker, then sabotages the journey with the longest route, fake traffic, worsening ETAs, random redirects, scripted Bisaya-English roasts, and frequent robot checks.

## Features

- Search or click-map start and destination selection
- Food-place searches automatically spin through matching branches and choose one for you
- Longest available route with saved offline fallback routes
- Simulated car or walker with speed controls and follow camera
- Fake incidents, traffic, worsening ETA, and random redirects
- Scripted local "AI helper" roasts and absurd directions
- Eight interactive chaos captchas
- Hidden pitch controls (`D` key)
- Fully front-end; no accounts, API keys, backend, or voice

## Run locally

```bash
npm i
npm run dev
```

Then open the Vite URL shown in the terminal. OpenStreetMap, search, and routing need Wi-Fi for live data, but the demo trip and fallback routes keep the app usable offline.

## Pitch judge controls

Press `D` to open the hidden demo panel:

- Load demo trip
- Force redirect
- Force captcha
- Force helper insult
- Add 30 minutes to ETA
- Reset trip

Captchas cannot be closed with Escape or the backdrop. If a demo becomes stuck, press `Ctrl+Shift+K` to activate the hidden safety close.

## Team

Built by five members for MALFUNCTION 2026:

1. M1 — Map and planner
2. M2 — Trip simulation
3. M3 — Traffic and redirects
4. M4 — Roasts and directions
5. M5 — Captchas, demo panel, theme, and final QA

## Getting Started

```bash
npm install
npm run dev
```

*TODO(M5): Expand README with full demo instructions and deployment guide.*
