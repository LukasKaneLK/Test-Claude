/**
 * TimerCard.tsx
 * The main visual card component. Renders:
 *  - Session progress dots
 *  - SVG circular progress ring with countdown time
 *  - Play/Pause/Resume, Reset, Skip controls
 *  - Mute toggle
 *  - Task queue: tasks dragged onto the timer appear here; checking one removes it
 *
 * When `isDropTarget` is true (a card is being dragged over the timer area),
 * the card shows a coloured drop-highlight ring.
 */
import { Check, Music, Pause, Play, Repeat, RotateCcw, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Phase } from '@/features/pomodoro/engine/types'
import type { usePomodoro } from '@/features/pomodoro/usePomodoro'
import type { Task } from '@/features/tasks/types'

/** SVG circle geometry constants for the progress ring. */
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Stroke colours for the progress arc, one per phase and colour scheme. */
const RING_COLOR: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#e11d48', dark: '#fb7185' },
  shortBreak: { light: '#0d9488', dark: '#2dd4bf' },
  longBreak:  { light: '#4338ca', dark: '#818cf8' },
}

/** Drop-highlight ring colour per phase. */
const DROP_RING: Record<Phase, string> = {
  focus:      'ring-rose-400/60',
  shortBreak: 'ring-teal-400/60',
  longBreak:  'ring-indigo-400/60',
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
  /** Tasks queued to be worked on during this timer session. */
  timerQueue: Task[]
  /** Called when a queued task is marked as completed. */
  onQueueTaskDone: (id: string) => void
  /** Called when a queued task is removed without completing — returns it to planned. */
  onQueueTaskReturn: (id: string) => void
  /** Called when the user picks a custom audio file. */
  loadCustomMusic: (file: File) => void
  /** Name of the currently loaded custom music file, or null if using the default. */
  customMusicName: string | null
  /** Whether the music track loops when it ends. */
  loop: boolean
  /** Toggles music looping. */
  toggleLoop: () => void
  /** Whether the music is currently playing. */
  musicPlaying: boolean
  /** Plays or pauses the music track without affecting the timer. */
  toggleMusicPlayback: () => void
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
  timerQueue,
  onQueueTaskDone,
  onQueueTaskReturn,
  loadCustomMusic,
  customMusicName,
  loop,
  toggleLoop,
  musicPlaying,
  toggleMusicPlayback,
}: TimerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setNodeRef, isOver: isDropTarget } = useDroppable({ id: 'timer-drop' })
  const isRunning = status === 'running'
  // Map progress (0–1) to SVG strokeDashoffset: full offset = no arc, 0 = full circle.
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = isDark ? RING_COLOR[phase].dark : RING_COLOR[phase].light

  const currentTask = timerQueue[0] ?? null
  const upNext = timerQueue.slice(1)

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Glass card — highlighted with a ring when a task is dragged over */}
      <div
        ref={setNodeRef}
        className={[
          'rounded-3xl border border-black/10 bg-white/60 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-200',
          'dark:border-white/10 dark:bg-black/30',
          isDropTarget ? `ring-4 ${DROP_RING[phase]} scale-[1.02]` : '',
        ].join(' ')}
      >
        {/* Drop hint overlay — shown only while dragging over */}
        {isDropTarget && (
          <div className="mb-4 rounded-xl bg-black/5 px-3 py-2 text-center text-xs font-medium opacity-60 dark:bg-white/10">
            Drop to add to queue
          </div>
        )}

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
                      ? 'scale-110 bg-rose-500'
                      : phase === 'shortBreak'
                      ? 'scale-110 bg-teal-500'
                      : 'scale-110 bg-indigo-500'
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
            className="-rotate-90 absolute inset-0"
            aria-hidden="true"
          >
            {/* Track: full faint circle behind the progress arc */}
            <circle cx="112" cy="112" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="10" className="opacity-10" />
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
          <button onClick={reset} aria-label="Reset timer"
            className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10">
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

          <button onClick={skip} aria-label="Skip phase"
            className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Audio controls: mute toggle + custom music loader */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              muted
                ? 'bg-black/10 opacity-60 dark:bg-white/10'
                : 'opacity-30 hover:bg-black/10 hover:opacity-60 dark:hover:bg-white/10',
            ].join(' ')}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? 'Muted' : 'Sound on'}
          </button>

          {/* Hidden file input for custom music */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) loadCustomMusic(file)
              e.target.value = ''
            }}
          />

          {/* Music tab — grouped pill containing file picker, play/pause, and repeat */}
          <div className="flex items-center overflow-hidden rounded-full border border-black/10 dark:border-white/10">
            {/* File picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Load custom music"
              title={customMusicName ?? 'Load custom music'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10"
            >
              <Music className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[9rem] truncate">
                {customMusicName ?? 'Music'}
              </span>
            </button>

            {/* Play/pause — only when a custom track is loaded */}
            {customMusicName && (
              <>
                <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                <button
                  onClick={toggleMusicPlayback}
                  aria-label={musicPlaying ? 'Pause music' : 'Play music'}
                  className={[
                    'px-3 py-1.5 transition-all',
                    musicPlaying
                      ? 'opacity-40 hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10'
                      : 'bg-black/10 opacity-70 dark:bg-white/10',
                  ].join(' ')}
                >
                  {musicPlaying
                    ? <Pause className="h-3.5 w-3.5" />
                    : <Play  className="h-3.5 w-3.5" />}
                </button>
              </>
            )}

            {/* Repeat toggle */}
            <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
            <button
              onClick={toggleLoop}
              aria-label={loop ? 'Disable repeat' : 'Enable repeat'}
              className={[
                'px-3 py-1.5 transition-all',
                loop
                  ? 'bg-black/10 opacity-70 dark:bg-white/10'
                  : 'opacity-40 hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10',
              ].join(' ')}
            >
              <Repeat className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Task queue — visible when at least one task has been dropped onto the timer */}
        {timerQueue.length > 0 && (
          <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">

            {/* Queue tab header */}
            <div className="mb-3 flex">
              <span className="rounded-lg bg-black/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest opacity-50 dark:bg-white/8">
                Queue
              </span>
            </div>

            {/* All queue items */}
            <ul className="flex flex-col gap-1.5">
              {timerQueue.map((task, i) => (
                <li key={task.id} className={['group flex items-center gap-2', i > 0 ? 'opacity-40' : ''].join(' ')}>
                  <span className={['shrink-0 rounded-full bg-current', i === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1'].join(' ')} />
                  <span className={['flex-1 leading-snug', i === 0 ? 'text-sm' : 'text-xs'].join(' ')}>
                    {task.text || <span className="italic opacity-30">Untitled task</span>}
                  </span>
                  {/* Complete: mark done, remove from queue; reset timer only if current task */}
                  <button
                    onClick={() => { onQueueTaskDone(task.id); if (i === 0) reset() }}
                    aria-label="Mark as completed"
                    className="shrink-0 opacity-0 transition-opacity hover:opacity-80 group-hover:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  {/* Delete: return to planned; reset timer only if current task */}
                  <button
                    onClick={() => { onQueueTaskReturn(task.id); if (i === 0) reset() }}
                    aria-label="Return to planned"
                    className="shrink-0 opacity-0 transition-opacity hover:opacity-80 group-hover:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
