/**
 * TutorialOverlay.tsx
 * Step-by-step guided tour. Spotlights key UI elements one at a time,
 * with a description card and next/back/skip controls.
 * Uses data-tutorial="<key>" attributes on DOM elements to locate targets.
 */
import { useCallback, useEffect, useState } from 'react'

interface Step {
  selector: string
  title: string
  body: string
  pad?: number
}

const STEPS: Step[] = [
  {
    selector: '[data-tutorial="task-column"]',
    title: 'Plan your tasks',
    body: 'This is your task list. Add tasks here for everything you need to get done today.',
    pad: 12,
  },
  {
    selector: '[data-tutorial="add-task"]',
    title: 'Add a new task',
    body: 'Click this button to create a task. Type anything you want to focus on — then drag it to the timer.',
    pad: 8,
  },
  {
    selector: '[data-tutorial="timer-card"]',
    title: 'The Pomodoro timer',
    body: "Drag a task from either column and drop it here to add it to your focus queue. The timer won't start until you have a task ready.",
    pad: 16,
  },
  {
    selector: '[data-tutorial="timer-start"]',
    title: 'Start your session',
    body: 'Once a task is in the queue, press Start to begin a 25-minute focus block. You can also hit Space on your keyboard.',
    pad: 8,
  },
  {
    selector: '[data-tutorial="session-dots"]',
    title: 'Session progress',
    body: 'Each dot represents one focus session. Complete 4 in a row to earn a long break. The cycle then resets automatically.',
    pad: 10,
  },
  {
    selector: '[data-tutorial="music-controls"]',
    title: 'Background music',
    body: 'Press + to add your own audio files to the playlist. Focus music plays during work sessions; calming rain sounds play automatically during breaks.',
    pad: 8,
  },
  {
    selector: '[data-tutorial="mute-toggle"]',
    title: 'Sound effects',
    body: 'Toggle notification sounds on or off — this controls button clicks and phase-end alerts, not the background music.',
    pad: 6,
  },
  {
    selector: '[data-tutorial="theme-toggle"]',
    title: 'Light & dark mode',
    body: 'Switch between light and dark themes here. Your preference is saved automatically so it persists across sessions.',
    pad: 10,
  },
]

interface Rect { x: number; y: number; w: number; h: number }

interface TutorialOverlayProps {
  onDone: () => void
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  // Keep isDark in sync if the user toggles theme during the tutorial.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const measure = useCallback((index: number): Rect | null => {
    const { selector, pad = 8 } = STEPS[index]
    const el = document.querySelector(selector)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }
  }, [])

  useEffect(() => {
    setRect(measure(step))
  }, [step, measure])

  const goTo = (index: number) => {
    if (index < 0 || index >= STEPS.length) { onDone(); return }
    setStep(index)
  }

  const current = STEPS[step]

  // Spotlight shadow — brighter ring + stronger glow in dark mode.
  const spotlightShadow = isDark
    ? '0 0 0 9999px rgba(0,0,0,0.82), 0 0 0 3px rgba(255,255,255,1), 0 0 28px 8px rgba(255,255,255,0.55), 0 0 60px 16px rgba(255,255,255,0.20)'
    : '0 0 0 9999px rgba(0,0,0,0.75), 0 0 0 3px rgba(255,255,255,0.95), 0 0 20px 6px rgba(255,255,255,0.40)'

  // Position the info card above or below the spotlight.
  const below = !rect || rect.y + rect.h / 2 < window.innerHeight / 2
  const cardLeft = rect
    ? Math.min(Math.max(rect.x + rect.w / 2 - 160, 12), window.innerWidth - 332)
    : window.innerWidth / 2 - 160

  const cardStyle: React.CSSProperties = rect
    ? below
      ? { top: rect.y + rect.h + 12, left: cardLeft }
      : { bottom: window.innerHeight - rect.y + 12, left: cardLeft }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <div className="fixed inset-0" style={{ zIndex: 200 }}>
      {/* Dark backdrop — clicking it advances to next step */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ zIndex: 201 }}
        onClick={() => goTo(step + 1)}
      />

      {/* Spotlight cutout using box-shadow trick */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            borderRadius: 14,
            boxShadow: spotlightShadow,
            zIndex: 202,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Info card */}
      <div
        className="fixed w-80 rounded-2xl bg-gray-900 p-5 shadow-2xl"
        style={{ ...cardStyle, zIndex: 203 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Step pip indicators */}
        <div className="mb-4 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-5 bg-white' : 'w-1.5 bg-white/25',
              ].join(' ')}
            />
          ))}
        </div>

        <h3 className="mb-1.5 text-sm font-semibold text-white">{current.title}</h3>
        <p className="text-xs leading-relaxed text-white/65">{current.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={onDone}
            className="text-xs text-white/35 transition-colors hover:text-white/60"
          >
            Skip tutorial
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                Back
              </button>
            )}
            <button
              onClick={() => goTo(step + 1)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-white/90"
            >
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
