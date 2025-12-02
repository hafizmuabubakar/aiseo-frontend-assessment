import { useEffect } from 'react';
import { useSeatingStore } from '../store/seatingStore';
import type { Venue } from '../types/venue';

// Toggle this to test with 15K seats
const USE_15K_SEATS = true;

export const useVenueData = () => {
  const { setVenue, setLoading, setError, venue } = useSeatingStore();

  useEffect(() => {
    if (venue) return; // Already loaded

    const loadVenue = async () => {
      setLoading(true);
      setError(null);

      try {
        const venueFile = USE_15K_SEATS ? '/venue-15k.json' : '/venue.json';
        const response = await fetch(venueFile);
        if (!response.ok) throw new Error('Failed to load venue data');
        
        const data: Venue = await response.json();
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, [setVenue, setLoading, setError, venue]);

  return { venue, isLoading: useSeatingStore((s) => s.isLoading), error: useSeatingStore((s) => s.error) };
};
