# Lucky Slots - Slot Machine Game

A slot machine game built with Electron, React, and TypeScript, backed by a SQLite database for persistent player statistics.

## Running Locally

```bash
# Install dependencies
npm install

# Start in development mode (opens Electron window with hot-reload)
npm run dev

# Build for production
npm run build
```

## Implemented Features

### Core Game
- **3-reel slot machine** with 6 emoji symbols (Cherry, Lemon, Orange, Grape, Watermelon, Seven) across three rarity tiers
- **Weighted randomization** — common symbols appear more often; the Seven is rare, making jackpots exciting
- **Coin system** — start with 100 coins, each spin costs 10
- **Payout table** — triple Sevens pay 100 (jackpot), triple matches pay 15–50 depending on rarity, double Sevens pay 25, other doubles pay 5, no match pays 0
- **Game over detection** — overlay with session stats and a "Play Again" button when balance drops below the spin cost

### UI/UX
- **Dark casino theme** with gold accents, gradient backgrounds, and glowing borders
- **Animated reels** — rapid symbol cycling during spin, staggered stops (left → right) for suspense, and a bounce-settle effect on landing
- **Winning feedback** — pulsing gold glow on reels, color-coded result banners (green for wins, gold for jackpots), and animated coin counter
- **Responsive layout** — scales down for smaller viewports via media queries
- **Sound effects** — Web Audio API synthesized sounds for spin, reel stop, win, jackpot, and loss (no external audio files needed)

### Bonus Features
- **Auto-spin** — choose 5, 10, or 25 automatic spins; stops early on game over or manual cancel

### Database Integration
- SQLite via better-sqlite3 with WAL mode
- Tracks players, game sessions, and individual spins
- Every spin is persisted with symbols, bet, and win amount
- Player's highest balance and total spins are updated in real time

## Design Decisions

- **`useReducer` for state management** — the game has multiple phases (loading, idle, spinning, result, game over) with interdependent transitions. A reducer makes state changes predictable and easy to trace versus scattered `useState` calls.
- **Pure game logic module (`slotEngine.ts`)** — symbol definitions, weighted randomization, and payout evaluation are separated from React. This makes the logic testable and reusable without UI coupling.
- **Graceful API fallback** — the game hook detects when `window.api` is unavailable (e.g., running outside Electron in a browser) and still renders a fully playable game, just without database persistence.
- **CSS-only animations** — all reel, bounce, glow, and overlay animations use CSS keyframes and transitions rather than a JS animation library, keeping the bundle small and performant.
- **Web Audio API for sounds** — short synthesized tones avoid the need for audio asset files while providing immediate auditory feedback.

## Architecture

```
src/
├── main/
│   ├── index.ts          # Electron main process, window creation
│   └── database.ts       # SQLite init, tables, IPC handlers
├── preload/
│   ├── index.ts          # Context bridge exposing API to renderer
│   └── index.d.ts        # TypeScript declarations for window.api
└── renderer/src/
    ├── App.tsx            # Root component
    ├── types.ts           # Shared type definitions
    ├── game/
    │   ├── slotEngine.ts  # Symbols, randomization, payout logic
    │   ├── useSlotMachine.ts  # Game state hook (useReducer)
    │   └── sounds.ts      # Web Audio sound effects
    ├── components/
    │   ├── SlotMachine.tsx     # Main game container
    │   ├── SlotReel.tsx        # Single reel with animation
    │   ├── CoinDisplay.tsx     # Animated balance counter
    │   ├── SpinButton.tsx      # Primary action button
    │   ├── FeedbackBanner.tsx  # Win/loss message display
    │   └── GameOverOverlay.tsx # End-of-game modal
    └── assets/
        ├── base.css           # CSS reset and variables
        ├── main.css           # Global layout styles
        └── slot-machine.css   # Game-specific styles and animations
```

## Known Issues & Limitations

- Auto-spin does not allow changing the bet amount mid-sequence (bet is fixed at 10 coins).
- Sound synthesis is basic; a production game would benefit from pre-recorded audio samples.
- No unit tests are included — the pure `slotEngine.ts` module is designed to be easily testable.
