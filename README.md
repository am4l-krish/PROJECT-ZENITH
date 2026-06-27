# Project Zenith — The Celestial Eye

Team NOVA | Amal Krishna M · Alwin Sebastian · Amal Krishna P

## Setup

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Module Status

| Module               | Status     | Notes                            |
|----------------------|------------|----------------------------------|
| Dashboard            | ✅ Done    | Live NASA NeoWs stats + APOD     |
| Asteroid Monitor     | ✅ Done    | Full 3D Three.js scene           |
| ISS Tracker          | ✅ Done    | Live position, Leaflet map       |
| AI Space Guide       | ✅ Done    | Add Groq key to AISpaceGuide.jsx |
| Cosmic Learning Hub  | ✅ Done    | NASA APOD full page              |
| Space Weather Center | 🔧 Stub    | Needs NOAA/DONKI integration     |
| 3D Orbit Explorer    | 🔧 Stub    | Needs TLE + satellite.js         |
| Observation Planner  | 🔧 Stub    | Needs OpenWeather key            |

## API Keys

- **NASA** — already configured in `src/utils/api.js`
- **Groq** — add your key in `src/pages/AISpaceGuide.jsx` line 37
- **OpenWeather** — add key when building Observation Planner

## Stack

React 18 · Vite · Three.js · React Router · Leaflet · Chart.js · Framer Motion
