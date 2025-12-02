# Event Seating Map - AISEO

This is an interactive seating map that can handle 15,000 seats smoothly at 60fps. It's built with React 18, TypeScript, Zustand for state management, and uses Canvas API for fast rendering. You can select seats with your mouse or keyboard, choose up to 8 seats (they're saved even if you refresh the page), toggle a heat-map view to see pricing, find adjacent seats automatically, and zoom/pan around the venue. The app meets all 8 core requirements from the spec and includes 5 out of 7 bonus features. We didn't include WebSocket updates (no backend available) or end-to-end tests due to time limits.

We chose Canvas over SVG because it's about 10 times faster when rendering thousands of seats. Zustand handles the app state and saves your seat selections to localStorage so they don't disappear when you reload. The keyboard navigation is smart - it only lets you move between available seats and automatically scrolls to keep the focused seat visible. The venue layout is clean: 30 sections arranged in a 5×6 grid, with 25 rows and 20 seats per row in each section, giving us exactly 15,000 seats. Colors are easy to understand: Purple seats are Premium ($150), Pink is Standard ($100), Orange is Economy ($75), and your selected seats glow bright green so you always know what you picked.

Want to test with all 15,000 seats? Just open `src/hooks/useVenueData.ts` and change line 4 to `USE_15K_SEATS = true`, then restart the server. You can also generate fresh data by running `cd scripts && node generate-venue.js`. To test everything works: select some seats, refresh your browser to make sure they're still selected, try the arrow keys to navigate around, and zoom in and out. Check the browser's DevTools Performance tab while zooming - it should stay smooth at around 60fps even with all those seats visible.

## How to Run
```bash
pnpm install
pnpm run dev
# Then open http://localhost:3000 in your browser
```

## Testing Steps

1. **Test Persistence**: Select a few seats, refresh the page, verify they're still selected
2. **Test Keyboard**: Press arrow keys to move, Enter to select, Escape to clear focus
3. **Test Performance**: Open DevTools → Performance tab → Record while zooming → Should see ~60fps
4. **Test 15K Seats**: Edit `src/hooks/useVenueData.ts` → change `USE_15K_SEATS = true` → Restart server

## Controls

- **Mouse**: Click seats to select, drag to pan, scroll to zoom
- **Keyboard**: Arrow keys (←→↑↓) to navigate, Enter/Space to select, Esc to clear
- **Features**: Heat map toggle shows price tiers, Find Adjacent button selects consecutive seats

---

**Built with React 18 + TypeScript + Canvas • Smooth performance with 15,000 seats**