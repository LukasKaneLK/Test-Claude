/**
 * reducer.ts
 * Pure reducer for the Pomodoro timer state machine.
 * All timing arithmetic is done with absolute wall-clock timestamps (endTime)
 * rather than decrementing counters, which keeps pause/resume accurate regardless
 * of how long React renders or background tabs throttle timers.
 */
import { DEFAULT_CONFIG } from './types'
import type { Config, Phase, TimerAction, TimerState } from './types'

/** Returns the total duration in milliseconds for a given phase and config. */
function phaseDurationMs(phase: Phase, config: Config): number {
  switch (phase) {
    case 'focus':
      return config.focusMinutes * 60_000
    case 'shortBreak':
      return config.shortBreakMinutes * 60_000
    case 'longBreak':
      return config.longBreakMinutes * 60_000
  }
}

/**
 * Determines the next phase and updated session count after the current phase ends.
 * Cycle: focus → shortBreak → focus → ... → longBreak (after N focus sessions) → focus.
 * After a long break, completedSessions resets to 0 to begin a fresh cycle.
 */
function nextPhase(state: TimerState): { phase: Phase; completedSessions: number } {
  const { phase, completedSessions, config } = state
  if (phase === 'focus') {
    const next = completedSessions + 1
    if (next >= config.sessionsBeforeLongBreak) {
      return { phase: 'longBreak', completedSessions: next }
    }
    return { phase: 'shortBreak', completedSessions: next }
  }
  // after any break → focus, reset session count if after long break
  const sessions = phase === 'longBreak' ? 0 : completedSessions
  return { phase: 'focus', completedSessions: sessions }
}

/**
 * Builds the default initial timer state.
 * @param config - Optional config override; defaults to DEFAULT_CONFIG.
 */
export function createInitialState(config: Config = DEFAULT_CONFIG): TimerState {
  return {
    phase: 'focus',
    status: 'idle',
    endTime: null,
    remainingMs: config.focusMinutes * 60_000,
    completedSessions: 0,
    config,
  }
}

/**
 * Pure reducer that handles all timer state transitions.
 * @param state - Current timer state.
 * @param action - The dispatched action.
 */
export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
    case 'RESUME': {
      if (state.status === 'running') return state
      const now = Date.now()
      // Set endTime as an absolute future timestamp so accuracy is wall-clock-based,
      // not dependent on how often the tick fires.
      return {
        ...state,
        status: 'running',
        endTime: now + state.remainingMs,
      }
    }

    case 'PAUSE': {
      if (state.status !== 'running') return state
      // Capture how much time is left at the moment of pause so resume can restore it.
      const remaining = state.endTime ? Math.max(0, state.endTime - Date.now()) : state.remainingMs
      return {
        ...state,
        status: 'paused',
        endTime: null,
        remainingMs: remaining,
      }
    }

    case 'RESET': {
      // Return to idle with a full duration for the current phase; do not advance the cycle.
      return {
        ...state,
        status: 'idle',
        endTime: null,
        remainingMs: phaseDurationMs(state.phase, state.config),
      }
    }

    case 'SKIP':
    case 'COMPLETE_PHASE': {
      // Advance to the next phase; honour autoStart flags to decide whether to run immediately.
      const { phase, completedSessions } = nextPhase(state)
      const remainingMs = phaseDurationMs(phase, state.config)
      const autoStart =
        phase === 'focus' ? state.config.autoStartFocus : state.config.autoStartBreaks
      const now = Date.now()
      return {
        ...state,
        phase,
        completedSessions,
        status: autoStart ? 'running' : 'idle',
        endTime: autoStart ? now + remainingMs : null,
        remainingMs,
      }
    }

    case 'UPDATE_CONFIG': {
      const config = { ...state.config, ...action.config }
      // recalculate remaining if idle so duration stays in sync
      const remainingMs =
        state.status === 'idle' ? phaseDurationMs(state.phase, config) : state.remainingMs
      return { ...state, config, remainingMs }
    }

    default:
      return state
  }
}
