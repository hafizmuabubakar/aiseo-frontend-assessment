import { useState } from 'react';

interface ControlsProps {
  heatMapEnabled: boolean;
  onHeatMapToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onFindAdjacent: (count: number) => void;
}

export const Controls = ({ 
  heatMapEnabled, 
  onHeatMapToggle,
  darkMode,
  onDarkModeToggle,
  onFindAdjacent 
}: ControlsProps) => {
  const [adjacentCount, setAdjacentCount] = useState(2);

  return (
    <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-display font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Controls</h3>
      
      <div className="space-y-4">
        {/* Heat Map Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="heatmap-toggle" className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>
            Heat Map View
          </label>
          <button
            id="heatmap-toggle"
            onClick={onHeatMapToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              heatMapEnabled ? 'bg-blue-500' : darkMode ? 'bg-slate-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={heatMapEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                heatMapEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="darkmode-toggle" className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>
            Dark Mode
          </label>
          <button
            id="darkmode-toggle"
            onClick={onDarkModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={darkMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Find Adjacent Seats */}
        <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
          <label className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body mb-2 block`}>
            Find Adjacent Seats
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="2"
              max="8"
              value={adjacentCount}
              onChange={(e) => setAdjacentCount(Number(e.target.value))}
              className={`w-16 px-2 py-1 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-900 border-gray-300'} rounded text-sm border focus:border-blue-500 focus:outline-none font-body`}
            />
            <button
              onClick={() => onFindAdjacent(adjacentCount)}
              className={`flex-1 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'} px-3 py-1 rounded text-sm transition-colors font-body border`}
            >
              Find
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
