## Goal
Build a **beautiful**, **fast**, **accessible** Pomodoro timer as a **modern web app** (responsive + PWA).  
Focus: clean UX, delightful animations, rock-solid timer accuracy, and a polished “product” feel.

## Recommended Stack (pick one and stick to it)
**Option A (recommended): React + Vite**
- React 19 + TypeScript
- Vite
- TailwindCSS + shadcn/ui (or Radix UI)
- Zustand (state) or Redux Toolkit (only if needed)
- Vitest + Testing Library
- PWA: `vite-plugin-pwa`
- Animations: Framer Motion (or Motion One)

**Option B: Next.js**
- Next.js (App Router) + TS + Tailwind + shadcn/ui
- PWA via next-pwa (or custom SW)
- Same testing stack

> Decision: use **Option A** unless there’s a specific need for SSR.

---

## Product Requirements
### Core features (MVP)
- Pomodoro cycle: **Focus → Short Break → Focus … → Long Break**
- Customizable durations (focus / short / long / sessions before long)
- Controls: start, pause, resume, reset, skip phase
- Phase auto-start toggle (on/off)
- Sound at phase end + optional ticking (off by default)
- Desktop notifications (with permission prompt)
- Works when tab is in background; timer stays accurate

### Nice-to-have (v1)
- Themes: light/dark + 2–3 premium-looking palettes
- Animated progress ring + micro-interactions
- Keyboard shortcuts + compact mode
- Stats: daily focus minutes, streaks, sessions count
- Presets: “Classic 25/5”, “Deep Work 50/10”, “Custom”
- PWA install + offline support
- “Do Not Disturb” mode (no sound/notifications)

### Non-functional
- Accessibility: proper contrast, focus states, ARIA, reduced motion support
- Performance: minimal re-renders, smooth animations at 60fps
- Code quality: modular, tested timer engine, typed interfaces

---

## Milestones
1) **Project Setup + Design System**
2) **Timer Engine (tested)**
3) **MVP UI + Settings**
4) **Notifications + Audio**
5) **Polish + A11y + PWA**
6) **Stats + Export (optional)**
7) **Deploy**

---

## 1) Project Setup + Design System
- [ ] Initialize repo (Vite + React + TS)
  - Acceptance: `pnpm dev` runs, `pnpm build` succeeds
- [ ] Add TailwindCSS
  - Acceptance: utility classes work, dark mode configured
- [ ] Add component library (shadcn/ui or Radix UI)
  - Acceptance: Button, Switch, Dialog, Tabs available
- [ ] Add linting/formatting
  - ESLint + Prettier
  - Acceptance: `pnpm lint` passes
- [ ] Define folder structure
  - `src/`
    - `app/` (routes/pages)
    - `components/` (UI + feature components)
    - `features/pomodoro/`
    - `lib/` (utils)
    - `store/`
    - `styles/`
- [ ] Add basic app shell
  - Header (title + theme toggle)
  - Main container (timer card)
  - Footer (shortcuts/help)

---

## 2) Timer Engine (tested, no UI coupling)
> Implement as a pure state machine + a scheduler that survives throttling.

- [ ] Create `src/features/pomodoro/engine/`:
  - `types.ts` (Phase, Config, State)
  - `reducer.ts` (state transitions)
  - `clock.ts` (accurate timekeeping using `performance.now()` + `Date.now()`)
  - `selectors.ts`
- [ ] Requirements for accuracy
  - Use “target end timestamp” approach (compute remaining from endTime)
  - Handle background tab throttling gracefully
  - Pause preserves remaining time
- [ ] Add tests (Vitest)
  - Transitions: start/pause/resume/reset/skip
  - Long break after N focus sessions
  - Auto-start behavior
  - Acceptance: `pnpm test` passes, core logic covered

---

## 3) MVP UI
### Layout
- [ ] Timer “hero” card:
  - Big time display (MM:SS)
  - Phase label (Focus / Break)
  - Animated progress ring
  - Primary controls row
- [ ] Phase tabs or segmented control (optional)
- [ ] Settings drawer/modal:
  - Focus minutes
  - Short break minutes
  - Long break minutes
  - Sessions before long break
  - Auto-start toggles
- [ ] Presets menu (Classic, Deep Work, Custom)
- [ ] Responsive design:
  - Mobile-first, looks great at 360px and up
  - Desktop: centered, max-width container

### UX polish
- [ ] Smooth digit transitions (no jitter)
- [ ] Micro-interactions: hover/press states, subtle shadows, gradient accents
- [ ] “End of phase” celebration (tiny confetti pulse or glow) (keep tasteful)

Acceptance:
- Timer runs, settings apply immediately (or via “Save”)
- Reset returns to initial phase cleanly
- No layout shifts while running

---

## 4) Notifications + Audio
- [ ] Add sound manager `src/lib/sound.ts`
  - Short “ding” on phase end
  - Volume slider (0–100), default 40
  - Respect “mute”
- [ ] Web Notifications
  - Permission request only when user enables notifications
  - Notification content includes phase + next phase
- [ ] Fallback when notifications denied: in-app toast

Acceptance:
- When focus ends, user gets sound + notification (if enabled)
- No spam: only one notification per phase end

---

## 5) Accessibility + PWA + Offline
- [ ] Accessibility pass
  - Keyboard-only operation
  - Visible focus outlines
  - ARIA labels for controls
  - `prefers-reduced-motion` disables heavy animations
- [ ] Add PWA support
  - Installable manifest, icons, theme color
  - Service worker caching shell
- [ ] Offline mode
  - App loads offline
  - Timer works offline (no network dependency)

Acceptance:
- Lighthouse: strong scores in PWA + Accessibility (target 95+)

---

## 6) Stats (v1)
- [ ] Track completed focus sessions
- [ ] Track total focused minutes per day
- [ ] Simple Stats view:
  - Today: sessions, minutes
  - Last 7 days chart (simple)
- [ ] Persistence
  - localStorage (MVP) → optional IndexedDB (later)

Acceptance:
- Refresh doesn’t wipe stats
- Stats update only on completed sessions (not while running)

---

## 7) Quality, CI, Deploy
- [ ] Add GitHub Actions
  - install → lint → test → build
- [ ] Add basic e2e (optional)
  - Playwright: start/pause/resume, settings change
- [ ] Deploy (pick one)
  - Vercel / Netlify / Cloudflare Pages / GitHub Pages
- [ ] Add `README.md`
  - Setup, scripts, features, roadmap, screenshots

Acceptance:
- CI green on main
- Public URL works, PWA install works

---

## Design Notes (target vibe)
- Minimal, premium, calm (think “focus app”, not “gamer UI”)
- Subtle gradients, soft shadows, glass/blur used carefully
- Typography: modern sans, clear hierarchy
- Dark mode must look intentionally designed (not inverted)

---

## Commands (expected)
- `pnpm dev`
- `pnpm build`
- `pnpm test`
- `pnpm lint`

---

## Definition of Done (v1)
- Timer accurate in background
- Settings + presets
- Notifications + sound (optional)
- A11y solid
- PWA installable + offline shell
- Deployed link