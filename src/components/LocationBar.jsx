import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, Globe, ChevronDown, Loader2, Wifi, AlertTriangle, HelpCircle } from 'lucide-react';
import { searchGeocoding, fetchIpLocation } from '../services/api';

const PRESETS = [
  { name: 'Ludvika, Sweden (Dalarna)', lat: 60.1496, lon: 15.1878, tag: 'Your Town 60°N' },
  { name: 'Abisko, Sweden', lat: 68.3495, lon: 18.8313, tag: 'Aurora Sky Station' },
  { name: 'Tromsø, Norway', lat: 69.6489, lon: 18.9551, tag: 'Aurora Capital' },
  { name: 'Fairbanks, Alaska', lat: 64.8378, lon: -147.7164, tag: 'Aurora Oval' },
  { name: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426, tag: 'Volcanic Aurora' },
  { name: 'Jasper Dark Sky, Canada', lat: 52.8737, lon: -117.9543, tag: 'Bortle 1-2' },
  { name: 'Cherry Springs Park, PA', lat: 41.6628, lon: -77.8239, tag: 'Dark Sky East' },
  { name: 'Mauna Kea, Hawaii', lat: 19.8206, lon: -155.4681, tag: 'Observatory' },
  { name: 'Lake Tekapo, New Zealand', lat: -44.0047, lon: 170.4771, tag: 'Southern Lights' },
];

export default function LocationBar({ 
  currentLat, 
  currentLon, 
  locationName, 
  onLocationChange 
}) {
  const [latInput, setLatInput] = useState(currentLat.toString());
  const [lonInput, setLonInput] = useState(currentLon.toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoSuccessMsg, setGeoSuccessMsg] = useState(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const searchRef = useRef(null);

  // Sync inputs with props if changed externally
  useEffect(() => {
    setLatInput(currentLat.toString());
    setLonInput(currentLon.toString());
  }, [currentLat, currentLon]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Geocoding search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGeocoding(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Network IP Geolocation (Requires zero browser permission)
  const handleDetectViaIp = async () => {
    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccessMsg(null);

    try {
      const data = await fetchIpLocation();
      const lat = Math.round(data.latitude * 10000) / 10000;
      const lon = Math.round(data.longitude * 10000) / 10000;
      setLatInput(lat.toString());
      setLonInput(lon.toString());
      setGeoLoading(false);
      setGeoSuccessMsg(`✓ Auto-detected via Network: ${data.placeName}`);
      onLocationChange(lat, lon, data.placeName);
    } catch (err) {
      setGeoLoading(false);
      console.error("IP detection failed:", err);
      setGeoError("Network IP detection failed. Please search for your city or enter coordinates manually.");
    }
  };

  // Browser Geolocation trigger with automatic IP fallback
  const handleUseGeolocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccessMsg(null);

    if (!navigator.geolocation) {
      console.warn("navigator.geolocation not supported, falling back to IP...");
      handleDetectViaIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        setLatInput(lat.toString());
        setLonInput(lon.toString());
        setGeoLoading(false);
        setGeoSuccessMsg("✓ Precision GPS acquired successfully");
        setGeoError(null);
        onLocationChange(lat, lon, "Your GPS Location");
      },
      async (err) => {
        console.warn("Browser GPS permission denied or unavailable (code " + err.code + "). Falling back to IP detection...", err);
        // Fallback to IP geolocation immediately so user is never blocked!
        try {
          const data = await fetchIpLocation();
          const lat = Math.round(data.latitude * 10000) / 10000;
          const lon = Math.round(data.longitude * 10000) / 10000;
          setLatInput(lat.toString());
          setLonInput(lon.toString());
          setGeoLoading(false);
          setGeoSuccessMsg(`✓ Browser GPS blocked; auto-located via Network: ${data.placeName}`);
          setGeoError(null);
          onLocationChange(lat, lon, data.placeName);
        } catch (ipErr) {
          setGeoLoading(false);
          setGeoError("Browser location permission was denied. Click 'How to fix' below, or search for your city.");
        }
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  // Manual coordinate submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setGeoSuccessMsg(null);
      setGeoError(null);
      onLocationChange(lat, lon, `Custom Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 transition-all">
      {/* Current Location Badge & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              ACTIVE OBSERVING LOCATION
            </div>
            <div className="text-lg font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              {locationName}
              <span className="text-xs font-mono text-cyan-300 font-normal px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-800/40">
                {currentLat.toFixed(3)}°, {currentLon.toFixed(3)}°
              </span>
              {(locationName.toLowerCase().includes('gävle') || locationName.toLowerCase().includes('gaevle')) && (
                <button
                  type="button"
                  onClick={() => {
                    onLocationChange(60.1496, 15.1878, 'Ludvika, Sweden (Dalarna)');
                    setGeoSuccessMsg('✓ Adjusted to exact Ludvika coordinates (60.15°N, 15.19°E)');
                  }}
                  className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>📍 In Ludvika? Click to snap to 60.15°N</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Location Detection Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Browser GPS Button (with auto-fallback to IP) */}
          <button
            onClick={handleUseGeolocation}
            disabled={geoLoading}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-all text-xs font-semibold font-mono disabled:opacity-60 cursor-pointer shadow-lg shadow-cyan-950/20"
            title="Attempts browser GPS; automatically uses Network IP if permission is blocked"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Navigation className="w-4 h-4 text-cyan-400" />
            )}
            <span>{geoLoading ? 'Detecting Location...' : 'Use My Location'}</span>
          </button>

          {/* Direct Network IP Detection Button (Requires zero browser permission) */}
          <button
            onClick={handleDetectViaIp}
            disabled={geoLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono disabled:opacity-60 cursor-pointer"
            title="Instant location based on your network connection (No permission dialog)"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detect via Network IP</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {geoSuccessMsg && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{geoSuccessMsg}</span>
          </div>
          <button onClick={() => setGeoSuccessMsg(null)} className="text-slate-400 hover:text-slate-200 text-[10px]">
            ✕
          </button>
        </div>
      )}

      {/* Error / Troubleshooting Notification */}
      {geoError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{geoError}</span>
            </div>
            <button
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="text-cyan-400 hover:underline text-[11px] font-semibold"
            >
              {showTroubleshoot ? 'Hide tips' : 'How to allow in browser?'}
            </button>
          </div>

          {showTroubleshoot && (
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px] space-y-1 font-sans">
              <p className="font-semibold text-white">How to unblock location in your browser:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li><strong>Chrome / Edge / Brave:</strong> Click the <strong>tune/sliders icon</strong> (or lock icon) on the left side of the address bar (next to <code>localhost:5173</code>), find <strong>Location</strong>, change to <strong>Allow</strong>, and refresh.</li>
                <li><strong>Safari:</strong> Go to <strong>Safari &gt; Settings &gt; Websites &gt; Location</strong> and set <code>localhost</code> to <strong>Allow</strong>. Ensure macOS System Settings &gt; Privacy &amp; Security &gt; Location Services is on.</li>
                <li><strong>Alternative:</strong> Click the <strong>"Detect via Network IP"</strong> button above to bypass browser prompts entirely!</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Input controls: Place search & Direct lat/lon */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        {/* City / Place Search Dropdown */}
        <div className="lg:col-span-6 relative" ref={searchRef}>
          <label className="text-[11px] font-mono text-slate-400 block mb-1">
            Search Worldwide (City, Observatory, Dark Sky Park)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="e.g. Tromsø, Fairbanks, Stockholm, Gävle, London, Banff..."
              className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 absolute right-3 top-3" />
            )}
          </div>

          {/* Search Dropdown list */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const placeName = `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}, ${item.country_code || item.country || ''}`;
                    onLocationChange(item.latitude, item.longitude, placeName);
                    setSearchQuery('');
                    setShowDropdown(false);
                    setGeoSuccessMsg(`✓ Switched to ${placeName}`);
                    setGeoError(null);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between border-b border-slate-800/60 last:border-none cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-100">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Direct Lat/Lon Numerical Inputs */}
        <form onSubmit={handleManualSubmit} className="lg:col-span-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Latitude (-90 to +90)
            </label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex-1">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Longitude (-180 to +180)
            </label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-xs font-semibold cursor-pointer transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Preset Stargazing & Aurora Hotspots */}
      <div>
        <span className="text-[11px] font-mono text-slate-400 block mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          Featured Dark Sky &amp; Aurora Hotspots:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const isCurrent = Math.abs(currentLat - p.lat) < 0.1 && Math.abs(currentLon - p.lon) < 0.1;
            return (
              <button
                key={p.name}
                onClick={() => {
                  onLocationChange(p.lat, p.lon, p.name);
                  setGeoSuccessMsg(`✓ Switched to preset: ${p.name}`);
                  setGeoError(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-slate-100'
                }`}
              >
                <span>{p.name.split(' (')[0]}</span>
                <span className="text-[10px] text-slate-400 bg-slate-950/80 px-1 rounded">
                  {p.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
