import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Venue, SelectedSeat } from '../types/venue';

interface SeatingStore {
  venue: Venue | null;
  selectedSeats: SelectedSeat[];
  focusedSeatId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setVenue: (venue: Venue) => void;
  selectSeat: (seat: SelectedSeat) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setFocusedSeat: (seatId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  findAdjacentSeats: (count: number) => SelectedSeat[];

  // Computed
  getTotalPrice: () => number;
  isSeatSelected: (seatId: string) => boolean;
  canSelectMoreSeats: () => boolean;
}

const PRICE_MAP: Record<number, number> = {
  1: 150,
  2: 100,
  3: 75,
};

export const useSeatingStore = create<SeatingStore>()(
  persist(
    (set, get) => ({
      venue: null,
      selectedSeats: [],
      focusedSeatId: null,
      isLoading: false,
      error: null,

      setVenue: (venue) => set({ venue }),

      selectSeat: (seat) =>
        set((state) => {
          if (state.selectedSeats.length >= 8) return state;
          if (state.selectedSeats.some((s) => s.id === seat.id)) return state;
          return { selectedSeats: [...state.selectedSeats, seat] };
        }),

      deselectSeat: (seatId) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
        })),

      clearSelection: () => set({ selectedSeats: [] }),

      setFocusedSeat: (seatId) => set({ focusedSeatId: seatId }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      findAdjacentSeats: (count: number) => {
        const { venue } = get();
        if (!venue) return [];

        // Find adjacent seats in each row
        for (const section of venue.sections) {
          for (const row of section.rows) {
            const availableSeats = row.seats.filter((s) => s.status === 'available');
            
            // Check for consecutive available seats
            for (let i = 0; i <= availableSeats.length - count; i++) {
              const consecutive = availableSeats.slice(i, i + count);
              const cols = consecutive.map((s) => s.col);
              
              // Check if seats are truly adjacent (consecutive column numbers)
              const isAdjacent = cols.every((col, idx) => 
                idx === 0 || col === cols[idx - 1] + 1
              );
              
              if (isAdjacent) {
                return consecutive.map((seat) => ({
                  ...seat,
                  section: section.id,
                  row: row.index,
                }));
              }
            }
          }
        }
        
        return [];
      },

      getTotalPrice: () => {
        const { selectedSeats } = get();
        return selectedSeats.reduce((total, seat) => {
          return total + (PRICE_MAP[seat.priceTier] || 0);
        }, 0);
      },

      isSeatSelected: (seatId) => {
        const { selectedSeats } = get();
        return selectedSeats.some((s) => s.id === seatId);
      },

      canSelectMoreSeats: () => {
        const { selectedSeats } = get();
        return selectedSeats.length < 8;
      },
    }),
    {
      name: 'seating-selection',
      partialize: (state) => ({ selectedSeats: state.selectedSeats }),
    }
  )
);
