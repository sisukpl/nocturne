import React, { useMemo } from 'react';
import { Moon, ArrowUpRight, ArrowDownRight, Sparkles, Camera, Eye } from 'lucide-react';
import { getMoonDetails } from '../utils/astronomy';

export default function MoonPhaseIndicator({ dailyData }) {
  const moonDetails = useMemo(() => {
    const phaseVal = dailyData && dailyData.moon_phase ? dailyData.moon_phase[0] : 0.45;
    return getMoonDetails(phaseVal);
  }, [dailyData]);

  const moonriseTime = dailyData && dailyData.moonrise && dailyData.moonrise[0] 
    ? new Date(dailyData.moonrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const moonsetTime = dailyData && dailyData.moonset && dailyData.moonset[0]
    ? new Date(dailyData.moonset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  // Realistic Moon rendering using SVG mask and elliptical shadow
  // Phase 0: New Moon (all dark)
  // Phase 0.25: First Quarter (right half bright in Northern hemisphere)
  // Phase 0.5: Full Moon (all bright)
  // Phase 0.75: Last Quarter (left half bright)
  const phase = moonDetails.phaseValue;
  
  // Calculate SVG illumination mask
  const isWaxing = phase <= 0.5;
  // Normalized x offset for terminator curvature
  // At 0: dark; at 0.25: half; at 0.5: full
  const fraction = phase <= 0.5 ? phase * 2 : (1 - phase) * 2; // 0 to 1
  const rx = Math.abs(50 - fraction * 100);

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
      {/* Background soft lunar glow */}
      <div 
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: phase >= 0.35 && phase <= 0.65 ? '#cbd5e1' : '#38bdf8' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Moon Phase &amp; Illumination</h2>
            <p className="text-xs text-slate-400">Lunar cycle and dark-sky interference rating</p>
          </div>
        </div>

        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Age: {moonDetails.ageDays}d / 29.5d
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Photorealistic Moon SVG Canvas */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 rounded-full p-1 border border-slate-700/50 shadow-2xl shadow-indigo-950/40 bg-slate-950">
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full drop-shadow-md">
              <defs>
                {/* Surface texture simulating lunar mare and highland craters */}
                <radialGradient id="lunarSurface" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="65%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </radialGradient>
                <radialGradient id="darkSurface" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                {/* Subtle crater texture pattern */}
                <pattern id="craters" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="2.5" fill="#94a3b8" opacity="0.3" />
                  <circle cx="14" cy="12" r="3.5" fill="#475569" opacity="0.35" />
                  <circle cx="10" cy="16" r="1.5" fill="#64748b" opacity="0.25" />
                </pattern>
              </defs>

              {/* Base Moon Sphere (Lit side) */}
              <circle cx="50" cy="50" r="48" fill="url(#lunarSurface)" />
              <circle cx="50" cy="50" r="48" fill="url(#craters)" />

              {/* Dynamic Lunar Terminator Shadow */}
              {phase === 0 ? (
                // Full Shadow (New Moon)
                <circle cx="50" cy="50" r="48" fill="url(#darkSurface)" opacity="0.96" />
              ) : phase >= 0.49 && phase <= 0.51 ? (
                // Full Moon - No Shadow
                null
              ) : phase < 0.5 ? (
                // Waxing: Left side dark
                <path
                  d={
                    phase < 0.25
                      ? `M 50 2 A 48 48 0 0 0 50 98 A ${rx} 48 0 0 0 50 2 Z` // Crescent
                      : `M 50 2 A 48 48 0 0 0 50 98 A ${rx} 48 0 0 1 50 2 Z` // Gibbous
                  }
                  fill="url(#darkSurface)"
                  opacity="0.95"
                />
              ) : (
                // Waning: Right side dark
                <path
                  d={
                    phase > 0.75
                      ? `M 50 2 A 48 48 0 0 1 50 98 A ${rx} 48 0 0 1 50 2 Z` // Crescent
                      : `M 50 2 A 48 48 0 0 1 50 98 A ${rx} 48 0 0 0 50 2 Z` // Gibbous
                  }
                  fill="url(#darkSurface)"
                  opacity="0.95"
                />
              )}

              {/* Outer atmospheric edge rim */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            </svg>
          </div>

          <div className="text-center mt-3">
            <div className="text-xl font-extrabold text-slate-100 font-mono">
              {moonDetails.illumination}%
            </div>
            <div className="text-xs font-semibold text-cyan-300">
              {moonDetails.name}
            </div>
          </div>
        </div>

        {/* Lunar Times & Stargazing Impact */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* Moonrise / Moonset chips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Moonrise</span>
                <span className="text-base font-bold font-mono text-slate-100">{moonriseTime}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Moonset</span>
                <span className="text-base font-bold font-mono text-slate-100">{moonsetTime}</span>
              </div>
            </div>
          </div>

          {/* Description & Impact */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Astrophotography Advice
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {moonDetails.description}
            </p>
          </div>

          {/* Target Recommendation based on illumination */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Deep Sky (DSO)</strong>
                <span className="text-slate-400">
                  {moonDetails.illumination <= 25 ? 'Excellent (Dark Sky)' : moonDetails.illumination <= 60 ? 'Fair after Moonset' : 'Poor (Washout)'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Lunar Observation</strong>
                <span className="text-slate-400">
                  {moonDetails.illumination > 15 ? 'High Contrast Craters' : 'Too Faint'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
