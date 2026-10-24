import React, { useMemo, useState } from 'react';
import { Telescope, Sparkles, Clock, CheckCircle2, AlertTriangle, CloudSun, Eye, Compass, Moon } from 'lucide-react';
import { findBestWindow } from '../utils/astronomy';

export default function ClearSkyWindowTimeline({ timeline = [], moonPhase = 0 }) {
  const [selectedHour, setSelectedHour] = useState(null);

  const bestWindow = useMemo(() => {
    return findBestWindow(timeline);
  }, [timeline]);

  // Night hours (or all upcoming 16 hours)
  const displayHours = timeline.slice(0, 18);
  const activeHour = selectedHour || displayHours.find(h => h.isNight && h.stargazingScore >= 60) || displayHours[0];

  return (
    <div className="glass-panel rounded-2xl p-6 relative transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Telescope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Combined 'Clear Sky Window' Tonight
            </h2>
            <p className="text-xs text-slate-400">
              Optimal telescope &amp; camera windows factoring darkness, cloud layers &amp; lunar wash
            </p>
          </div>
        </div>

        {bestWindow && bestWindow.hoursCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Best Tonight: <strong>{bestWindow.start} – {bestWindow.end}</strong></span>
          </div>
        )}
      </div>

      {/* Prime Observation Window Hero Card */}
      {bestWindow && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 border border-emerald-500/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                  ★ {bestWindow.title}
                </span>
                {bestWindow.avgScore > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                    Score: {bestWindow.avgScore}/100
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200 font-medium mt-1">
                {bestWindow.summary}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {bestWindow.recommendation}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs">
              <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                <span className="font-bold text-slate-100">{bestWindow.hoursCount}h</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Clarity</span>
                <span className="font-bold text-cyan-300">
                  {bestWindow.avgScore >= 75 ? 'Optimal' : bestWindow.avgScore >= 50 ? 'Good' : 'Challenging'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Timeline Interactive Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>Hour-by-Hour Stargazing Forecast (Click an hour to inspect gear advice)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Pristine</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" /> Good</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Marginal</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> Obstructed</span>
          </div>
        </div>

        {/* Horizontal Scrollable Timeline Bar */}
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-18 gap-1.5 overflow-x-auto pb-2">
          {displayHours.map((h, idx) => {
            const isSelected = activeHour && activeHour.timeStr === h.timeStr;
            const score = h.stargazingScore;

            let bgColor = "bg-slate-800/40 border-slate-800 text-slate-400";
            if (h.isNight) {
              if (score >= 80) bgColor = "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70";
              else if (score >= 60) bgColor = "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60";
              else if (score >= 40) bgColor = "bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/50";
              else bgColor = "bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800";
            }

            return (
              <button
                key={idx}
                onClick={() => setSelectedHour(h)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between min-w-[58px] transition-all cursor-pointer ${bgColor} ${
                  isSelected ? 'ring-2 ring-white scale-105 z-10' : ''
                }`}
              >
                <span className="font-mono text-xs font-bold">{h.hourLabel}</span>
                
                {/* Score badge / cloud icon */}
                <div className="my-1.5">
                  {h.isNight ? (
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold"
                      style={{ backgroundColor: `${h.qualityColor}25`, color: h.qualityColor }}
                    >
                      {score}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400/80">
                      <CloudSun className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-300">
                  {h.totalCloud}% cld
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Deep Inspection & Gear Checklist */}
      {activeHour && (
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100 font-mono text-sm">
                Conditions at {activeHour.hourLabel} ({activeHour.dayLabel})
              </span>
              <span 
                className="px-2 py-0.5 rounded-full font-mono font-semibold text-[11px]"
                style={{ backgroundColor: `${activeHour.qualityColor}20`, color: activeHour.qualityColor }}
              >
                {activeHour.quality} Stargazing ({activeHour.stargazingScore}/100)
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span>Sky: <strong className="text-slate-200">{activeHour.darknessCategory}</strong></span>
              <span>Sun Alt: <strong className="text-slate-200">{activeHour.sunAlt}°</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
            {/* Atmosphere & Cloud breakdown */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Atmospheric Stability
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Transparency:</span>
                  <strong className="text-emerald-400">{activeHour.transparency}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cloud Cover:</span>
                  <strong className="text-sky-400">{activeHour.totalCloud}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{activeHour.temp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Dew Point:</span>
                  <span>{activeHour.dewPoint}°C</span>
                </div>
              </div>
            </div>

            {/* Telescope Target Recommendations */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                <Telescope className="w-3.5 h-3.5 text-indigo-400" /> Best Optical Targets
              </span>
              <div className="space-y-1 text-slate-300">
                {activeHour.stargazingScore >= 75 ? (
                  <>
                    <p className="text-emerald-300">✓ Deep Sky: Andromeda (M31), Orion Nebula (M42)</p>
                    <p className="text-cyan-300">✓ Milky Way core &amp; high-ISO widefield starscapes</p>
                    <p className="text-slate-300">✓ Faint star clusters (Pleiades, Double Cluster)</p>
                  </>
                ) : activeHour.stargazingScore >= 45 ? (
                  <>
                    <p className="text-cyan-300">✓ Bright Planets: Jupiter, Saturn &amp; Mars</p>
                    <p className="text-slate-300">✓ Lunar limb craters &amp; terminator shadows</p>
                    <p className="text-slate-400">✗ Faint nebulae washed out by haze/clouds</p>
                  </>
                ) : (
                  <p className="text-slate-400">
                    Sky obstructed by clouds or twilight. Great time to plan equipment, charge batteries, or collimate optics indoors.
                  </p>
                )}
              </div>
            </div>

            {/* Dew & Equipment Preparation */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${activeHour.dewRisk.includes('Critical') ? 'text-rose-400' : 'text-amber-400'}`} />
                Equipment Checklist
              </span>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-mono">Dew:</span>
                  <span className={activeHour.dewRisk.includes('Critical') ? 'text-rose-400 font-semibold' : 'text-slate-200'}>
                    {activeHour.dewRisk}
                  </span>
                </div>
                <p className="text-slate-400">
                  {activeHour.temp - activeHour.dewPoint <= 2.0
                    ? '⚠️ High moisture: Dew heaters / lens hoods required to prevent optical fogging.'
                    : '✓ Dry lens conditions. Standard dew shield is sufficient.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
