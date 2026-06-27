# 🌌 Project Zenith — The Celestial Eye

> AstralWeb Innovate Competition Entry — Real-time space intelligence dashboard

---

## Overview

Project Zenith is a full-screen interactive space dashboard built with React, Vite, and Three.js. It tracks near-Earth asteroids in real time using NASA's NeoWs API, visualises them in a 3D scene around Earth, and provides threat scoring, ISS tracking, and an AI space guide powered by the Groq API.

---

## Modules

| Module | Status | Description |
|---|---|---|
| Asteroid Monitor | ✅ Live | 3D Three.js scene — real NASA asteroid data, click-to-zoom |
| ISS Tracker | ✅ Live | Real-time ISS position on a Leaflet map |
| AI Space Guide | ✅ Live | Groq-powered chat assistant for space questions |
| Cosmic Learning Hub | ✅ Live | NASA APOD daily image and learning content |
| Space Weather | Live | NASA DONKI API |
| Orbit Explorer | 🔧 Stub | Placeholder — ready to build |
| Observation Planner | 🔧 Stub | Placeholder — ready to build |

---

## Tech Stack

- **React 18** + **Vite**
- **Three.js** — 3D asteroid scene, Earth, starfield
- **NASA NeoWs API** — near-Earth object data (next 7 days)
- **Groq API** — AI Space Guide chat
- **Leaflet** — ISS Tracker map
- **Framer Motion** — UI transitions

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/project-zenith.git
cd project-zenith
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root. This file is already in `.gitignore` — never commit it.

```env
VITE_NASA_API_KEY=your_nasa_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 3. Get your API keys

**NASA API Key** (free)
- Go to [https://api.nasa.gov](https://api.nasa.gov)
- Click "Generate API Key"
- Used for: Asteroid NeoWs feed, APOD,DONKI 

**Groq API Key** (free tier available)
- Go to [https://console.groq.com](https://console.groq.com)
- Create an account → API Keys → Create key
- Used for: AI Space Guide chat



### 4. Run locally

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
project-zenith/
├── src/
│   ├── pages/
│   │   ├── AsteroidMonitor.jsx   # Main 3D scene — Three.js + NASA NeoWs
│   │   ├── ISSTracker.jsx        # Live ISS position
│   │   ├── AISpaceGuide.jsx      # Groq-powered chat
│   │   ├── CosmicLearningHub.jsx # NASA APOD
│   │   ├── SpaceWeather.jsx      # NASA DONKI API
│   │   ├── OrbitExplorer.jsx     # Stub
│   │   └── ObservationPlanner.jsx# Stub
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── utils/
│   │   └── api.js                # API helpers, threat scoring
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                          # ← YOUR KEYS GO HERE (gitignored)
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```

---

## Asteroid Threat Score

Each asteroid is scored 0–100 based on three factors:

| Factor | Weight | Source |
|---|---|---|
| Miss distance | 50% | NeoWs miss_distance.kilometers |
| Relative velocity | 30% | NeoWs relative_velocity.km/h |
| Estimated diameter | 20% | NeoWs estimated_diameter.meters |

Risk levels: **Low** (0–20) · **Moderate** (21–40) · **High** (41–70) · **Critical** (71–100)

Potentially hazardous asteroids (NASA-flagged) are highlighted separately regardless of score.

---

## .gitignore

The following are already excluded from version control:

```
.env
node_modules/
dist/
```

Your NASA and Groq API keys in `.env` will never be committed as long as `.gitignore` is in place. Double-check with `git status` before any push.

---

## Build for Production

```bash
npm run build
```

Output goes to `/dist`. Deploy to Vercel, Netlify, or any static host.

> ⚠️ When deploying, set `VITE_NASA_API_KEY` and `VITE_GROQ_API_KEY` as environment variables in your hosting platform — do not hardcode them.

---

## Competition

**Event:** AstralWeb Innovate  
**Theme:** Project Zenith: The Celestial Eye  
**Category:** Web Development

---

## License

MIT — free to use, modify, and distribute with attribution.
