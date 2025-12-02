import { useEffect, useCallback } from 'react';
import { useSeatingStore } from '../store/seatingStore';
import type { Seat, Section } from '../types/venue';

export const useKeyboardNav = (
  sections: Section[],
  onSeatClick: (seat: Seat, section: string, row: number) => void
) => {
  const { focusedSeatId, setFocusedSeat } = useSeatingStore();

  // Flatten all AVAILABLE seats only for navigation
  const availableSeats = sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      row.seats
        .filter((seat) => seat.status === 'available')
        .map((seat) => ({
          seat,
          section: section.id,
          row: row.index,
        }))
    )
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (availableSeats.length === 0) return;

      const currentIndex = availableSeats.findIndex(
        (item) => item.seat.id === focusedSeatId
      );

      // If no seat is focused, focus the first available seat
      if (currentIndex === -1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const firstSeat = availableSeats[0];
        setFocusedSeat(firstSeat.seat.id);
        document.getElementById(firstSeat.seat.id)?.focus();
        return;
      }

      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      const currentItem = availableSeats[currentIndex];

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          // Move to next seat in same row or next row
          nextIndex = Math.min(currentIndex + 1, availableSeats.length - 1);
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          // Move to previous seat
          nextIndex = Math.max(currentIndex - 1, 0);
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Move to seat in row below (approximate same column)
          nextIndex = findSeatInDirection(availableSeats, currentIndex, 'down');
          break;

        case 'ArrowUp':
          e.preventDefault();
          // Move to seat in row above (approximate same column)
          nextIndex = findSeatInDirection(availableSeats, currentIndex, 'up');
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSeatClick(currentItem.seat, currentItem.section, currentItem.row);
          return;
          
        case 'Escape':
          e.preventDefault();
          setFocusedSeat(null);
          return;
          
        default:
          return;
      }

      const nextItem = availableSeats[nextIndex];
      if (nextItem) {
        setFocusedSeat(nextItem.seat.id);
        document.getElementById(nextItem.seat.id)?.focus();
      }
    },
    [focusedSeatId, availableSeats, onSeatClick, setFocusedSeat]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Helper function to find seat in vertical direction
function findSeatInDirection(
  seats: Array<{ seat: Seat; section: string; row: number }>,
  currentIndex: number,
  direction: 'up' | 'down'
): number {
  const current = seats[currentIndex];
  const targetRow = direction === 'down' ? current.row + 1 : current.row - 1;
  
  // Find seats in target row within same section
  const seatsInTargetRow = seats
    .map((item, idx) => ({ ...item, idx }))
    .filter(
      (item) =>
        item.section === current.section && item.row === targetRow
    );

  if (seatsInTargetRow.length === 0) {
    // No seats in target row, try next/previous row
    return direction === 'down'
      ? Math.min(currentIndex + 1, seats.length - 1)
      : Math.max(currentIndex - 1, 0);
  }

  // Find closest seat by column number
  const closest = seatsInTargetRow.reduce((prev, curr) => {
    const prevDist = Math.abs(prev.seat.col - current.seat.col);
    const currDist = Math.abs(curr.seat.col - current.seat.col);
    return currDist < prevDist ? curr : prev;
  });

  return closest.idx;
}
