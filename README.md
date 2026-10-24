# 🌌 Nocturne — Aurora & Dark-Sky Visibility Dashboard

A single-page, real-time astronomy and space weather dashboard built with **Vite**, **Tailwind CSS v3**, and **React**. Nocturne connects directly to the free **Open-Meteo Astronomy & Hourly Forecast API** and **NOAA Space Weather Prediction Center (SWPC)** JSON telemetry.

---

## 🌟 Key Features

1. **Aurora Likelihood Gauge (NOAA SWPC)**:
   - Live **Planetary $K_p$ Index** and 24-hour historical trend.
   - **Interplanetary Magnetic Field (IMF) $B_z$** polarity tracking (Southward reconnection vs. Northward shielding).
   - **Solar Wind Proton Speed** ($km/s$).
   - Magnetic latitude ($\Lambda$) calculation based on geomagnetic dipole model.

2. **Hourly Cloud Cover & Transparency Chart (Open-Meteo)**:
   - Layered cloud breakdown: Low (opaque), Mid, and High (cirrus) clouds.
   - Atmospheric **Seeing & Transparency Score** ($0\text{–}100\%$).
   - **Dew & Condensation Risk Warning** (when temperature approaches within $2^\circ\text{C}$ of the dew point).
   - Daylight, Civil, Nautical, and true Astronomical Night shading.

3. **Moon Phase & Illumination Indicator**:
   - Realistic SVG Moon rendering with phase-accurate terminator shadows and lunar maria.
   - Live illumination percentage and lunar age ($0\text{ to }29.5\text{ days}$).
   - Local Moonrise and Moonset times.
   - Astrophotography guidance (DSO vs. Lunar observing).

4. **Combined 'Clear Sky Window' Timeline**:
   - Automatically computes **"Tonight's Prime Window"** for telescope setup or cameras.
   - Hour-by-hour stargazing score.
   - Optical target recommendations (Galaxies, Nebulae, Planets).

5. **Location Controls**:
   - 1-click **Browser Geolocation** (with automatic fallback to Network IP geolocation).
   - **Worldwide Search** via Open-Meteo Geocoding.
   - **Featured Hotspots**: Ludvika (Sweden), Abisko (Sweden), Tromsø (Norway), Fairbanks (Alaska), Reykjavik (Iceland), Jasper (Canada), Cherry Springs (PA), Mauna Kea (Hawaii), and Lake Tekapo (New Zealand).
   - **`localStorage` Persistence**: Your selected location is automatically remembered.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Installation
```bash
# Clone the repository
git clone https://github.com/sisukpl/nocturne.git
cd nocturne

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🛰️ Data Sources
- **Space Weather**: [NOAA Space Weather Prediction Center (SWPC)](https://services.swpc.noaa.gov/)
- **Weather & Astronomy**: [Open-Meteo Weather API](https://open-meteo.com/)
