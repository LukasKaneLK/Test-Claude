/**
 * selectors.ts
 * Pure read-only functions that derive display values from TimerState.
 * Keeping these separate from the reducer makes them easy to test in isolation.
 */
import type { Phase, TimerState } from './types'

/**
 * Returns the number of milliseconds left to show in the UI.
 * While running, it subtracts the current wall-clock time from the absolute endTime
 * so the display stays accurate even when React renders are delayed or skipped.
 * Falls back to remainingMs when paused or idle.
 *
 * @param state - Current timer state.
 * @param now - Current timestamp in ms (typically Date.now()).
 */
export function getDisplayMs(state: TimerState, now: number): number {
  if (state.status === 'running' && state.endTime !== null) {
    return Math.max(0, state.endTime - now)
  }
  return state.remainingMs
}

/**
 * Returns a 0–1 progress fraction representing how much of the current phase has elapsed.
 * Used to drive the SVG progress ring animation.
 *
 * @param state - Current timer state.
 * @param now - Current timestamp in ms.
 */
export function getProgress(state: TimerState, now: number): number {
  const { phase, config } = state
  let total: number
  switch (phase) {
    case 'focus':
      total = config.focusMinutes * 60_000
      break
    case 'shortBreak':
      total = config.shortBreakMinutes * 60_000
      break
    case 'longBreak':
      total = config.longBreakMinutes * 60_000
      break
  }
  const remaining = getDisplayMs(state, now)
  // 0 at the start of a phase, 1 when the phase is complete.
  return 1 - remaining / total
}

/**
 * Formats a millisecond duration as "MM:SS" for display.
 * Uses Math.ceil so the display shows the current second until it fully elapses.
 *
 * @param ms - Duration in milliseconds.
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Returns the human-readable label for a given phase.
 * @param phase - The current timer phase.
 */
export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'focus':
      return 'Focus'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}
