import React, { useMemo } from 'react';
import { Compass, Zap, Gauge, Wind, ShieldAlert, Sparkles, Info } from 'lucide-react';
import { calculateAuroraLikelihood } from '../utils/astronomy';

export default function AuroraGauge({ spaceWeather, magLat, isNight }) {
  const { currentKp = 0, bz = 0, bt = 0, speed = 0, kpHistory = [], isLive } = spaceWeather || {};

  const likelihood = useMemo(() => {
    return calculateAuroraLikelihood(currentKp, bz, speed, magLat, isNight);
  }, [currentKp, bz, speed, magLat, isNight]);

  // SVG Gauge calculations
  // Angle from -90deg (left) to +90deg (right) -> 180 degree arc
  const score = likelihood.score;
  const angle = -90 + (score / 100) * 180;
  
  // Radius and arc math
  const r = 90;
  const cx = 130;
  const cy = 120;
  
  // Gauge color based on score
  const getGradientStop = () => {
    if (score >= 70) return '#10b981';
    if (score >= 45) return '#06b6d4';
    if (score >= 25) return '#eab308';
    return '#64748b';
  };

  const isBzSouthward = bz < 0;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-cyan-950/40">
      {/* Background ambient aurora glow */}
      <div 
        className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: likelihood.color }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Aurora Likelihood
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                NOAA SWPC
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live Kp &amp; Interplanetary Magnetic Field (IMF)</p>
          </div>
        </div>

        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            LIVE FEED
          </span>
        )}
      </div>

      {/* Gauge & Main Rating Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Semi-Circle Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 260 155" className="w-56 h-auto drop-shadow-lg">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="35%" stopColor="#06b6d4" />
                <stop offset="70%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <path
              d="M 40 120 A 90 90 0 0 1 220 120"
              fill="none"
              stroke="#1e293b"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Colored Active Arc Track */}
            <path
              d="M 40 120 A 90 90 0 0 1 220 120"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * (score / 100))}
              className="transition-all duration-1000 ease-out"
            />

            {/* Gauge Tick Labels */}
            <text x="38" y="142" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">0%</text>
            <text x="130" y="24" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">50%</text>
            <text x="222" y="142" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">100%</text>

            {/* Needle Pivot & Needle */}
            <g transform={`rotate(${angle}, ${cx}, ${cy})`} className="transition-transform duration-1000 ease-out">
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - r + 8}
                stroke={likelihood.color}
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#needleGlow)"
              />
              <circle cx={cx} cy={cy} r="6" fill="#f8fafc" />
              <circle cx={cx} cy={cy} r="10" fill="none" stroke={likelihood.color} strokeWidth="2" />
            </g>
          </svg>

          {/* Center Score Reading */}
          <div className="text-center -mt-3">
            <div className="text-3xl font-extrabold tracking-tight font-mono" style={{ color: likelihood.color }}>
              {likelihood.score}%
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-0.5">
              {likelihood.category}
            </div>
          </div>
        </div>

        {/* Space Weather Physics Parameter Breakdown */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* Key Metric Badges */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Kp Index */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Planetary Kp</span>
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {currentKp.toFixed(1)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {currentKp >= 5 ? '⚡ Geomagnetic Storm' : currentKp >= 3 ? 'Unsettled' : 'Quiet'}
              </div>
            </div>

            {/* Solar Wind Bz */}
            <div className={`p-3 rounded-xl border ${
              isBzSouthward 
                ? 'bg-emerald-950/30 border-emerald-700/50' 
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>IMF Bz</span>
                <Compass className={`w-3.5 h-3.5 ${isBzSouthward ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div className={`text-xl font-bold font-mono flex items-center gap-1 ${
                isBzSouthward ? 'text-emerald-300' : 'text-slate-200'
              }`}>
                {bz >= 0 ? `+${bz.toFixed(1)}` : bz.toFixed(1)} <span className="text-xs font-normal text-slate-400">nT</span>
              </div>
              <div className={`text-[11px] font-medium mt-0.5 ${
                isBzSouthward ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {isBzSouthward ? '▼ Southward (Active!)' : '▲ Northward (Shielded)'}
              </div>
            </div>

            {/* Solar Wind Speed */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Solar Speed</span>
                <Wind className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-sky-300">
                {Math.round(speed)} <span className="text-xs font-normal text-slate-400">km/s</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {speed >= 550 ? 'Fast stream' : speed >= 420 ? 'Moderate' : 'Nominal'}
              </div>
            </div>
          </div>

          {/* Location Auroral Oval Status */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Geomagnetic Latitude: <strong className="text-white font-mono">{magLat}°</strong>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Req. Kp: {likelihood.requiredKp.horizon.toFixed(1)} - {likelihood.requiredKp.overhead.toFixed(1)}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {likelihood.horizonVerdict}
            </p>
          </div>

          {/* Daylight Warning if applicable */}
          {!isNight && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Daylight or twilight currently suppresses optical viewing. Check the night window below!</span>
            </div>
          )}

          {/* Past 24h Kp mini trend sparkline */}
          {kpHistory.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Recent Kp Trend (NOAA 3h epochs)</span>
                <span>Max: {Math.max(...kpHistory.map(k => k.kp)).toFixed(1)}</span>
              </div>
              <div className="flex items-end gap-1.5 h-8 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50">
                {kpHistory.map((item, idx) => {
                  const barHeight = Math.max(15, (item.kp / 9) * 100);
                  const isLatest = idx === kpHistory.length - 1;
                  const barColor = item.kp >= 5 ? '#ef4444' : item.kp >= 3 ? '#eab308' : '#06b6d4';
                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    >
                      <div 
                        className={`w-full rounded-t transition-all ${isLatest ? 'ring-1 ring-white' : ''}`}
                        style={{ height: `${barHeight}%`, backgroundColor: barColor }}
                      />
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-white font-mono whitespace-nowrap pointer-events-none z-20 border border-slate-700">
                        Kp {item.kp.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
