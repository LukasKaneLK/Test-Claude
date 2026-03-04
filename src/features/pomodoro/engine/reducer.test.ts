import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createInitialState, timerReducer } from './reducer'
import { DEFAULT_CONFIG } from './types'
import type { TimerState } from './types'

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

describe('createInitialState', () => {
  it('uses DEFAULT_CONFIG when called with no args', () => {
    const state = createInitialState()
    expect(state.config).toEqual(DEFAULT_CONFIG)
    expect(state.remainingMs).toBe(DEFAULT_CONFIG.focusMinutes * 60_000)
    expect(state.phase).toBe('focus')
    expect(state.status).toBe('idle')
    expect(state.endTime).toBeNull()
    expect(state.completedSessions).toBe(0)
  })

  it('merges a partial config override', () => {
    const state = createInitialState({ focusMinutes: 30 })
    expect(state.config.focusMinutes).toBe(30)
    expect(state.remainingMs).toBe(30 * 60_000)
    // Other config fields stay at defaults.
    expect(state.config.shortBreakMinutes).toBe(DEFAULT_CONFIG.shortBreakMinutes)
  })

  it('applies full config override', () => {
    const state = createInitialState({ focusMinutes: 45, sessionsBeforeLongBreak: 2 })
    expect(state.config.focusMinutes).toBe(45)
    expect(state.config.sessionsBeforeLongBreak).toBe(2)
    expect(state.remainingMs).toBe(45 * 60_000)
  })
})

// ---------------------------------------------------------------------------
// timerReducer — helper
// ---------------------------------------------------------------------------

function idle(): TimerState {
  return createInitialState()
}

// ---------------------------------------------------------------------------
// START / RESUME
// ---------------------------------------------------------------------------

describe('timerReducer START', () => {
  it('transitions idle → running and sets endTime', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const state = timerReducer(idle(), { type: 'START' })
    expect(state.status).toBe('running')
    expect(state.endTime).toBe(now + DEFAULT_CONFIG.focusMinutes * 60_000)
    vi.restoreAllMocks()
  })

  it('is a no-op when already running', () => {
    const running = timerReducer(idle(), { type: 'START' })
    const again = timerReducer(running, { type: 'START' })
    expect(again).toBe(running)
  })
})

describe('timerReducer RESUME', () => {
  it('resumes from paused with correct endTime', () => {
    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const paused: TimerState = { ...idle(), status: 'paused', remainingMs: 5_000 }
    const state = timerReducer(paused, { type: 'RESUME' })
    expect(state.status).toBe('running')
    expect(state.endTime).toBe(now + 5_000)
    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------------------
// PAUSE
// ---------------------------------------------------------------------------

describe('timerReducer PAUSE', () => {
  it('captures remaining ms and clears endTime', () => {
    const startTime = 2_000_000
    vi.spyOn(Date, 'now').mockReturnValue(startTime)
    const running = timerReducer(idle(), { type: 'START' })

    // Simulate 10 s passing.
    vi.spyOn(Date, 'now').mockReturnValue(startTime + 10_000)
    const paused = timerReducer(running, { type: 'PAUSE' })

    expect(paused.status).toBe('paused')
    expect(paused.endTime).toBeNull()
    expect(paused.remainingMs).toBe(DEFAULT_CONFIG.focusMinutes * 60_000 - 10_000)
    vi.restoreAllMocks()
  })

  it('is a no-op when not running', () => {
    const state = timerReducer(idle(), { type: 'PAUSE' })
    expect(state.status).toBe('idle')
  })
})

// ---------------------------------------------------------------------------
// RESET
// ---------------------------------------------------------------------------

describe('timerReducer RESET', () => {
  it('returns to idle with full phase duration', () => {
    const running = timerReducer(idle(), { type: 'START' })
    const reset = timerReducer(running, { type: 'RESET' })
    expect(reset.status).toBe('idle')
    expect(reset.endTime).toBeNull()
    expect(reset.remainingMs).toBe(DEFAULT_CONFIG.focusMinutes * 60_000)
    expect(reset.phase).toBe('focus')
  })
})

// ---------------------------------------------------------------------------
// SKIP / COMPLETE_PHASE — phase cycling
// ---------------------------------------------------------------------------

describe('timerReducer SKIP / COMPLETE_PHASE — phase cycling', () => {
  it('focus → shortBreak before sessionsBeforeLongBreak', () => {
    const state = timerReducer(idle(), { type: 'SKIP' })
    expect(state.phase).toBe('shortBreak')
    expect(state.completedSessions).toBe(1)
  })

  it('focus → longBreak after sessionsBeforeLongBreak sessions', () => {
    // DEFAULT sessionsBeforeLongBreak = 4; simulate 3 completed already.
    const almost: TimerState = { ...idle(), completedSessions: 3 }
    const state = timerReducer(almost, { type: 'SKIP' })
    expect(state.phase).toBe('longBreak')
    expect(state.completedSessions).toBe(4)
  })

  it('shortBreak → focus', () => {
    const onBreak: TimerState = { ...idle(), phase: 'shortBreak', completedSessions: 1 }
    const state = timerReducer(onBreak, { type: 'SKIP' })
    expect(state.phase).toBe('focus')
  })

  it('longBreak → focus and resets completedSessions', () => {
    const onLong: TimerState = { ...idle(), phase: 'longBreak', completedSessions: 4 }
    const state = timerReducer(onLong, { type: 'SKIP' })
    expect(state.phase).toBe('focus')
    expect(state.completedSessions).toBe(0)
  })

  it('sets correct remainingMs for each phase', () => {
    const toShort = timerReducer(idle(), { type: 'SKIP' })
    expect(toShort.remainingMs).toBe(DEFAULT_CONFIG.shortBreakMinutes * 60_000)
  })

  it('autoStartBreaks starts the timer automatically', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const autoConfig = { ...idle(), config: { ...DEFAULT_CONFIG, autoStartBreaks: true } }
    const state = timerReducer(autoConfig, { type: 'SKIP' })
    expect(state.status).toBe('running')
    expect(state.endTime).toBe(now + DEFAULT_CONFIG.shortBreakMinutes * 60_000)
    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------------------
// UPDATE_CONFIG
// ---------------------------------------------------------------------------

describe('timerReducer UPDATE_CONFIG', () => {
  it('merges partial config', () => {
    const state = timerReducer(idle(), { type: 'UPDATE_CONFIG', config: { focusMinutes: 30 } })
    expect(state.config.focusMinutes).toBe(30)
    expect(state.config.shortBreakMinutes).toBe(DEFAULT_CONFIG.shortBreakMinutes)
  })

  it('recalculates remainingMs when idle', () => {
    const state = timerReducer(idle(), { type: 'UPDATE_CONFIG', config: { focusMinutes: 30 } })
    expect(state.remainingMs).toBe(30 * 60_000)
  })

  it('does NOT recalculate remainingMs when running', () => {
    const running = timerReducer(idle(), { type: 'START' })
    const original = running.remainingMs
    const state = timerReducer(running, { type: 'UPDATE_CONFIG', config: { focusMinutes: 1 } })
    expect(state.remainingMs).toBe(original)
  })

  it('recalculates remainingMs for shortBreak phase when idle', () => {
    const onBreak: TimerState = { ...idle(), phase: 'shortBreak' }
    const state = timerReducer(onBreak, { type: 'UPDATE_CONFIG', config: { shortBreakMinutes: 10 } })
    expect(state.remainingMs).toBe(10 * 60_000)
  })
})
