/**
 * types.ts
 * Core type definitions and default configuration for the Pomodoro timer engine.
 * These types are shared across the reducer, selectors, and UI layers.
 */

/** The three phases of a Pomodoro cycle. */
export type Phase = 'focus' | 'shortBreak' | 'longBreak'

/** User-configurable timer settings. */
export interface Config {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  /** How many focus sessions must complete before a long break is triggered. */
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

/** Standard Pomodoro defaults: 25 min focus, 5 min short break, 15 min long break. */
export const DEFAULT_CONFIG: Config = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
}

/** Possible lifecycle states of the timer. */
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  phase: Phase
  status: TimerStatus
  /** Absolute timestamp (ms) when the current phase will end, null when idle/paused */
  endTime: number | null
  /** Remaining ms when paused */
  remainingMs: number
  /** Number of completed focus sessions in current cycle */
  completedSessions: number
  config: Config
}

/** Union of all dispatchable actions for the timer reducer. */
export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'COMPLETE_PHASE' }
  | { type: 'UPDATE_CONFIG'; config: Partial<Config> }
