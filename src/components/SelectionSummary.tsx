import { useSeatingStore } from '../store/seatingStore';
import { formatPrice, getPriceForTier } from '../utils/pricing';

interface SelectionSummaryProps {
  darkMode?: boolean;
}

export const SelectionSummary = ({ darkMode = true }: SelectionSummaryProps) => {
  const { selectedSeats, deselectSeat, clearSelection, getTotalPrice } = useSeatingStore();

  if (selectedSeats.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
        <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-center font-body`}>
          Select up to 8 seats to continue
        </p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-white'} rounded-xl p-6 border ${darkMode ? 'border-slate-700/50' : 'border-gray-200'} shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-display font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Selected Seats ({selectedSeats.length}/8)
        </h2>
        <button
          onClick={clearSelection}
          className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors font-body`}
          aria-label="Clear all selections"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
        {selectedSeats.map((seat) => (
          <div
            key={seat.id}
            className={`flex items-center justify-between ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 group transition-all`}
          >
            <div className="flex-1">
              <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm font-body`}>
                Section {seat.section} · Row {seat.row} · Seat {seat.col}
              </p>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-xs mt-0.5 font-body`}>
                {formatPrice(getPriceForTier(seat.priceTier))}
              </p>
            </div>
            <button
              onClick={() => deselectSeat(seat.id)}
              className={`${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors opacity-0 group-hover:opacity-100`}
              aria-label={`Remove seat ${seat.id}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
        <div className="flex justify-between text-lg font-display">
          <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>Total:</span>
          <span className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{formatPrice(getTotalPrice())}</span>
        </div>
      </div>
    </div>
  );
};
