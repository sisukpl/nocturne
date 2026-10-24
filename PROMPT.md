# 🌌 Nocturne — Full Agent Prompt Specification

> **Use this prompt in Google Antigravity, Claude Code, Cursor, or any advanced agentic coding tool to build or reproduce the Nocturne Aurora & Dark-Sky Planner web application from scratch.**

---

```markdown
Build a production-grade, single-page dark-mode web application called "Nocturne" using Vite, React, and Tailwind CSS (v3). 

The app is a real-time dashboard for aurora chasers, amateur astronomers, and astrophotographers. It integrates live space weather telemetry from the NOAA Space Weather Prediction Center (SWPC) and atmospheric astronomy forecasts from Open-Meteo.

### 1. APIs & Data Sources (No API keys required)
- **NOAA SWPC JSON Endpoints**:
  - Planetary K-index: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` (extract current Kp and 24h historical 3-hour epochs).
  - IMF Magnetic Field (Bz, Bt): `https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json`.
  - Solar Wind Velocity: `https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json` (proton speed in km/s).
- **Open-Meteo Astronomy & Weather API**:
  - Forecast: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,temperature_2m,dew_point_2m,wind_speed_10m&daily=sunrise,sunset,moonrise,moonset,moon_phase&timezone=auto&forecast_days=3`.
  - Geocoding Search: `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=6&language=en&format=json`.
- **Network IP Geolocation Fallback**:
  - `https://ipapi.co/json/` (with fallback to `https://ipwho.is/`) to resolve city, region, and coordinates without requiring browser GPS permissions.

### 2. Core Scientific & Physics Algorithms
Implement a dedicated `astronomy.js` utility module:
- **Geomagnetic Latitude ($\Lambda$)**:
  Approximate geomagnetic dipole latitude using Earth's magnetic north pole coordinates (~80.7°N, -72.7°W):
  `sin(Λ) = sin(φ) * sin(φ0) + cos(φ) * cos(φ0) * cos(λ - λ0)`.
- **Aurora Likelihood Engine (0–100%)**:
  - Evaluate required Kp threshold for the user's magnetic latitude (overhead visibility vs. horizon visibility).
  - Factor in IMF Bz: Negative Bz (Southward IMF) opens Earth's magnetosphere, dramatically boosting aurora activity; Positive Bz shields Earth.
  - Factor in Solar Wind Speed: Speeds > 450–700 km/s provide an energetic boost.
  - Return category: "Minimal", "Low", "Moderate", "High", or "Very High (Overhead Active)".
- **Layered Cloud Transparency & Dew Risk**:
  - Weight low clouds (dense, 50% penalty), mid clouds (35%), and high cirrus clouds (15%).
  - Flag condensation/dew risk when ambient temperature is within 2°C of the dew point (indicating lens heaters are required).
- **Realistic Moon Phase Engine**:
  - Calculate illumination percentage and synodic age (0 to 29.53 days) from Open-Meteo's `moon_phase`.
  - Provide astrophotography recommendations: Deep-Sky (DSO) wash out vs. high-contrast lunar crater observing.
- **Combined 'Clear Sky Window' Timeline Engine**:
  - Calculate Sun depression angle (Daylight, Civil, Nautical, and Astronomical Night < -18°).
  - Score every upcoming hour from 0 to 100 based on darkness (25%), cloud clearance (55%), and transparency (20%).
  - Identify the contiguous "Tonight's Prime Window" (e.g. 22:00 – 03:30 • 5.5 hours uninterrupted dark sky).

### 3. UI Components & Dashboard Layout
Create modern, glassmorphic dark-space components (`bg-[#040711]` with neon cyan, emerald, and violet accents):
- **Dynamic Starfield & Aurora Canvas**: Lightweight HTML5 canvas rendering twinkling background stars and a subtle undulating aurora curtain.
- **Header**: App title with glowing gradient logo, live NOAA sync badge, last-updated timestamp, "Sync Live Data" refresh button, and a "Science Guide" modal explaining Kp, Bz, and moon contrast.
- **Location Controller Bar**:
  - Display active location with latitude and longitude.
  - "Use My Location" button (tries HTML5 browser GPS; if denied or unavailable on desktop, automatically falls back to Network IP lookup).
  - "Detect via Network IP" button (requires zero browser permissions).
  - Worldwide place search with typeahead dropdown.
  - Quick-switch hotspot presets: Ludvika (Sweden), Abisko (Sweden), Tromsø (Norway), Fairbanks (Alaska), Reykjavik (Iceland), Jasper (Canada), Cherry Springs (PA), Mauna Kea (Hawaii), Lake Tekapo (New Zealand).
  - Persist chosen coordinates in `localStorage` so they are remembered across reloads.
- **Row 1 — Aurora Gauge & Moon Indicator**:
  - **Aurora Likelihood Gauge**: Interactive SVG semi-circular speedometer with color gradient arc, glowing needle, Kp metric card, IMF Bz Southward/Northward indicator, solar wind speed, and 24-hour historical Kp sparkline.
  - **Moon Phase Indicator**: Photorealistic SVG Moon sphere with crater texture patterns and elliptical terminator shadow, illumination %, moon age, moonrise/moonset times, and DSO vs lunar advice.
- **Row 2 — Hourly Cloud Cover & Transparency Chart**:
  - Interactive SVG area chart plotting total cloud cover and seeing transparency over the next 12 or 24 hours.
  - Background color shading for Daylight, Civil, Nautical, and true Astronomical Night.
  - Interactive hover cursor displaying exact low/mid/high cloud breakdown, temperature, and dew point for any selected hour.
- **Row 3 — Combined 'Clear Sky Window' Timeline**:
  - Hero banner highlighting the prime contiguous stargazing window tonight.
  - Hour-by-hour interactive rating bar with color-coded quality chips (Emerald = Pristine, Cyan = Good, Amber = Marginal, Dark = Obstructed).
  - Deep-dive card for the selected hour with celestial target recommendations (Andromeda Galaxy M31, Orion Nebula M42, Pleiades, Jupiter, Saturn) and equipment checklist (dew heaters, wide-angle lens, dark-sky filters).

### 4. Code Quality & Deliverables
- Fully responsive layout for mobile, tablet, and desktop.
- Clean error handling with fallbacks if an upstream API is temporarily unreachable.
- Include a 1-click macOS launcher script (`Launch Aurora Planner.command`) that starts the server and opens the browser automatically.
```
