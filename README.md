# ASA — Bisaya for "where?"

ASA is a deliberately terrible Google Maps parody built for MALFUNCTION 2026 (iDE.A). It gives you a Google-Maps-style trip picker, then sabotages the journey with the longest route, fake traffic, worsening ETAs, random redirects, scripted Bisaya-English roasts, and frequent robot checks.

## Features

- Search or click-map start and destination selection
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

## 60-second pitch script

1. **0:00** — "Meet ASA, Bisaya for 'where?'. Everyone hates traffic. We made a GPS that loves it." Show the map picker and choose a start and destination.
2. **0:10** — Get route. Point out that the route is way too long and red while the fake "AI helper" insults the destination.
3. **0:20** — Tap Start. The car drives along the simulated route. Toggle to a walker once for effect, then back to the car.
4. **0:30** — Force redirect: "Recalculating... pumunta ka sa Sirao Garden!"
5. **0:40** — Open the captcha and stop the car. Fail it once on purpose for the funny line.
6. **0:50** — Show the growing ETA. Close with: "ASA: we will get you there, eventually."

Rehearse the demo twice on the actual presentation machine. Press `D` to skip waiting during judging.

## Getting Started

```bash
npm install
npm run dev
```

*TODO(M5): Expand README with full demo instructions and deployment guide.*
