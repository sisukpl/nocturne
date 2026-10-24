// Astronomy and Aurora physics calculation utilities

/**
 * Calculates geomagnetic latitude from geographic latitude & longitude.
 * Using dipole approximation centered at approximately 80.7°N, -72.7°W
 */
export function getGeomagneticLatitude(lat, lon) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  
  const phi0 = (80.7 * Math.PI) / 180; // geomagnetic pole latitude
  const lambda0 = (-72.7 * Math.PI) / 180; // geomagnetic pole longitude
  
  const sinMagLat = 
    Math.sin(phi) * Math.sin(phi0) + 
    Math.cos(phi) * Math.cos(phi0) * Math.cos(lambda - lambda0);
    
  return (Math.asin(Math.max(-1, Math.min(1, sinMagLat))) * 180) / Math.PI;
}

/**
 * Minimum Kp required for aurora overhead and on horizon based on geomagnetic latitude
 */
export function getRequiredKpForAurora(magLat) {
  const absMagLat = Math.abs(magLat);
  
  if (absMagLat >= 66) return { overhead: 1.0, horizon: 0.3 };
  if (absMagLat >= 63) return { overhead: 2.0, horizon: 1.0 };
  if (absMagLat >= 60) return { overhead: 3.0, horizon: 1.5 };
  if (absMagLat >= 57) return { overhead: 4.0, horizon: 2.5 };
  if (absMagLat >= 54) return { overhead: 5.0, horizon: 3.5 };
  if (absMagLat >= 50) return { overhead: 6.0, horizon: 4.5 };
  if (absMagLat >= 46) return { overhead: 7.0, horizon: 5.5 };
  if (absMagLat >= 42) return { overhead: 8.0, horizon: 6.5 };
  return { overhead: 9.0, horizon: 7.5 };
}

/**
 * Calculates Aurora Likelihood (0 to 100%)
 * Factors:
 * - Current Kp vs required Kp for geomagnetic latitude
 * - Solar Wind Bz (negative = southward coupling = booster)
 * - Solar Wind Speed (km/s)
 * - Is it night/dark? (daylight visual inhibitor)
 */
export function calculateAuroraLikelihood(currentKp, bz, speed, magLat, isDark = true) {
  const absMagLat = Math.abs(magLat);
  const required = getRequiredKpForAurora(absMagLat);
  
  // Base score from Kp vs threshold
  let kpScore = 0;
  if (currentKp >= required.overhead) {
    kpScore = 75 + Math.min(25, (currentKp - required.overhead) * 12);
  } else if (currentKp >= required.horizon) {
    const range = required.overhead - required.horizon;
    const progress = (currentKp - required.horizon) / (range || 1);
    kpScore = 35 + progress * 35;
  } else {
    const deficit = required.horizon - currentKp;
    kpScore = Math.max(5, 30 - deficit * 15);
  }

  // Bz Factor (-20nT to +15nT)
  // Negative Bz is SOUTHWARD -> drives magnetic reconnection -> big boost
  // Positive Bz is NORTHWARD -> shields Earth -> reduces activity
  let bzFactor = 1.0;
  if (bz !== null && bz !== undefined) {
    if (bz <= -15) bzFactor = 1.45;
    else if (bz <= -8) bzFactor = 1.30;
    else if (bz <= -3) bzFactor = 1.15;
    else if (bz < 0) bzFactor = 1.05;
    else if (bz <= 3) bzFactor = 0.90;
    else if (bz <= 8) bzFactor = 0.75;
    else bzFactor = 0.60;
  }

  // Wind speed factor (nominal ~350-400 km/s)
  let speedFactor = 1.0;
  if (speed) {
    if (speed >= 700) speedFactor = 1.30;
    else if (speed >= 550) speedFactor = 1.18;
    else if (speed >= 450) speedFactor = 1.08;
    else if (speed < 320) speedFactor = 0.90;
  }

  let finalLikelihood = Math.round(Math.min(99, Math.max(2, kpScore * bzFactor * speedFactor)));

  // Determine visibility category
  let category = "Minimal";
  let color = "#64748b"; // slate
  if (finalLikelihood >= 80) {
    category = "Very High (Overhead Active)";
    color = "#10b981"; // emerald
  } else if (finalLikelihood >= 60) {
    category = "High (Visible on Horizon/Overhead)";
    color = "#06b6d4"; // cyan
  } else if (finalLikelihood >= 40) {
    category = "Moderate (Camera & Horizon Chance)";
    color = "#eab308"; // yellow
  } else if (finalLikelihood >= 20) {
    category = "Low (Faint Camera Only)";
    color = "#f97316"; // orange
  }

  let horizonVerdict = "";
  if (currentKp >= required.overhead) {
    horizonVerdict = "Overhead visibility likely (Direct storm overhead)";
  } else if (currentKp >= required.horizon) {
    horizonVerdict = "Northern/Southern horizon viewable with dark sky";
  } else {
    horizonVerdict = `Needs Kp ≥ ${required.horizon.toFixed(1)} for horizon, Kp ≥ ${required.overhead.toFixed(1)} for overhead`;
  }

  return {
    score: finalLikelihood,
    category,
    color,
    magLat: Math.round(magLat * 10) / 10,
    requiredKp: required,
    horizonVerdict,
    isDark
  };
}

/**
 * Calculates Moon phase details from Open-Meteo moon_phase (0 to 1) or date
 */
export function getMoonDetails(moonPhaseVal) {
  // moonPhaseVal ranges 0 to 1 in Open-Meteo:
  // 0 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter, 1 = New Moon
  const phase = moonPhaseVal !== undefined && moonPhaseVal !== null ? moonPhaseVal : 0.5;
  
  // Calculate Illumination %: Full at 0.5, 0 at 0 or 1
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
  
  let name = "";
  let description = "";
  let iconType = "";
  
  if (phase < 0.03 || phase > 0.97) {
    name = "New Moon";
    description = "Pristine dark skies! Ideal for deep space astrophotography and faint nebulae.";
    iconType = "new";
  } else if (phase < 0.22) {
    name = "Waxing Crescent";
    description = "Delicate crescent with minimal light interference. Superb for stargazing after moonset.";
    iconType = "waxing-crescent";
  } else if (phase <= 0.28) {
    name = "First Quarter";
    description = "Half illuminated. Moon sets around midnight, offering dark morning hours.";
    iconType = "first-quarter";
  } else if (phase < 0.47) {
    name = "Waxing Gibbous";
    description = "Bright moonlight washes out faint DSOs. Great for lunar crater observation.";
    iconType = "waxing-gibbous";
  } else if (phase <= 0.53) {
    name = "Full Moon";
    description = "Maximum sky brightness. Washes out Milky Way and faint stars; high lunar contrast.";
    iconType = "full";
  } else if (phase < 0.72) {
    name = "Waning Gibbous";
    description = "Rises later in the evening, leaving dark skies during earlier evening hours.";
    iconType = "waning-gibbous";
  } else if (phase <= 0.78) {
    name = "Last Quarter";
    description = "Half illuminated in the dawn sky. Excellent early-to-midnight dark sky window.";
    iconType = "last-quarter";
  } else {
    name = "Waning Crescent";
    description = "Thin crescent rising just before dawn. Exceptional dark sky conditions tonight!";
    iconType = "waning-crescent";
  }

  return {
    phaseValue: phase,
    illumination,
    name,
    description,
    iconType,
    ageDays: (phase * 29.53).toFixed(1)
  };
}

/**
 * Atmospheric transparency score based on cloud layers & dew point spread
 */
export function calculateTransparency(total, low, mid, high, temp, dewPoint) {
  // Low clouds are thickest blocker, high clouds are thinnest
  const effectiveCloudPenalty = (low * 0.5) + (mid * 0.35) + (high * 0.15);
  let transparency = Math.max(0, 100 - effectiveCloudPenalty);
  
  // Dew point spread penalty: if air temp is close to dew point (< 2°C), high fog/dew risk
  let dewRisk = "Low";
  let dewPenalty = 0;
  if (temp !== undefined && dewPoint !== undefined) {
    const spread = temp - dewPoint;
    if (spread <= 1.0) {
      dewRisk = "Critical (Fog/Dew Forming)";
      dewPenalty = 20;
    } else if (spread <= 2.5) {
      dewRisk = "Moderate (Lens Heater Recommended)";
      dewPenalty = 10;
    } else {
      dewRisk = "Low (Dry Optics)";
    }
  }

  const finalTransparency = Math.max(5, Math.round(transparency - dewPenalty));
  
  return {
    transparency: finalTransparency,
    dewRisk
  };
}

/**
 * Calculates Sun altitude approximately for a given latitude, longitude and Date
 */
export function getApproxSunAltitude(date, lat, lon) {
  // Day of year
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Declination of Sun
  const declination = -23.44 * Math.cos(((360 / 365) * (dayOfYear + 10) * Math.PI) / 180);
  const decRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  
  // Solar time
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarTime = (utcHours + lon / 15) % 24;
  const hourAngle = (solarTime - 12) * 15;
  const haRad = (hourAngle * Math.PI) / 180;
  
  // Altitude
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  return (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;
}

/**
 * Generates Tonight's Combined Clear Sky Timeline & Score for next 24 hours
 */
export function computeClearSkyTimeline(hourlyData, dailyData, lat, lon) {
  if (!hourlyData || !hourlyData.time) return [];

  const now = new Date();
  const times = hourlyData.time;
  const timeline = [];

  for (let i = 0; i < times.length && timeline.length < 24; i++) {
    const hourDate = new Date(times[i]);
    // Skip past hours
    if (hourDate.getTime() < now.getTime() - 45 * 60 * 1000) continue;

    const totalCloud = hourlyData.cloud_cover ? hourlyData.cloud_cover[i] : 0;
    const lowCloud = hourlyData.cloud_cover_low ? hourlyData.cloud_cover_low[i] : 0;
    const midCloud = hourlyData.cloud_cover_mid ? hourlyData.cloud_cover_mid[i] : 0;
    const highCloud = hourlyData.cloud_cover_high ? hourlyData.cloud_cover_high[i] : 0;
    const temp = hourlyData.temperature_2m ? hourlyData.temperature_2m[i] : 10;
    const dewPoint = hourlyData.dew_point_2m ? hourlyData.dew_point_2m[i] : 5;
    const visibility = hourlyData.visibility ? Math.round(hourlyData.visibility[i] / 1000) : 20;

    const sunAlt = getApproxSunAltitude(hourDate, lat, lon);
    
    // Twilight classifications
    let darknessCategory = "Daylight";
    let darknessScore = 0;
    if (sunAlt < -18) {
      darknessCategory = "Astronomical Night (Pitch Dark)";
      darknessScore = 100;
    } else if (sunAlt < -12) {
      darknessCategory = "Nautical Twilight";
      darknessScore = 70;
    } else if (sunAlt < -6) {
      darknessCategory = "Civil Twilight";
      darknessScore = 35;
    } else if (sunAlt <= 0) {
      darknessCategory = "Golden Hour / Sunset";
      darknessScore = 15;
    } else {
      darknessCategory = "Daylight";
      darknessScore = 0;
    }

    // Cloud score (100 when 0 clouds, 0 when 100 clouds)
    const cloudPenalty = (lowCloud * 0.5) + (midCloud * 0.35) + (highCloud * 0.15);
    const cloudScore = Math.max(0, 100 - cloudPenalty);

    // Dew and transparency
    const { transparency, dewRisk } = calculateTransparency(totalCloud, lowCloud, midCloud, highCloud, temp, dewPoint);

    // Composite Stargazing Rating
    // If it's daylight, stargazing score is 0
    let stargazingScore = 0;
    if (sunAlt <= -6) {
      stargazingScore = Math.round(
        (cloudScore * 0.55) + 
        (darknessScore * 0.25) + 
        (transparency * 0.20)
      );
    } else if (sunAlt <= 0) {
      stargazingScore = Math.round((cloudScore * 0.2) + 5);
    }

    let quality = "Poor";
    let qualityColor = "#ef4444"; // red
    if (stargazingScore >= 80) {
      quality = "Pristine";
      qualityColor = "#10b981"; // emerald
    } else if (stargazingScore >= 60) {
      quality = "Good";
      qualityColor = "#06b6d4"; // cyan
    } else if (stargazingScore >= 40) {
      quality = "Fair";
      qualityColor = "#eab308"; // amber
    }

    timeline.push({
      timeStr: times[i],
      dateObj: hourDate,
      hourLabel: hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayLabel: hourDate.toLocaleDateString([], { weekday: 'short' }),
      totalCloud,
      lowCloud,
      midCloud,
      highCloud,
      transparency,
      temp,
      dewPoint,
      dewRisk,
      visibilityKm: visibility,
      sunAlt: Math.round(sunAlt * 10) / 10,
      darknessCategory,
      isNight: sunAlt < -6,
      isAstroNight: sunAlt < -18,
      stargazingScore,
      quality,
      qualityColor
    });
  }

  return timeline;
}

/**
 * Finds the continuous best clear sky window tonight
 */
export function findBestWindow(timeline) {
  if (!timeline || timeline.length === 0) return null;

  // Filter night hours
  const nightHours = timeline.filter(h => h.isNight);
  if (nightHours.length === 0) {
    return {
      title: "No dark sky tonight (Midnight Sun or Day)",
      summary: "Sun does not drop below -6° horizon at this latitude currently.",
      bestScore: 0,
      hoursCount: 0
    };
  }

  // Find longest contiguous run of score >= 55
  let bestRun = [];
  let currentRun = [];

  for (const h of nightHours) {
    if (h.stargazingScore >= 55) {
      currentRun.push(h);
    } else {
      if (currentRun.length > bestRun.length) {
        bestRun = [...currentRun];
      }
      currentRun = [];
    }
  }
  if (currentRun.length > bestRun.length) {
    bestRun = [...currentRun];
  }

  if (bestRun.length >= 2) {
    const avgScore = Math.round(bestRun.reduce((acc, h) => acc + h.stargazingScore, 0) / bestRun.length);
    const start = bestRun[0].hourLabel;
    const end = bestRun[bestRun.length - 1].hourLabel;
    return {
      title: `Prime Stargazing Window: ${start} – ${end}`,
      summary: `${bestRun.length} consecutive hours of clear dark skies tonight (Avg Quality: ${avgScore}/100)`,
      avgScore,
      hoursCount: bestRun.length,
      start,
      end,
      recommendation: avgScore >= 80 
        ? "Exceptional night! Set up telescopes for deep sky objects, nebulae, and astro-imaging."
        : "Good conditions for planetary observing, Milky Way viewing, and bright clusters."
    };
  } else if (bestRun.length === 1) {
    return {
      title: `Brief Window: ${bestRun[0].hourLabel}`,
      summary: `Quick 1-hour clearing with score ${bestRun[0].stargazingScore}/100.`,
      avgScore: bestRun[0].stargazingScore,
      hoursCount: 1,
      recommendation: "Short observation slot. Keep grab-and-go binoculars or telescope ready."
    };
  }

  // Otherwise pick highest single hour
  const topHour = [...nightHours].sort((a, b) => b.stargazingScore - a.stargazingScore)[0];
  return {
    title: "High Clouds / Overcast Tonight",
    summary: `Best brief opportunity around ${topHour.hourLabel} with score ${topHour.stargazingScore}/100`,
    avgScore: topHour.stargazingScore,
    hoursCount: 0,
    recommendation: "Cloud cover expected to obstruct most observation. Check back tomorrow or monitor satellite breaks."
  };
}
