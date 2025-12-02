import { useState } from 'react';
import { useVenueData } from './hooks/useVenueData';
import { SeatingMap } from './components/SeatingMap';
import { SelectionSummary } from './components/SelectionSummary';
import { Legend } from './components/Legend';
import { Controls } from './components/Controls';
import { useSeatingStore } from './store/seatingStore';

function App() {
  const { venue, isLoading, error } = useVenueData();
  const [heatMapEnabled, setHeatMapEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { findAdjacentSeats, selectSeat, clearSelection } = useSeatingStore();

  const handleFindAdjacent = (count: number) => {
    const adjacentSeats = findAdjacentSeats(count);
    if (adjacentSeats.length > 0) {
      clearSelection();
      adjacentSeats.forEach((seat) => selectSeat(seat));
    } else {
      alert(`No ${count} adjacent available seats found`);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 border-4 ${darkMode ? 'border-blue-500' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mx-auto`} />
          <p className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body text-lg`}>Loading venue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} flex items-center justify-center`}>
        <div className={`${darkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-100 border-red-300'} border rounded-xl p-8 max-w-md`}>
          <h2 className={`text-xl font-display font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-2`}>
            Error Loading Venue
          </h2>
          <p className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} font-body`}>{error}</p>
        </div>
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-8">
          <h1 className={`text-4xl md:text-5xl font-display font-bold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800'}`}>
            {venue.name}
          </h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} font-body text-lg`}>
            Select your perfect seats for the event
          </p>
          {heatMapEnabled && (
            <p className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-body text-sm`}>
              🔥 Heat Map: Warmer colors = Higher prices
            </p>
          )}
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seating Map - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 h-[500px] md:h-[600px]">
            <SeatingMap venue={venue} heatMapEnabled={heatMapEnabled} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Controls
              heatMapEnabled={heatMapEnabled}
              onHeatMapToggle={() => setHeatMapEnabled(!heatMapEnabled)}
              darkMode={darkMode}
              onDarkModeToggle={() => setDarkMode(!darkMode)}
              onFindAdjacent={handleFindAdjacent}
            />
            <SelectionSummary darkMode={darkMode} />
            <Legend darkMode={darkMode} />
          </div>
        </div>

        {/* Footer */}
        <footer className={`text-center ${darkMode ? 'text-slate-500' : 'text-gray-500'} text-sm font-body pt-8 ${darkMode ? 'border-slate-800' : 'border-gray-300'} border-t`}>
          <p>🎯 Click seats • ⌨️ Arrow keys to navigate • 🖱️ Scroll to zoom • 👆 Drag to pan</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
