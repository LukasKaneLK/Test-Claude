/**
 * TimerCard.tsx
 * The main visual card component. Renders:
 *  - Session progress dots (how many focus sessions have been completed this cycle)
 *  - An SVG circular progress ring with the countdown time in the centre
 *  - Play/Pause/Resume, Reset, and Skip control buttons
 *  - A mute toggle for the background audio
 *
 * All visual state (colours, labels, button text) is derived from the phase and
 * status values passed down from usePomodoro via App.
 */
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { Phase } from '@/features/pomodoro/engine/types'
import type { usePomodoro } from '@/features/pomodoro/usePomodoro'

/** SVG circle geometry constants for the progress ring. */
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Stroke colours for the progress arc, one per phase and colour scheme. */
const RING_COLOR: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#e11d48', dark: '#fb7185' },
  shortBreak: { light: '#0d9488', dark: '#2dd4bf' },
  longBreak:  { light: '#4338ca', dark: '#818cf8' },
}

/** Tailwind classes for the primary action button, coloured per phase. */
const BTN_COLOR: Record<Phase, string> = {
  focus:      'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-rose-200 dark:shadow-rose-950',
  shortBreak: 'bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white shadow-teal-200 dark:shadow-teal-950',
  longBreak:  'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-indigo-950',
}

// Infer props from the hook's return type so TimerCard always stays in sync.
type PomodoroState = ReturnType<typeof usePomodoro>

interface TimerCardProps extends PomodoroState {
  isDark: boolean
}

/**
 * Renders the glassmorphic timer card.
 * Receives the full Pomodoro hook state spread from App, plus isDark for colour theming.
 */
export function TimerCard({
  phase,
  status,
  label,
  timeDisplay,
  progress,
  completedSessions,
  config,
  isDark,
  muted,
  toggleMute,
  start,
  pause,
  resume,
  reset,
  skip,
}: TimerCardProps) {
  const isRunning = status === 'running'
  // Map progress (0–1) to SVG strokeDashoffset: full offset = no arc, 0 = full circle.
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = isDark ? RING_COLOR[phase].dark : RING_COLOR[phase].light

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Glass card */}
      <div className="rounded-3xl border border-black/10 bg-white/60 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/30">

        {/* Session dots — one dot per session slot; filled dots show completed sessions
            within the current cycle (wraps after sessionsBeforeLongBreak). */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {Array.from({ length: config.sessionsBeforeLongBreak }).map((_, i) => {
            const filled = i < (completedSessions % config.sessionsBeforeLongBreak)
            return (
              <span
                key={i}
                className={[
                  'h-2 w-2 rounded-full transition-all duration-300',
                  filled
                    ? phase === 'focus'
                      ? 'bg-rose-500 scale-110'
                      : phase === 'shortBreak'
                      ? 'bg-teal-500 scale-110'
                      : 'bg-indigo-500 scale-110'
                    : 'bg-black/15 dark:bg-white/15',
                ].join(' ')}
                aria-hidden="true"
              />
            )
          })}
        </div>

        {/* Progress ring + time */}
        <div className="relative mx-auto mb-8 flex h-56 w-56 items-center justify-center">
          <svg
            width="224"
            height="224"
            viewBox="0 0 224 224"
            className="-rotate-90 absolute inset-0"  // rotated so progress starts at 12 o'clock
            aria-hidden="true"
          >
            {/* Track: full faint circle behind the progress arc */}
            <circle
              cx="112" cy="112" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="opacity-10"
            />
            {/* Progress arc: dashoffset shrinks as time elapses */}
            <circle
              cx="112" cy="112" r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.8s ease' }}
            />
          </svg>

          {/* Countdown digits and phase label centred inside the ring */}
          <div className="relative flex flex-col items-center">
            <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
              {timeDisplay}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-50">
              {label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Primary action button: label and handler adapt to current status */}
          <button
            onClick={isRunning ? pause : status === 'paused' ? resume : start}
            aria-label={isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
            className={[
              'flex w-32 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold',
              'shadow-lg transition-all duration-150 active:scale-95',
              BTN_COLOR[phase],
            ].join(' ')}
          >
            {isRunning ? (
              <><Pause className="h-4 w-4" /> Pause</>
            ) : (
              <><Play className="h-4 w-4" /> {status === 'paused' ? 'Resume' : 'Start'}</>
            )}
          </button>

          <button
            onClick={skip}
            aria-label="Skip phase"
            className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Mute toggle */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              muted
                ? 'bg-black/10 opacity-60 dark:bg-white/10'  // highlighted when muted for visibility
                : 'opacity-30 hover:bg-black/10 hover:opacity-60 dark:hover:bg-white/10',
            ].join(' ')}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? 'Muted' : 'Sound on'}
          </button>
        </div>
      </div>
    </div>
  )
}
