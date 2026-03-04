/**
 * App.tsx
 * Root application component. Owns the theme state and composes the full-page layout:
 * Header → TimerCard → Footer. Background and blob colours animate between phases
 * to give a visual cue about which part of the Pomodoro cycle is active.
 */
import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TimerCard } from '@/components/TimerCard'
import { usePomodoro } from '@/features/pomodoro/usePomodoro'
import type { Phase } from '@/features/pomodoro/engine/types'

/** Page background colours per phase, keyed by colour scheme. */
const BG: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#fff1f2', dark: '#1a0508' },
  shortBreak: { light: '#f0fdf9', dark: '#021a16' },
  longBreak:  { light: '#eef2ff', dark: '#06071c' },
}

/** Radial gradient "blob" accent colours per phase, keyed by colour scheme. */
const BLOB: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#fda4af', dark: '#9f1239' },
  shortBreak: { light: '#5eead4', dark: '#0d9488' },
  longBreak:  { light: '#a5b4fc', dark: '#4338ca' },
}

export function App() {
  const timer = usePomodoro()
  const { phase, status, start, pause, resume, reset, skip } = timer

  // Initialise theme from localStorage, falling back to the OS preference.
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync the `dark` class on <html> and persist the preference whenever it changes.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when the user is typing in an input field.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (status === 'running') pause()
        else if (status === 'paused') resume()
        else start()
      } else if (e.key === 'r' || e.key === 'R') {
        reset()
      } else if (e.key === 's' || e.key === 'S') {
        skip()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [status, start, pause, resume, reset, skip])

  // Pick the correct colour tokens for the current phase and theme.
  const bg = isDark ? BG[phase].dark : BG[phase].light
  const blob = isDark ? BLOB[phase].dark : BLOB[phase].light

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: bg, transition: 'background-color 0.8s ease' }}
    >
      {/* Decorative gradient blob */}
      <div
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${blob}55, transparent)`,
          transition: 'background 0.8s ease',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} phase={phase} />
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <TimerCard {...timer} isDark={isDark} />
        </main>
        <Footer />
      </div>
    </div>
  )
}
