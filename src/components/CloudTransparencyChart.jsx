import React, { useState } from 'react';
import { Cloud, Eye, Droplets, Sun, Moon, Sparkles, Layers } from 'lucide-react';

export default function CloudTransparencyChart({ timeline = [] }) {
  const [viewHours, setViewHours] = useState(12);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Slice timeline to requested hours
  const hoursData = timeline.slice(0, viewHours);

  if (!hoursData || hoursData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-slate-400">
        Loading hourly cloud cover data...
      </div>
    );
  }

  // Active hover item or first night hour or first hour
  const activeItem = hoveredIndex !== null && hoursData[hoveredIndex] 
    ? hoursData[hoveredIndex] 
    : hoursData[0];

  // SVG Chart Dimensions
  const chartHeight = 160;
  const paddingX = 24;
  const paddingY = 20;
  const innerHeight = chartHeight - paddingY * 2;

  // Generate SVG points for cloud cover and transparency
  const stepX = hoursData.length > 1 ? (600 - paddingX * 2) / (hoursData.length - 1) : 0;

  // Points for Total Cloud Cover line
  const cloudPoints = hoursData.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + (1 - (d.totalCloud / 100)) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  // Points for Transparency line
  const transparencyPoints = hoursData.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + (1 - (d.transparency / 100)) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="glass-panel rounded-2xl p-6 relative transition-all duration-300">
      {/* Header with 12h / 24h Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Cloud Cover &amp; Transparency Chart
            </h2>
            <p className="text-xs text-slate-400">Layered cloud breakdown (Low/Mid/High) &amp; Seeing Quality</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setViewHours(12)}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewHours === 12
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next 12 Hours
          </button>
          <button
            onClick={() => setViewHours(24)}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewHours === 24
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24 Hours
          </button>
        </div>
      </div>

      {/* Legend & Hovered Detail Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Inspected Hour</span>
          <span className="font-mono font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
            {activeItem.isNight ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            {activeItem.hourLabel} ({activeItem.dayLabel})
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Total Cloud Cover</span>
          <span className="font-mono font-bold text-sky-400 mt-0.5 block">
            {activeItem.totalCloud}% ({activeItem.totalCloud <= 20 ? 'Clear' : activeItem.totalCloud <= 60 ? 'Scattered' : 'Overcast'})
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Sky Transparency</span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
            {activeItem.transparency}% ({activeItem.transparency >= 75 ? 'Pristine' : activeItem.transparency >= 50 ? 'Moderate' : 'Poor'})
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Dew &amp; Condensation</span>
          <span className={`font-mono font-bold mt-0.5 block ${
            activeItem.dewRisk.includes('Critical') ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {activeItem.temp}°C / Dew {activeItem.dewPoint}°C
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[580px]">
          <svg viewBox="0 0 600 160" className="w-full h-40 overflow-visible">
            <defs>
              <linearGradient id="cloudAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="transparencyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Twilight / Night bands */}
            {hoursData.map((d, i) => {
              const x = paddingX + i * stepX - (stepX / 2);
              const w = stepX;
              // Shading based on darkness
              let fill = "rgba(15, 23, 42, 0.2)"; // daylight
              if (d.isAstroNight) fill = "rgba(4, 8, 20, 0.75)"; // pitch black
              else if (d.isNight) fill = "rgba(12, 19, 43, 0.5)"; // twilight

              return (
                <rect
                  key={`bg-${i}`}
                  x={Math.max(0, x)}
                  y={paddingY}
                  width={w}
                  height={innerHeight}
                  fill={fill}
                  className="transition-colors"
                />
              );
            })}

            {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
            {[0, 25, 50, 75, 100].map(val => {
              const y = paddingY + (1 - val / 100) * innerHeight;
              return (
                <g key={`grid-${val}`}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={600 - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    fill="#475569"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="var(--font-mono)"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill for Total Cloud Cover */}
            <polygon
              points={`${paddingX},${chartHeight - paddingY} ${cloudPoints} ${600 - paddingX},${chartHeight - paddingY}`}
              fill="url(#cloudAreaGrad)"
            />

            {/* Line: Total Cloud Cover */}
            <polyline
              points={cloudPoints}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line: Transparency Rating */}
            <polyline
              points={transparencyPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />

            {/* Hover Guides & Interactive Points */}
            {hoursData.map((d, i) => {
              const x = paddingX + i * stepX;
              const yCloud = paddingY + (1 - (d.totalCloud / 100)) * innerHeight;
              const yTrans = paddingY + (1 - (d.transparency / 100)) * innerHeight;
              const isSelected = hoveredIndex === i;

              return (
                <g 
                  key={`pt-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  {/* Invisible hit column */}
                  <rect
                    x={x - stepX / 2}
                    y={paddingY}
                    width={stepX}
                    height={innerHeight}
                    fill="transparent"
                  />

                  {/* Active vertical cursor line */}
                  {isSelected && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={chartHeight - paddingY}
                      stroke="#67e8f9"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Dots for Cloud Cover */}
                  <circle
                    cx={x}
                    cy={yCloud}
                    r={isSelected ? 5 : 3}
                    fill="#38bdf8"
                    stroke="#0b1120"
                    strokeWidth="2"
                  />

                  {/* Dots for Transparency */}
                  <circle
                    cx={x}
                    cy={yTrans}
                    r={isSelected ? 5 : 2.5}
                    fill="#10b981"
                    stroke="#0b1120"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* X-axis Hour Labels */}
          <div className="flex justify-between px-6 pt-2 font-mono text-[11px] text-slate-400">
            {hoursData.map((d, i) => (
              <button
                key={i}
                onClick={() => setHoveredIndex(i)}
                className={`text-center transition-all ${
                  hoveredIndex === i ? 'text-cyan-300 font-bold scale-110' : 'hover:text-slate-200'
                }`}
              >
                <div>{d.hourLabel}</div>
                <div className={`text-[9px] ${d.isNight ? 'text-indigo-400' : 'text-amber-500/70'}`}>
                  {d.isNight ? 'Night' : 'Day'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Breakdown Summary & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 inline-block rounded-full" />
            <strong className="text-slate-300">Total Clouds</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 border-dashed inline-block" />
            <strong className="text-slate-300">Seeing Transparency</strong>
          </span>
        </div>

        {/* Cloud Layers at Active Hour */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">At {activeItem.hourLabel}:</span>
          <span className="text-slate-300">Low: <strong className="text-slate-100">{activeItem.lowCloud}%</strong></span>
          <span className="text-slate-300">Mid: <strong className="text-slate-100">{activeItem.midCloud}%</strong></span>
          <span className="text-slate-300">High: <strong className="text-slate-100">{activeItem.highCloud}%</strong></span>
        </div>
      </div>
    </div>
  );
}
