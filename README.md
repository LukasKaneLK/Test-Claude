# Pomodoro Timer

A beautiful, focused Pomodoro timer built as a modern PWA-ready web app. Clean UI, phase-reactive colors, accurate background timer, and delightful audio feedback.

---

## Features

- **Pomodoro cycle** — Focus → Short Break → Focus → … → Long Break (every 4 sessions)
- **Accurate timer** — Timestamp-based (`Date.now()` + `endTime`) so the countdown stays precise even in background tabs
- **Phase-reactive UI** — Background gradient, progress ring, and button color shift with each phase (rose → teal → indigo)
- **Animated progress ring** — SVG circular arc drains as time elapses
- **Session dots** — Visual indicator of how many focus sessions have been completed in the current cycle
- **Background music** — Ukulele track plays during Focus sessions
- **Button click sounds** — Tactile audio feedback on every interaction
- **Mute toggle** — Silence all sounds with one click
- **Keyboard shortcuts** — `Space` start/pause · `R` reset · `S` skip
- **Dark / Light mode** — Persisted in `localStorage`, respects OS preference on first visit
- **Playlist support** — Cycle through multiple background music tracks during Focus sessions
- **Postpone timer** — Click the timer card to pause mid-session without resetting progress
- **Interactive tutorial** — Step-by-step overlay on first visit; re-openable anytime via the `?` button in the header

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | TailwindCSS v4 |
| Components | shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Package manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Install & run

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm build
```

Output goes to `dist/`.

### Preview production build

```bash
pnpm preview
```

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint across all source files |
| `pnpm format` | Format source files with Prettier |

---

## Project Structure

```
src/
├── app/
│   └── App.tsx                  # Root component, theme + keyboard logic
├── components/
│   ├── Header.tsx               # App bar with phase badge and theme toggle
│   ├── Footer.tsx               # Keyboard shortcut hints
│   ├── TimerCard.tsx            # Main timer UI (ring, controls, mute)
│   └── ui/                      # shadcn/ui primitives (button, dialog, etc.)
├── features/
│   └── pomodoro/
│       ├── usePomodoro.ts       # Hook: RAF loop, audio, public API
│       └── engine/
│           ├── types.ts         # Phase, Config, TimerState, TimerAction
│           ├── reducer.ts       # Pure state machine (timestamp-based)
│           └── selectors.ts     # Derived display values (time, progress)
├── assets/
│   ├── bensound-ukulele.mp3     # Focus background music
│   └── Button_press.wav         # Button click sound effect
└── index.css                    # Tailwind imports + CSS variables
```

---

## Timer Logic

The engine uses an **absolute end-timestamp** approach instead of decrementing a counter:

1. On `START` / `RESUME`, `endTime = Date.now() + remainingMs` is stored in state.
2. A `requestAnimationFrame` loop reads `Date.now()` each frame and computes `remainingMs = endTime - now`.
3. On `PAUSE`, the remaining time is captured and `endTime` is cleared.

This means the timer is immune to `setInterval` drift and background tab throttling.

---

## Pomodoro Cycle

```
[Focus] → [Short Break] → [Focus] → [Short Break] → ... → [Long Break] → [Focus] → ...
                                                    ↑ after N focus sessions (default: 4)
```

Default durations (all configurable via `DEFAULT_CONFIG` in `src/features/pomodoro/engine/types.ts`):

| Phase | Duration |
|---|---|
| Focus | 25 min |
| Short Break | 5 min |
| Long Break | 15 min |
| Sessions before long break | 4 |

---

## Audio

- **Focus music** (`bensound-ukulele.mp3`) — starts when the timer starts, stops on pause, reset, or phase change away from Focus.
- **Button clicks** (`Button_press.wav`) — plays on every button press.
- Both are silenced when the **Mute** toggle is active.

---

## License

MIT
