/**
 * usePomodoro.ts
 * Custom hook that wires the timer engine (reducer + selectors) to the UI.
 * Responsibilities:
 *  - Runs a requestAnimationFrame loop while the timer is active for smooth,
 *    accurate time updates without relying on setInterval drift.
 *  - Dispatches COMPLETE_PHASE when wall-clock time reaches endTime.
 *  - Manages background audio (focus music + button click sounds).
 *  - Manages a user playlist of custom audio tracks.
 *  - Exposes a stable public API of actions and derived display values.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createInitialState, timerReducer } from './engine/reducer'
import { formatTime, getDisplayMs, getProgress, phaseLabel } from './engine/selectors'
import type { Config } from './engine/types'
import ukuleleUrl from '@/assets/bensound-ukulele.mp3'
import buttonPressUrl from '@/assets/Button_press.wav'

export type Track = { name: string; url: string }

export function usePomodoro() {
  const [state, dispatch] = useReducer(timerReducer, undefined, () =>
    createInitialState()
  )
  // `now` is updated every animation frame while running to drive re-renders.
  const [now, setNow] = useState(() => Date.now())
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(true)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const rafRef = useRef<number | null>(null)             // handle for the active RAF loop
  const audioRef = useRef<HTMLAudioElement | null>(null)  // background focus music
  const clickRef = useRef<HTMLAudioElement | null>(null)  // button press sound
  // Ref mirrors for use inside stable callbacks (avoids stale closures).
  const musicPlayingRef = useRef(true)   // actual playback state
  const wantsMusicRef = useRef(true)     // user's explicit intent (survives timer stop/resume)
  const loopRef = useRef(false)
  const playlistRef = useRef<Track[]>([])
  const currentTrackIndexRef = useRef(0)

  // Keep refs in sync with state.
  useEffect(() => { playlistRef.current = playlist }, [playlist])
  useEffect(() => { currentTrackIndexRef.current = currentTrackIndex }, [currentTrackIndex])

  // Timer status/phase refs — used inside stable callbacks to avoid stale closures.
  const timerStatusRef = useRef(state.status)
  const timerPhaseRef = useRef(state.phase)
  useEffect(() => {
    timerStatusRef.current = state.status
    timerPhaseRef.current = state.phase
  }, [state.status, state.phase])

  // Initialise audio elements once on mount.
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
  useEffect(() => {
    if (state.status !== 'running') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (state.endTime !== null && t >= state.endTime) {
        dispatch({ type: 'COMPLETE_PHASE' })
        return
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

  /**
   * Loads the track at the given playlist index into the audio element.
   * If musicPlaying is true and the audio is unmuted, starts playback.
   */
  const playTrackAt = useCallback((index: number) => {
    const pl = playlistRef.current
    const track = pl[index]
    if (!track || !audioRef.current) return
    currentTrackIndexRef.current = index
    setCurrentTrackIndex(index)
    audioRef.current.src = track.url
    audioRef.current.currentTime = 0
    if (musicPlayingRef.current && !audioRef.current.muted) {
      audioRef.current.play().catch(() => undefined)
    }
  }, [])

  // Auto-advance to the next track when the current one ends.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => {
      // Don't auto-advance if the timer isn't actively running a focus session.
      if (timerStatusRef.current !== 'running' || timerPhaseRef.current !== 'focus') return
      const pl = playlistRef.current
      if (pl.length === 0) return
      const idx = currentTrackIndexRef.current
      const isLast = idx === pl.length - 1
      if (isLast && !loopRef.current) {
        musicPlayingRef.current = false
        setMusicPlaying(false)
        return
      }
      playTrackAt((idx + 1) % pl.length)
    }
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [playTrackAt])

  /** Starts a fresh focus session and begins playing background music. */
  const start = useCallback(() => {
    playClick()
    if (audioRef.current && !audioRef.current.muted && wantsMusicRef.current) {
      const pl = playlistRef.current
      if (pl.length > 0) {
        const track = pl[currentTrackIndexRef.current] ?? pl[0]
        audioRef.current.src = track.url
      }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => undefined)
      musicPlayingRef.current = true
      setMusicPlaying(true)
    }
    dispatch({ type: 'START' })
  }, [playClick])

  /** Stops and rewinds the background music. */
  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    musicPlayingRef.current = false
    setMusicPlaying(false)
  }, [])

  // Stop audio when phase changes away from focus or timer stops.
  useEffect(() => {
    if (state.phase !== 'focus' || state.status !== 'running') {
      stopAudio()
    }
  }, [state.phase, state.status, stopAudio])

  const pause = useCallback(() => { playClick(); dispatch({ type: 'PAUSE' }) }, [playClick])
  const resume = useCallback(() => {
    playClick()
    if (audioRef.current && !audioRef.current.muted && wantsMusicRef.current && state.phase === 'focus') {
      audioRef.current.play().catch(() => undefined)
      musicPlayingRef.current = true
      setMusicPlaying(true)
    }
    dispatch({ type: 'RESUME' })
  }, [playClick, state.phase])
  const reset = useCallback(() => { playClick(); dispatch({ type: 'RESET' }) }, [playClick])
  const skip = useCallback(() => { playClick(); dispatch({ type: 'SKIP' }) }, [playClick])

  /** Toggles playlist looping (wraps back to first track at end when on). */
  const toggleLoop = useCallback(() => {
    setLoop((l) => {
      const next = !l
      loopRef.current = next
      return next
    })
  }, [])

  /** Plays or pauses the music track independently of the timer. */
  const toggleMusicPlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      // If a playlist track should be playing but isn't loaded yet, load it first.
      const pl = playlistRef.current
      if (pl.length > 0) {
        const track = pl[currentTrackIndexRef.current] ?? pl[0]
        if (audio.src !== track.url) {
          audio.src = track.url
          audio.currentTime = 0
        }
      }
      audio.play().catch(() => undefined)
      musicPlayingRef.current = true
      wantsMusicRef.current = true
      setMusicPlaying(true)
    } else {
      audio.pause()
      musicPlayingRef.current = false
      wantsMusicRef.current = false
      setMusicPlaying(false)
    }
  }, [])

  /** Adds a file to the end of the playlist. */
  const addTrack = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setPlaylist((prev) => [...prev, { name: file.name, url }])
  }, [])

  /** Removes the track at the given index, revoking its object URL. */
  const removeTrack = useCallback((index: number) => {
    setPlaylist((prev) => {
      if (index < 0 || index >= prev.length) return prev
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
    // If the removed track was before (or at) the current index, shift index back.
    setCurrentTrackIndex((prev) => {
      const next = index < prev ? prev - 1 : index === prev ? 0 : prev
      currentTrackIndexRef.current = next
      return next
    })
    stopAudio()
    if (audioRef.current) audioRef.current.src = ukuleleUrl
    dispatch({ type: 'PAUSE' })
  }, [stopAudio])

  /** Advances to the next track in the playlist (wraps around). */
  const nextTrack = useCallback(() => {
    const pl = playlistRef.current
    if (pl.length === 0) return
    playTrackAt((currentTrackIndexRef.current + 1) % pl.length)
  }, [playTrackAt])

  /** Goes back to the previous track in the playlist (wraps around). */
  const prevTrack = useCallback(() => {
    const pl = playlistRef.current
    if (pl.length === 0) return
    playTrackAt((currentTrackIndexRef.current - 1 + pl.length) % pl.length)
  }, [playTrackAt])

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
    // Playlist
    playlist,
    currentTrackIndex,
    addTrack,
    removeTrack,
    playTrackAt,
    nextTrack,
    prevTrack,
    // Music controls
    loop,
    toggleLoop,
    musicPlaying,
    toggleMusicPlayback,
  }
}
