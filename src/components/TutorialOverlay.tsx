/**
 * TutorialOverlay.tsx
 * Step-by-step guided tour. Spotlights key UI elements one at a time,
 * with a description card and next/back/skip controls.
 * Uses data-tutorial="<key>" attributes on DOM elements to locate targets.
 */
import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Translations } from '@/i18n/translations'

interface Step {
  selector: string
  titleKey: keyof Translations
  bodyKey: keyof Translations
  pad?: number
}

const STEPS: Step[] = [
  { selector: '[data-tutorial="task-column"]',   titleKey: 'tutorial1Title', bodyKey: 'tutorial1Body', pad: 12 },
  { selector: '[data-tutorial="add-task"]',       titleKey: 'tutorial2Title', bodyKey: 'tutorial2Body', pad: 8  },
  { selector: '[data-tutorial="timer-card"]',     titleKey: 'tutorial3Title', bodyKey: 'tutorial3Body', pad: 16 },
  { selector: '[data-tutorial="timer-start"]',    titleKey: 'tutorial4Title', bodyKey: 'tutorial4Body', pad: 8  },
  { selector: '[data-tutorial="session-dots"]',   titleKey: 'tutorial5Title', bodyKey: 'tutorial5Body', pad: 10 },
  { selector: '[data-tutorial="music-controls"]', titleKey: 'tutorial6Title', bodyKey: 'tutorial6Body', pad: 8  },
  { selector: '[data-tutorial="mute-toggle"]',    titleKey: 'tutorial7Title', bodyKey: 'tutorial7Body', pad: 6  },
  { selector: '[data-tutorial="theme-toggle"]',   titleKey: 'tutorial8Title', bodyKey: 'tutorial8Body', pad: 10 },
]

interface Rect { x: number; y: number; w: number; h: number }

interface TutorialOverlayProps {
  onDone: () => void
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

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

  useEffect(() => { setRect(measure(step)) }, [step, measure])

  const goTo = (index: number) => {
    if (index < 0 || index >= STEPS.length) { onDone(); return }
    setStep(index)
  }

  const current = STEPS[step]

  const spotlightShadow = isDark
    ? '0 0 0 9999px rgba(0,0,0,0.82), 0 0 0 3px rgba(255,255,255,1), 0 0 28px 8px rgba(255,255,255,0.55), 0 0 60px 16px rgba(255,255,255,0.20)'
    : '0 0 0 9999px rgba(0,0,0,0.75), 0 0 0 3px rgba(255,255,255,0.95), 0 0 20px 6px rgba(255,255,255,0.40)'

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
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 201 }} onClick={() => goTo(step + 1)} />

      {rect && (
        <div style={{ position: 'fixed', left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 14, boxShadow: spotlightShadow, zIndex: 202, pointerEvents: 'none' }} />
      )}

      <div className="fixed w-80 rounded-2xl bg-gray-900 p-5 shadow-2xl" style={{ ...cardStyle, zIndex: 203 }} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span key={i} className={['h-1.5 rounded-full transition-all duration-300', i === step ? 'w-5 bg-white' : 'w-1.5 bg-white/25'].join(' ')} />
          ))}
        </div>

        <h3 className="mb-1.5 text-sm font-semibold text-white">{t[current.titleKey] as string}</h3>
        <p className="text-xs leading-relaxed text-white/65">{t[current.bodyKey] as string}</p>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={onDone} className="text-xs text-white/35 transition-colors hover:text-white/60">
            {t.skipTutorial}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20">
                {t.back}
              </button>
            )}
            <button onClick={() => goTo(step + 1)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-white/90">
              {step === STEPS.length - 1 ? t.finish : t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
