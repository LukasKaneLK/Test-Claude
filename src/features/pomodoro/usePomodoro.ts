/**
 * usePomodoro.ts
 * Custom hook that wires the timer engine (reducer + selectors) to the UI.
 * Responsibilities:
 *  - Runs a requestAnimationFrame loop while the timer is active for smooth,
 *    accurate time updates without relying on setInterval drift.
 *  - Dispatches COMPLETE_PHASE when wall-clock time reaches endTime.
 *  - Manages background audio (focus music + button click sounds).
 *  - Exposes a stable public API of actions and derived display values.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createInitialState, timerReducer } from './engine/reducer'
import { formatTime, getDisplayMs, getProgress, phaseLabel } from './engine/selectors'
import type { Config } from './engine/types'
import ukuleleUrl from '@/assets/bensound-ukulele.mp3'
import buttonPressUrl from '@/assets/Button_press.wav'

export function usePomodoro() {
  const [state, dispatch] = useReducer(timerReducer, undefined, () =>
    createInitialState()
  )
  // `now` is updated every animation frame while running to drive re-renders.
  const [now, setNow] = useState(() => Date.now())
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(true)
  const [customMusicName, setCustomMusicName] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)            // handle for the active RAF loop
  const audioRef = useRef<HTMLAudioElement | null>(null) // background focus music
  const clickRef = useRef<HTMLAudioElement | null>(null) // button press sound
  const customMusicUrlRef = useRef<string | null>(null)  // object URL for custom track
  const musicPlayingRef = useRef(true)                   // ref mirror for use in callbacks

  // Initialise audio elements once on mount (avoids recreating them on every render).
  useEffect(() => {
    audioRef.current = new Audio(ukuleleUrl)
    clickRef.current = new Audio(buttonPressUrl)
  }, [])

  /** Plays the button-click sound effect, respecting the mute flag. */
  const playClick = useCallback(() => {
    if (muted || !clickRef.current) return
    clickRef.current.currentTime = 0
    clickRef.current.play().catch(() => undefined)
  }, [muted])

  // RAF-based tick loop: only active while the timer is running.
  // Using requestAnimationFrame instead of setInterval avoids timer drift and
  // gives ~60 fps updates, keeping the countdown display perfectly smooth.
  useEffect(() => {
    if (state.status !== 'running') {
      // Cancel any existing loop when the timer stops or pauses.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const tick = () => {
      const t = Date.now()
      setNow(t)

      // Check if phase completed
      if (state.endTime !== null && t >= state.endTime) {
        dispatch({ type: 'COMPLETE_PHASE' })
        return  // stop scheduling further frames; the reducer will change status
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [state.status, state.endTime])

  /** Toggles the global mute state and mirrors it onto the audio element. */
  const toggleMute = useCallback(() => {
    playClick()
    setMuted((m) => {
      const next = !m
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }, [playClick])

  /** Starts a fresh focus session and begins playing background music. */
  const start = useCallback(() => {
    playClick()
    if (audioRef.current && !audioRef.current.muted && musicPlayingRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => undefined)
    }
    dispatch({ type: 'START' })
  }, [playClick])

  /** Stops and rewinds the background music. */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  // Stop audio when phase changes away from focus or timer stops
  useEffect(() => {
    if (state.phase !== 'focus' || state.status !== 'running') {
      stopAudio()
    }
  }, [state.phase, state.status, stopAudio])

  const pause = useCallback(() => { playClick(); dispatch({ type: 'PAUSE' }) }, [playClick])
  const resume = useCallback(() => {
    playClick()
    if (audioRef.current && !audioRef.current.muted && musicPlayingRef.current && state.phase === 'focus') {
      audioRef.current.play().catch(() => undefined)
    }
    dispatch({ type: 'RESUME' })
  }, [playClick, state.phase])
  const reset = useCallback(() => { playClick(); dispatch({ type: 'RESET' }) }, [playClick])
  const skip = useCallback(() => { playClick(); dispatch({ type: 'SKIP' }) }, [playClick])
  /** Toggles whether the music track repeats when it ends. */
  const toggleLoop = useCallback(() => {
    setLoop((l) => {
      const next = !l
      if (audioRef.current) audioRef.current.loop = next
      return next
    })
  }, [])

  /** Plays or pauses the music track independently of the timer. */
  const toggleMusicPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => undefined)
      musicPlayingRef.current = true
      setMusicPlaying(true)
    } else {
      audio.pause()
      musicPlayingRef.current = false
      setMusicPlaying(false)
    }
  }, [])

  /** Loads a user-selected audio file as the background music track. */
  const loadCustomMusic = useCallback((file: File) => {
    if (customMusicUrlRef.current) {
      URL.revokeObjectURL(customMusicUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    customMusicUrlRef.current = url
    setCustomMusicName(file.name)
    if (audioRef.current) {
      const wasMuted = audioRef.current.muted
      audioRef.current.pause()
      audioRef.current.src = url
      audioRef.current.muted = wasMuted
    }
  }, [])

  /** Merges partial config changes and recalculates durations where necessary. */
  const updateConfig = useCallback(
    (config: Partial<Config>) => dispatch({ type: 'UPDATE_CONFIG', config }),
    []
  )

  // Derive display values from current state + live `now` timestamp.
  const displayMs = getDisplayMs(state, now)
  const progress = getProgress(state, now)

  // Keep the browser tab title in sync with the countdown.
  useEffect(() => {
    const time = formatTime(displayMs)
    const label = phaseLabel(state.phase)
    document.title = state.status === 'idle' ? 'Pomodoro' : `${time} — ${label}`
    return () => { document.title = 'Pomodoro' }
  }, [displayMs, state.phase, state.status])

  // Return the public API consumed by App and TimerCard.
  return {
    phase: state.phase,
    status: state.status,
    muted,
    toggleMute,
    label: phaseLabel(state.phase),
    timeDisplay: formatTime(displayMs),
    progress,
    completedSessions: state.completedSessions,
    config: state.config,
    start,
    pause,
    resume,
    reset,
    skip,
    updateConfig,
    loadCustomMusic,
    customMusicName,
    loop,
    toggleLoop,
    musicPlaying,
    toggleMusicPlayback,
  }
}
