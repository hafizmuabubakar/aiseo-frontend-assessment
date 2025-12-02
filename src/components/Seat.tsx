import { memo } from 'react';
import type { Seat as SeatType } from '../types/venue';
import { useSeatingStore } from '../store/seatingStore';
import { PRICE_TIERS } from '../utils/pricing';

interface SeatProps {
  seat: SeatType;
  section: string;
  row: number;
  onClick: (seat: SeatType, section: string, row: number) => void;
  heatMapEnabled?: boolean;
}

const SEAT_RADIUS = 12;

const STATUS_COLORS = {
  available: '#10b981',
  reserved: '#6b7280',
  sold: '#ef4444',
  held: '#f59e0b',
};

export const Seat = memo(({ seat, section, row, onClick, heatMapEnabled = false }: SeatProps) => {
  const isSeatSelected = useSeatingStore((s) => s.isSeatSelected(seat.id));
  const focusedSeatId = useSeatingStore((s) => s.focusedSeatId);
  const setFocusedSeat = useSeatingStore((s) => s.setFocusedSeat);

  const isInteractive = seat.status === 'available';
  const isFocused = focusedSeatId === seat.id;

  const handleClick = () => {
    if (isInteractive) {
      onClick(seat, section, row);
    }
  };

  const handleFocus = () => {
    setFocusedSeat(seat.id);
  };

  // Heat map coloring based on price tier
  const getHeatMapColor = () => {
    if (seat.status !== 'available') return STATUS_COLORS[seat.status];
    return PRICE_TIERS[seat.priceTier]?.color || '#10b981';
  };

  const fillColor = isSeatSelected
    ? '#0ea5e9'
    : heatMapEnabled
    ? getHeatMapColor()
    : STATUS_COLORS[seat.status];

  const strokeColor = isFocused ? '#fff' : 'transparent';

  return (
    <circle
      id={seat.id}
      cx={seat.x}
      cy={seat.y}
      r={SEAT_RADIUS}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={isFocused ? 3 : 0}
      className={`transition-all duration-200 ${
        isInteractive ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'
      }`}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={isInteractive ? 0 : -1}
      role="button"
      aria-label={`Seat ${seat.id}, Row ${row}, Section ${section}, ${seat.status}`}
      aria-pressed={isSeatSelected}
      style={{
        transform: isSeatSelected ? 'scale(1.15)' : 'scale(1)',
        transformOrigin: `${seat.x}px ${seat.y}px`,
      }}
    />
  );
});

Seat.displayName = 'Seat';
