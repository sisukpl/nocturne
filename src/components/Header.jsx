import React, { useState } from 'react';
import { Sparkles, RefreshCw, HelpCircle, Telescope, ShieldCheck, X, Compass, Moon, Cloud } from 'lucide-react';

export default function Header({ onRefresh, isRefreshing, lastUpdated }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-900/30">
              <div className="w-full h-full bg-[#070b16] rounded-[14px] flex items-center justify-center">
                <Telescope className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070b16] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white m-0 p-0">
                Aurora &amp; <span className="aurora-gradient-text">Dark-Sky</span> Planner
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline-block">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0 p-0 mt-0.5">
              Live Space Weather (NOAA SWPC) &amp; Astronomy Forecast (Open-Meteo)
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh + Guide */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Science Guide Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-xs font-mono cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Science Guide</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 hover:from-emerald-600/30 hover:to-cyan-600/30 border border-cyan-500/30 text-cyan-200 hover:text-white transition-all text-xs font-mono font-semibold cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-950/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* Science Guide Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Astronomy &amp; Aurora Science Guide</h3>
                <p className="text-xs text-slate-400">How our calculation engine computes your observation conditions</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5 mb-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  1. Planetary Kp Index &amp; IMF Bz
                </h4>
                <p>
                  The <strong>Kp index (0–9)</strong> measures worldwide geomagnetic disruption. But Kp alone isn't enough! 
                  The <strong>Interplanetary Magnetic Field (IMF) Bz</strong> is crucial: when Bz points <strong>South (negative value)</strong>, it cancels Earth's northward magnetic shield, funnelling high-speed solar plasma directly into the upper atmosphere to generate brilliant dancing auroral coronas and curtains.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-1.5 mb-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  2. Moon Phase &amp; Sky Contrast
                </h4>
                <p>
                  A <strong>New Moon</strong> or hours when the moon is below the horizon provide a true dark sky, making faint nebulae, the Milky Way core, and distant galaxies observable. 
                  During a <strong>Full Moon</strong>, light scattering brightens the atmosphere, making deep-sky imaging difficult while offering great high-contrast crater viewing on the Moon itself.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5 mb-1.5">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  3. Layered Cloud Transparency &amp; Dew Point
                </h4>
                <p>
                  Not all clouds are equal! <strong>Low clouds</strong> (stratus) completely block astronomical viewing. <strong>High cirrus clouds</strong> are semi-transparent and allow bright stars or aurora through.
                  Additionally, when the ambient temperature drops within <strong>2°C of the dew point</strong>, atmospheric moisture condenses rapidly onto camera lenses and telescope corrector plates, requiring dew heaters.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5 mb-1.5">
                  <Telescope className="w-4 h-4 text-amber-400" />
                  4. The 'Clear Sky Window' Rating
                </h4>
                <p>
                  Our engine combines Sun depression angle (Astronomical Twilight &lt; -18°), low/mid/high cloud cover, lunar interference, and seeing stability to score each hour from 0 to 100, picking the optimal contiguous block for packing your telescope outside.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
