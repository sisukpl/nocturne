import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import LocationBar from './components/LocationBar';
import AuroraGauge from './components/AuroraGauge';
import CloudTransparencyChart from './components/CloudTransparencyChart';
import MoonPhaseIndicator from './components/MoonPhaseIndicator';
import ClearSkyWindowTimeline from './components/ClearSkyWindowTimeline';
import StarfieldBackground from './components/StarfieldBackground';
import { fetchNoaaSpaceWeather, fetchOpenMeteoForecast } from './services/api';
import { getGeomagneticLatitude, computeClearSkyTimeline } from './utils/astronomy';
import { AlertCircle, RefreshCw, Radio, Sparkles } from 'lucide-react';

export default function App() {
  // Default location: Ludvika, Sweden (lat: 60.1496, lon: 15.1878) or saved preference in localStorage
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('aurora_planner_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lon) return { lat: parsed.lat, lon: parsed.lon };
      }
    } catch (e) {}
    return { lat: 60.1496, lon: 15.1878 };
  });

  const [locationName, setLocationName] = useState(() => {
    try {
      const saved = localStorage.getItem('aurora_planner_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch (e) {}
    return 'Ludvika, Sweden (Dalarna)';
  });

  // API State
  const [spaceWeather, setSpaceWeather] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Compute Geomagnetic Latitude
  const magLat = useMemo(() => {
    return Math.round(getGeomagneticLatitude(coords.lat, coords.lon) * 10) / 10;
  }, [coords.lat, coords.lon]);

  // Compute Combined Clear Sky Timeline
  const timeline = useMemo(() => {
    if (!weatherData || !weatherData.hourly) return [];
    return computeClearSkyTimeline(weatherData.hourly, weatherData.daily, coords.lat, coords.lon);
  }, [weatherData, coords.lat, coords.lon]);

  // Determine current darkness for aurora gauge
  const isNight = useMemo(() => {
    if (timeline.length > 0) {
      return timeline[0].isNight;
    }
    return true;
  }, [timeline]);

  // Load data function
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // Parallel fetch NOAA SWPC and Open-Meteo
      const [noaaRes, meteoRes] = await Promise.all([
        fetchNoaaSpaceWeather(),
        fetchOpenMeteoForecast(coords.lat, coords.lon)
      ]);

      setSpaceWeather(noaaRes);
      setWeatherData(meteoRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to sync some live telemetry. Showing latest available forecast.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [coords.lat, coords.lon]);

  // Initial fetch and on coordinate change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Handle location update
  const handleLocationChange = (newLat, newLon, newName) => {
    setCoords({ lat: newLat, lon: newLon });
    const finalName = newName || `${newLat.toFixed(2)}°, ${newLon.toFixed(2)}°`;
    setLocationName(finalName);
    try {
      localStorage.setItem('aurora_planner_location', JSON.stringify({
        lat: newLat,
        lon: newLon,
        name: finalName
      }));
    } catch (e) {}
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between">
      {/* Background Starfield Canvas with subtle Aurora */}
      <StarfieldBackground auroraIntensity={spaceWeather ? spaceWeather.currentKp * 12 : 25} />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Header */}
        <Header 
          onRefresh={() => loadDashboardData(true)} 
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* Location Controller Bar */}
        <LocationBar 
          currentLat={coords.lat}
          currentLon={coords.lon}
          locationName={locationName}
          onLocationChange={handleLocationChange}
        />

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-3 text-amber-200 text-sm font-mono">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !weatherData ? (
          <div className="glass-panel rounded-2xl p-16 text-center flex flex-col items-center justify-center my-12">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-200">Retrieving Space Weather &amp; Celestial Telemetry...</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Connecting to NOAA Space Weather Prediction Center &amp; Open-Meteo
            </p>
          </div>
        ) : (
          <main className="space-y-6 animate-fadeIn">
            {/* Top Row: Aurora Likelihood Gauge (1) & Moon Phase Indicator (3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AuroraGauge 
                  spaceWeather={spaceWeather} 
                  magLat={magLat} 
                  isNight={isNight} 
                />
              </div>

              <div className="lg:col-span-5">
                <MoonPhaseIndicator 
                  dailyData={weatherData ? weatherData.daily : null} 
                />
              </div>
            </div>

            {/* Middle Row: Hourly Cloud Transparency Chart (2) */}
            <div>
              <CloudTransparencyChart timeline={timeline} />
            </div>

            {/* Bottom Row: Combined 'Clear Sky Window' Timeline (4) */}
            <div>
              <ClearSkyWindowTimeline 
                timeline={timeline}
                moonPhase={weatherData && weatherData.daily ? weatherData.daily.moon_phase[0] : 0.45}
              />
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-[#03060f]/80 backdrop-blur-md py-6 px-4 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Aurora &amp; Dark-Sky Planner • Built for Stargazers &amp; Astrophotographers</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <span>Data: NOAA SWPC (JSON)</span>
            <span>•</span>
            <span>Open-Meteo Astronomy API</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Synced: {lastUpdated.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
