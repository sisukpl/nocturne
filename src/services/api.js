// API services for NOAA SWPC and Open-Meteo

export async function fetchNoaaSpaceWeather() {
  let kpData = null;
  let magData = null;
  let speedData = null;
  let errorMsg = null;

  try {
    // 1. Fetch Planetary K-index
    const kpRes = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", {
      cache: "no-store"
    });
    if (kpRes.ok) {
      kpData = await kpRes.json();
    }
  } catch (err) {
    console.warn("NOAA Kp fetch error:", err);
  }

  try {
    // 2. Fetch Solar Wind Magnetic Field (Bz, Bt)
    const magRes = await fetch("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json", {
      cache: "no-store"
    });
    if (magRes.ok) {
      magData = await magRes.json();
    }
  } catch (err) {
    console.warn("NOAA Mag fetch error:", err);
  }

  try {
    // 3. Fetch Solar Wind Speed
    const speedRes = await fetch("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json", {
      cache: "no-store"
    });
    if (speedRes.ok) {
      speedData = await speedRes.json();
    }
  } catch (err) {
    console.warn("NOAA Speed fetch error:", err);
  }

  // Parse Kp index
  let currentKp = 2.0;
  let kpHistory = [];
  if (Array.isArray(kpData) && kpData.length > 0) {
    // Extract last 8 readings (past 24 hours of 3-hour Kp)
    kpHistory = kpData.slice(-12).map(item => ({
      time: item.time_tag,
      kp: typeof item.Kp === 'number' ? item.Kp : parseFloat(item.Kp) || 0,
      stationCount: item.station_count
    }));
    const lastKpEntry = kpData[kpData.length - 1];
    if (lastKpEntry && lastKpEntry.Kp !== undefined) {
      currentKp = typeof lastKpEntry.Kp === 'number' ? lastKpEntry.Kp : parseFloat(lastKpEntry.Kp) || 2.0;
    }
  }

  // Parse Bz and Bt
  let bz = -1.5;
  let bt = 4.2;
  let magTime = null;
  if (Array.isArray(magData) && magData.length > 0) {
    const latestMag = magData[0];
    if (latestMag.bz_gsm !== undefined) bz = parseFloat(latestMag.bz_gsm);
    if (latestMag.bt !== undefined) bt = parseFloat(latestMag.bt);
    magTime = latestMag.time_tag;
  }

  // Parse Speed
  let speed = 410;
  let speedTime = null;
  if (Array.isArray(speedData) && speedData.length > 0) {
    const latestSpeed = speedData[0];
    if (latestSpeed.proton_speed !== undefined) speed = parseFloat(latestSpeed.proton_speed);
    speedTime = latestSpeed.time_tag;
  }

  return {
    currentKp,
    kpHistory,
    bz,
    bt,
    speed,
    magTime,
    speedTime,
    isLive: Boolean(kpData || magData || speedData),
    timestamp: new Date().toISOString()
  };
}

export async function fetchOpenMeteoForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,temperature_2m,dew_point_2m,wind_speed_10m&daily=sunrise,sunset,moonrise,moonset,moon_phase&timezone=auto&forecast_days=3`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo weather API returned HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

export async function searchGeocoding(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (e) {
    console.error("Geocoding failed", e);
    return [];
  }
}

export async function fetchIpLocation() {
  // Primary: ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const placeName = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          placeName: placeName || "Your Network Location",
          city: data.city || "",
          country: data.country_name || ""
        };
      }
    }
  } catch (err) {
    console.warn("ipapi.co failed, trying ipwho.is fallback:", err);
  }

  // Secondary fallback: ipwho.is
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const placeName = [data.city, data.region, data.country].filter(Boolean).join(', ');
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          placeName: placeName || "Your Network Location",
          city: data.city || "",
          country: data.country || ""
        };
      }
    }
  } catch (err) {
    console.error("IP geolocation failed entirely:", err);
  }

  throw new Error("Unable to determine location from IP network.");
}
