import { PRICE_TIERS } from '../utils/pricing';

interface LegendProps {
  darkMode?: boolean;
}

export const Legend = ({ darkMode = true }: LegendProps) => {
  const statuses = [
    { label: 'Available (Premium)', color: '#a855f7' },
    { label: 'Available (Standard)', color: '#ec4899' },
    { label: 'Available (Economy)', color: '#f97316' },
    { label: 'Your Selections', color: '#22c55e' },
    { label: 'Reserved', color: '#6b7280' },
    { label: 'Sold', color: '#ef4444' },
    { label: 'Held', color: '#eab308' },
  ];

  return (
    <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-display font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Legend</h3>
      
      <div className="space-y-4">
        {/* Seat Status */}
        <div>
          <h4 className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'} uppercase tracking-wide mb-3 font-body`}>
            Seat Status
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {statuses.map((status) => (
              <div key={status.label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: status.color,
                    boxShadow: status.label === 'Your Selections' ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
                  }}
                />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body ${status.label === 'Your Selections' ? 'font-semibold text-green-400' : ''}`}>
                  {status.label === 'Your Selections' && '✓ '}
                  {status.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Tiers */}
        <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
          <h4 className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'} uppercase tracking-wide mb-3 font-body`}>
            💎 Price Tiers
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: '#a855f7' }}
                />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>Premium</span>
              </div>
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} font-body font-semibold`}>$150</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: '#ec4899' }}
                />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>Standard</span>
              </div>
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} font-body font-semibold`}>$100</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: '#f97316' }}
                />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>Economy</span>
              </div>
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} font-body font-semibold`}>$75</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
          <h4 className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'} uppercase tracking-wide mb-2 font-body`}>
            ⌨️ Keyboard Shortcuts
          </h4>
          <div className={`space-y-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'} font-body`}>
            <p>← → Navigate horizontally</p>
            <p>↑ ↓ Navigate vertically</p>
            <p>Enter/Space Select seat</p>
            <p>Esc Clear focus</p>
            <p className="text-xs italic mt-2 text-green-400">* Only available seats navigable</p>
          </div>
        </div>
      </div>
    </div>
  );
};