import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSeatingStore } from '../store/seatingStore';
import type { Venue, Seat as SeatType } from '../types/venue';
import { PRICE_TIERS } from '../utils/pricing';

interface SeatingMapProps {
  venue: Venue;
  heatMapEnabled?: boolean;
}

const SEAT_RADIUS = 10;

export const SeatingMap = ({ venue, heatMapEnabled = false }: SeatingMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
  const rafRef = useRef<number>();

  const { selectSeat, deselectSeat, isSeatSelected, canSelectMoreSeats, selectedSeats } = useSeatingStore();

  // Flatten all seats with absolute positions
  const allSeatsData = useMemo(() => {
    return venue.sections.flatMap(section =>
      section.rows.flatMap(row =>
        row.seats.map(seat => ({
          seat,
          section: section.id,
          row: row.index,
          x: seat.x,
          y: seat.y,
        }))
      )
    );
  }, [venue]);

  // Available seats only for keyboard navigation
  const availableSeats = useMemo(() => {
    return allSeatsData.filter(data => data.seat.status === 'available');
  }, [allSeatsData]);

  // Color function with clear pricing distinction and user selections
  const getColor = useCallback((seat: SeatType, isSelected: boolean, isHovered: boolean, isFocused: boolean) => {
    // User's selected seats - bright green with glow effect
    if (isSelected) return '#22c55e';
    
    // Focused seat - bright cyan
    if (isFocused && seat.status === 'available') return '#22d3ee';
    
    // Hovered available seat - slightly lighter
    if (isHovered && seat.status === 'available') {
      // Show price tier color on hover (brighter)
      if (seat.priceTier === 1) return '#c084fc'; // Lighter purple
      if (seat.priceTier === 2) return '#f472b6'; // Lighter pink
      return '#fb923c'; // Lighter orange
    }
    
    // Available seats - distinct colors by price tier
    if (seat.status === 'available') {
      if (seat.priceTier === 1) return '#a855f7'; // Premium - Purple/Violet
      if (seat.priceTier === 2) return '#ec4899'; // Standard - Pink
      return '#f97316'; // Economy - Orange
    }
    
    // Non-available seats
    if (seat.status === 'sold') return '#ef4444'; // Red
    if (seat.status === 'held') return '#eab308'; // Yellow
    return '#6b7280'; // Reserved - Gray
  }, []);

  // Auto-pan to focused seat
  // const panToSeat = useCallback((seatX: number, seatY: number) => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const rect = canvas.getBoundingClientRect();
  //   const viewWidth = venue.map.width / zoom;
  //   const viewHeight = venue.map.height / zoom;
    
  //   // Calculate where the seat currently is in viewport
  //   const centerX = venue.map.width / 2;
  //   const centerY = venue.map.height / 2;
  //   const viewX = centerX - viewWidth / 2 - pan.x / zoom;
  //   const viewY = centerY - viewHeight / 2 - pan.y / zoom;
    
  //   const seatViewX = (seatX - viewX) / viewWidth;
  //   const seatViewY = (seatY - viewY) / viewHeight;
    
  //   // If seat is outside comfortable view (20%-80%), pan to center it
  //   const margin = 0.2;
  //   if (seatViewX < margin || seatViewX > 1 - margin || 
  //       seatViewY < margin || seatViewY > 1 - margin) {
      
  //     // Calculate new pan to center the seat
  //     const targetViewX = centerX - viewWidth / 2;
  //     const targetViewY = centerY - viewHeight / 2;
      
  //     setPan({
  //       x: -(seatX - centerX) * zoom,
  //       y: -(seatY - centerY) * zoom,
  //     });
  //   }
  // }, [venue.map.width, venue.map.height, zoom, pan]);

  const panToSeat = useCallback((seatX: number, seatY: number) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const viewWidth = venue.map.width / zoom;
  const viewHeight = venue.map.height / zoom;
  
  const centerX = venue.map.width / 2;
  const centerY = venue.map.height / 2;
  const viewX = centerX - viewWidth / 2 - pan.x / zoom;
  const viewY = centerY - viewHeight / 2 - pan.y / zoom;
  
  const seatViewX = (seatX - viewX) / viewWidth;
  const seatViewY = (seatY - viewY) / viewHeight;
  
  const margin = 0.2;
  if (seatViewX < margin || seatViewX > 1 - margin || 
      seatViewY < margin || seatViewY > 1 - margin) {
    
    setPan({
      x: -(seatX - centerX) * zoom,
      y: -(seatY - centerY) * zoom,
    });
  }
}, [venue.map.width, venue.map.height, zoom, pan]);

  // Canvas draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Calculate visible area
    const centerX = venue.map.width / 2;
    const centerY = venue.map.height / 2;
    const viewWidth = venue.map.width / zoom;
    const viewHeight = venue.map.height / zoom;
    const viewX = centerX - viewWidth / 2 - pan.x / zoom;
    const viewY = centerY - viewHeight / 2 - pan.y / zoom;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Apply transformations
    const scaleX = width / viewWidth;
    const scaleY = height / viewHeight;
    ctx.translate(-viewX * scaleX, -viewY * scaleY);
    ctx.scale(scaleX, scaleY);

    // Draw stage
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.beginPath();
    ctx.roundRect(venue.map.width / 2 - 300, 50, 600, 50, 8);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE', venue.map.width / 2, 82);

    // Draw seats
    const buffer = 100;
    const selectedSet = new Set(selectedSeats.map(s => s.id));

    allSeatsData.forEach(({ seat, x, y }) => {
      // Frustum culling
      if (x < viewX - buffer || x > viewX + viewWidth + buffer ||
          y < viewY - buffer || y > viewY + viewHeight + buffer) {
        return;
      }

      const isSelected = selectedSet.has(seat.id);
      const isHovered = hoveredSeat === seat.id;
      const isFocused = focusedSeatId === seat.id;
      const color = getColor(seat, isSelected, isHovered, isFocused);

      // Draw glow for selected seats
      if (isSelected) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22c55e';
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = seat.status === 'available' || isSelected ? 1 : 0.5;

      ctx.beginPath();
      ctx.arc(x, y, (isHovered || isFocused) ? SEAT_RADIUS * 1.2 : SEAT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Stroke for focused/selected/hovered
      if (isFocused) {
        // Keyboard focus - thick white outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
        ctx.stroke();
      } else if (isSelected) {
        // Selected - bright green outline with emphasis
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
        ctx.stroke();
      } else if (isHovered && seat.status === 'available') {
        // Hovered - light outline
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [venue, zoom, pan, allSeatsData, hoveredSeat, focusedSeatId, selectedSeats, getColor]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Get seat at mouse position
  const getSeatAtPosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const viewWidth = venue.map.width / zoom;
    const viewHeight = venue.map.height / zoom;
    const centerX = venue.map.width / 2;
    const centerY = venue.map.height / 2;
    const viewX = centerX - viewWidth / 2 - pan.x / zoom;
    const viewY = centerY - viewHeight / 2 - pan.y / zoom;

    const worldX = viewX + (x / rect.width) * viewWidth;
    const worldY = viewY + (y / rect.height) * viewHeight;

    for (const { seat, x: seatX, y: seatY, section, row } of allSeatsData) {
      const dx = worldX - seatX;
      const dy = worldY - seatY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= SEAT_RADIUS) {
        return { seat, section, row };
      }
    }
    return null;
  }, [allSeatsData, venue.map.width, venue.map.height, zoom, pan]);

  // Find seat in direction
  const findSeatInDirection = useCallback((currentSeatId: string, direction: 'left' | 'right' | 'up' | 'down') => {
    const currentIndex = availableSeats.findIndex(s => s.seat.id === currentSeatId);
    if (currentIndex === -1) return null;

    const current = availableSeats[currentIndex];

    if (direction === 'left') {
      return availableSeats
        .filter(s => s.y === current.y && s.x < current.x)
        .sort((a, b) => b.x - a.x)[0] || null;
    }

    if (direction === 'right') {
      return availableSeats
        .filter(s => s.y === current.y && s.x > current.x)
        .sort((a, b) => a.x - b.x)[0] || null;
    }

    if (direction === 'up') {
      const above = availableSeats.filter(s => s.y < current.y);
      if (above.length === 0) return null;
      return above.reduce((closest, seat) => {
        const distCurrent = Math.abs(seat.x - current.x) + Math.abs(seat.y - current.y);
        const distClosest = Math.abs(closest.x - current.x) + Math.abs(closest.y - current.y);
        return distCurrent < distClosest ? seat : closest;
      });
    }

    if (direction === 'down') {
      const below = availableSeats.filter(s => s.y > current.y);
      if (below.length === 0) return null;
      return below.reduce((closest, seat) => {
        const distCurrent = Math.abs(seat.x - current.x) + Math.abs(seat.y - current.y);
        const distClosest = Math.abs(closest.x - current.x) + Math.abs(closest.y - current.y);
        return distCurrent < distClosest ? seat : closest;
      });
    }

    return null;
  }, [availableSeats]);

  // Keyboard navigation with auto-pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedSeatId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (availableSeats.length > 0) {
          e.preventDefault();
          const firstSeat = availableSeats[0];
          setFocusedSeatId(firstSeat.seat.id);
          panToSeat(firstSeat.x, firstSeat.y);
        }
        return;
      }

      if (!focusedSeatId) return;

      let nextSeat = null;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          nextSeat = findSeatInDirection(focusedSeatId, 'left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSeat = findSeatInDirection(focusedSeatId, 'right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextSeat = findSeatInDirection(focusedSeatId, 'up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextSeat = findSeatInDirection(focusedSeatId, 'down');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const focusedData = availableSeats.find(s => s.seat.id === focusedSeatId);
          if (focusedData) {
            const { seat, section, row } = focusedData;
            const selectedSeat = { ...seat, section, row };
            
            // Only toggle if it's OUR selected seat, or if we can select more
            if (isSeatSelected(seat.id)) {
              deselectSeat(seat.id);
            } else if (canSelectMoreSeats()) {
              selectSeat(selectedSeat);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedSeatId(null);
          break;
      }

      if (nextSeat) {
        setFocusedSeatId(nextSeat.seat.id);
        panToSeat(nextSeat.x, nextSeat.y); // Auto-pan to new seat
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedSeatId, availableSeats, findSeatInDirection, isSeatSelected, deselectSeat, canSelectMoreSeats, selectSeat, panToSeat]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const seatData = getSeatAtPosition(e.clientX, e.clientY);
      setHoveredSeat(seatData?.seat.id || null);
    }
  }, [isDragging, dragStart, getSeatAtPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;

    const seatData = getSeatAtPosition(e.clientX, e.clientY);
    
    // Only allow clicking available seats
    if (!seatData || seatData.seat.status !== 'available') {
      return;
    }

    const { seat, section, row } = seatData;
    const selectedSeat = { ...seat, section, row };
    
    // Only toggle if it's our selected seat, or we can select more
    if (isSeatSelected(seat.id)) {
      deselectSeat(seat.id);
    } else if (canSelectMoreSeats()) {
      selectSeat(selectedSeat);
    }

    setFocusedSeatId(seat.id);
  }, [isDragging, getSeatAtPosition, isSeatSelected, deselectSeat, canSelectMoreSeats, selectSeat]);

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(0.3, prev + delta), 5));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.3, 5))}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg font-bold text-xl transition-colors shadow-lg"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.3, 0.3))}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg font-bold text-xl transition-colors shadow-lg"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg text-xs font-body transition-colors shadow-lg"
        >
          Reset
        </button>
      </div>

      {/* Info */}
      <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-body shadow-lg">
        <div className="font-semibold">🚀 {allSeatsData.length.toLocaleString()} seats</div>
        <div className="text-xs text-slate-300 mt-1">Canvas • Zoom: {(zoom * 100).toFixed(0)}%</div>
        {focusedSeatId && (
          <div className="text-xs text-blue-400 mt-1">⌨️ Keyboard active</div>
        )}
      </div>

      {/* Price Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-3 text-white text-xs font-body shadow-lg">
        <div className="font-semibold mb-2 text-sm">💎 Seat Prices</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#a855f7] shadow-lg shadow-purple-500/50"></div>
            <span className="font-medium">Premium - $150</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#ec4899] shadow-lg shadow-pink-500/50"></div>
            <span className="font-medium">Standard - $100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#f97316] shadow-lg shadow-orange-500/50"></div>
            <span className="font-medium">Economy - $75</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#22c55e] shadow-lg shadow-green-500/50"></div>
            <span className="font-semibold text-green-400">✓ Your Selections</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        tabIndex={0}
      />
    </div>
  );
};