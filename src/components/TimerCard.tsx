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
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, Music, Pause, Play, Plus, Repeat, RotateCcw, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Phase } from '@/features/pomodoro/engine/types'
import type { Track, usePomodoro } from '@/features/pomodoro/usePomodoro'
import type { Task } from '@/features/tasks/types'
import { useLanguage } from '@/i18n/LanguageContext'
import { fmt } from '@/i18n/translations'

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
  timerQueue: Task[]
  onQueueTaskDone: (id: string) => void
  onQueueTaskReturn: (id: string) => void
}

/**
 * Renders the glassmorphic timer card.
 * Receives the full Pomodoro hook state spread from App, plus isDark for colour theming.
 */
export function TimerCard({
  phase,
  status,
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
  playlist,
  currentTrackIndex,
  addTrack,
  removeTrack,
  playTrackAt,
  nextTrack,
  prevTrack,
  loop,
  toggleLoop,
  musicPlaying,
  toggleMusicPlayback,
}: TimerCardProps) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showQueueHint, setShowQueueHint] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const currentTrack: Track | undefined = playlist[currentTrackIndex]
  const { setNodeRef, isOver: isDropTarget } = useDroppable({ id: 'timer-drop' })

  const showHint = () => {
    setShowQueueHint(true)
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => setShowQueueHint(false), 3000)
  }

  const handleStart = () => {
    if (timerQueue.length === 0) { showHint(); return }
    setShowQueueHint(false)
    start()
  }

  const handleResume = () => {
    if (timerQueue.length === 0) { showHint(); return }
    setShowQueueHint(false)
    resume()
  }

  const handleMusicPlay = () => {
    if (!musicPlaying && timerQueue.length === 0) { showHint(); return }
    toggleMusicPlayback()
  }
  const isRunning = status === 'running'
  // Map progress (0–1) to SVG strokeDashoffset: full offset = no arc, 0 = full circle.
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = isDark ? RING_COLOR[phase].dark : RING_COLOR[phase].light

  return (
    <div className="mx-auto w-full max-w-sm" data-tutorial="timer-card">
      {/* Glass card — highlighted with a ring when a task is dragged over */}
      <div
        ref={setNodeRef}
        className={[
          'rounded-3xl border border-black/10 bg-white/60 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-200 sm:p-8',
          'dark:border-white/10 dark:bg-black/30',
          isDropTarget ? `ring-4 ${DROP_RING[phase]} scale-[1.02]` : '',
        ].join(' ')}
      >
        {/* Drop hint overlay — shown only while dragging over */}
        {isDropTarget && (
          <div className="mb-4 rounded-xl bg-black/5 px-3 py-2 text-center text-xs font-medium opacity-60 dark:bg-white/10">
            {t.dropToQueue}
          </div>
        )}

        {/* Session dots — one dot per session slot; filled dots show completed sessions
            within the current cycle (wraps after sessionsBeforeLongBreak). */}
        <Tooltip text={fmt(t.sessionsCompleted, { n: completedSessions % config.sessionsBeforeLongBreak, total: config.sessionsBeforeLongBreak })}>
        <div className="mb-6 flex items-center justify-center gap-2" data-tutorial="session-dots">
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
        </Tooltip>

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
              style={{ transition: 'stroke 0.8s ease' }}
            />
          </svg>

          {/* Countdown digits and phase label centred inside the ring */}
          <div className="relative flex flex-col items-center">
            <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
              {timeDisplay}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-50">
              {phase === 'focus' ? t.phaseFocus : phase === 'shortBreak' ? t.phaseShortBreak : t.phaseLongBreak}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Tooltip text={t.tooltipReset}>
            <button onClick={reset} aria-label={t.tooltipReset}
              className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10">
              <RotateCcw className="h-5 w-5" />
            </button>
          </Tooltip>

          {/* Primary action button: label and handler adapt to current status */}
          <Tooltip text={isRunning ? t.tooltipPause : status === 'paused' ? t.tooltipResume : t.tooltipStart}>
            <button
              data-tutorial="timer-start"
              onClick={isRunning ? pause : status === 'paused' ? handleResume : handleStart}
              aria-label={isRunning ? t.btnPause : status === 'paused' ? t.btnResume : t.btnStart}
              className={[
                'flex w-32 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold',
                'shadow-lg transition-all duration-150 active:scale-95',
                BTN_COLOR[phase],
              ].join(' ')}
            >
              {isRunning ? (
                <><Pause className="h-4 w-4" /> {t.btnPause}</>
              ) : (
                <><Play className="h-4 w-4" /> {status === 'paused' ? t.btnResume : t.btnStart}</>
              )}
            </button>
          </Tooltip>

          <Tooltip text={t.tooltipSkip}>
            <button onClick={skip} aria-label={t.tooltipSkip}
              className="rounded-full p-2.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 active:scale-95 dark:hover:bg-white/10">
              <SkipForward className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

        {/* Queue hint — shown when user tries to start without tasks */}
        <div className={[
          'overflow-hidden transition-all duration-300',
          showQueueHint ? 'mt-3 max-h-12 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}>
          <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-400">
            {t.queueHint}
          </p>
        </div>

        {/* Audio controls */}
        <div className="mt-5 space-y-2">

          {/* Row 1: mute toggle */}
          <div className="flex justify-center" data-tutorial="mute-toggle">
            <Tooltip text={muted ? t.tooltipUnmute : t.tooltipMute}>
              <button
                onClick={toggleMute}
                aria-label={muted ? t.tooltipUnmute : t.tooltipMute}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  muted
                    ? 'bg-black/10 opacity-60 dark:bg-white/10'
                    : 'opacity-30 hover:bg-black/10 hover:opacity-60 dark:hover:bg-white/10',
                ].join(' ')}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {muted ? t.muted : t.soundOn}
              </button>
            </Tooltip>
          </div>

          {/* Row 2: music pill */}
          <div className="flex justify-center">

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) addTrack(file)
                e.target.value = ''
              }}
            />

            {/* Music pill */}
            <div data-tutorial="music-controls" className="flex shrink-0 items-center overflow-hidden rounded-full border border-black/10 dark:border-white/10">

              {/* Prev track */}
              {playlist.length > 1 && (
                <>
                  <Tooltip text={t.tooltipPrevTrack}>
                    <button onClick={prevTrack} aria-label={t.tooltipPrevTrack}
                      className="px-2.5 py-1.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                </>
              )}

              {/* Play/pause */}
              {playlist.length > 0 && (
                <>
                  <Tooltip text={musicPlaying ? t.tooltipPauseMusic : t.tooltipPlayMusic}>
                    <button
                      onClick={handleMusicPlay}
                      aria-label={musicPlaying ? t.tooltipPauseMusic : t.tooltipPlayMusic}
                      className={[
                        'px-2.5 py-1.5 transition-all',
                        musicPlaying
                          ? 'opacity-40 hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10'
                          : 'bg-black/10 opacity-70 dark:bg-white/10',
                      ].join(' ')}
                    >
                      {musicPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                  </Tooltip>
                  <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                </>
              )}

              {/* Track name / open playlist */}
              <Tooltip text={showPlaylist ? t.tooltipHidePlaylist : t.tooltipOpenPlaylist}>
              <button
                onClick={() => setShowPlaylist((v) => !v)}
                aria-label={showPlaylist ? t.tooltipHidePlaylist : t.tooltipOpenPlaylist}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10"
              >
                <Music className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[6rem] truncate">
                  {currentTrack ? currentTrack.name : t.playlistLabel}
                </span>
                {showPlaylist
                  ? <ChevronUp className="h-3 w-3 shrink-0" />
                  : <ChevronDown className="h-3 w-3 shrink-0" />}
              </button>
              </Tooltip>

              {/* Next track */}
              {playlist.length > 1 && (
                <>
                  <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                  <Tooltip text={t.tooltipNextTrack}>
                    <button onClick={nextTrack} aria-label={t.tooltipNextTrack}
                      className="px-2.5 py-1.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </>
              )}

              {/* Repeat */}
              <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
              <Tooltip text={loop ? t.tooltipDisableRepeat : t.tooltipLoopPlaylist}>
                <button
                  onClick={toggleLoop}
                  aria-label={loop ? t.tooltipDisableRepeat : t.tooltipLoopPlaylist}
                  className={[
                    'px-2.5 py-1.5 transition-all',
                    loop
                      ? 'bg-black/10 opacity-70 dark:bg-white/10'
                      : 'opacity-40 hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10',
                  ].join(' ')}
                >
                  <Repeat className="h-3.5 w-3.5" />
                </button>
              </Tooltip>

              {/* Add track */}
              <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
              <Tooltip text={t.tooltipAddAudio}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t.tooltipAddAudio}
                  className="px-2.5 py-1.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Expandable playlist panel */}
          <div className={[
            'overflow-hidden transition-all duration-300',
            showPlaylist ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
          ].join(' ')}>
            <div className="rounded-2xl border border-black/10 dark:border-white/10">
              {playlist.length === 0 ? (
                <p className="px-4 py-3 text-center text-xs opacity-40">
                  {t.noTracks}
                </p>
              ) : (
                <ul className="max-h-40 overflow-y-auto py-1">
                  {playlist.map((track, i) => (
                    <li
                      key={track.url}
                      className={[
                        'group flex items-center gap-2 px-3 py-1.5 transition-all',
                        i === currentTrackIndex ? 'opacity-100' : 'opacity-50 hover:opacity-80',
                      ].join(' ')}
                    >
                      {/* Play indicator / select button */}
                      <button
                        onClick={() => { if (timerQueue.length === 0) { showHint(); return } playTrackAt(i) }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        aria-label={`${t.tooltipPlayMusic} ${track.name}`}
                      >
                        <span className="shrink-0">
                          {i === currentTrackIndex
                            ? <Music className="h-3 w-3" />
                            : <Play className="h-3 w-3" />}
                        </span>
                        <span className="truncate text-xs">{track.name}</span>
                      </button>
                      {/* Remove */}
                      <Tooltip text={t.tooltipRemoveFromPlaylist}>
                        <button
                          onClick={() => removeTrack(i)}
                          aria-label={t.tooltipRemoveFromPlaylist}
                          className="shrink-0 opacity-0 transition-opacity hover:opacity-80 group-hover:opacity-40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Task queue — visible when at least one task has been dropped onto the timer */}
        {timerQueue.length > 0 && (
          <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">

            {/* Queue tab header */}
            <div className="mb-3 flex">
              <span className="rounded-lg bg-black/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest opacity-50 dark:bg-white/8">
                {t.queue}
              </span>
            </div>

            {/* All queue items */}
            <ul className="flex flex-col gap-1.5">
              {timerQueue.map((task, i) => (
                <li key={task.id} className={['group flex items-center gap-2', i > 0 ? 'opacity-40' : ''].join(' ')}>
                  <span className={['shrink-0 rounded-full bg-current', i === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1'].join(' ')} />
                  <span className={['flex-1 leading-snug', i === 0 ? 'text-sm' : 'text-xs'].join(' ')}>
                    {task.text || <span className="italic opacity-30">{t.untitledTask}</span>}
                  </span>
                  {/* Complete: mark done, remove from queue; reset timer only if current task */}
                  <Tooltip text={t.tooltipMarkDone}>
                    <button
                      onClick={() => { onQueueTaskDone(task.id); if (i === 0) reset() }}
                      aria-label={t.tooltipMarkDone}
                      className="shrink-0 opacity-0 transition-opacity hover:opacity-80 group-hover:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  {/* Delete: return to planned; reset timer only if current task */}
                  <Tooltip text={t.tooltipReturnPlanned}>
                    <button
                      onClick={() => { onQueueTaskReturn(task.id); if (i === 0) reset() }}
                      aria-label={t.tooltipReturnPlanned}
                      className="shrink-0 opacity-0 transition-opacity hover:opacity-80 group-hover:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
