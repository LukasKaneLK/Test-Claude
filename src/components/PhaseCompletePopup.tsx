/**
 * PhaseCompletePopup.tsx
 * Full-screen overlay shown when a Pomodoro phase ends.
 * - Focus ended  → prompt to rest
 * - Break ended  → prompt to focus
 */
import { useEffect, useRef, useState } from 'react'
import { Coffee, Zap, X } from 'lucide-react'
import popupSoundUrl from '@/assets/Popup_open.wav'

export type PopupKind = 'rest' | 'focus'

interface PhaseCompletePopupProps {
  kind: PopupKind
  onClose: () => void
}

const KEYFRAMES = `
  @keyframes popup-float {
    0%, 100% { transform: translateY(0px) rotate(-4deg); }
    50%       { transform: translateY(-8px) rotate(4deg); }
  }
  @keyframes popup-zap {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    20%       { transform: scale(1.25) rotate(-8deg); filter: brightness(1.6); }
    40%       { transform: scale(0.95) rotate(6deg); filter: brightness(1); }
    60%       { transform: scale(1.15) rotate(-4deg); filter: brightness(1.4); }
  }
`

const ICON_STYLE: Record<PopupKind, React.CSSProperties> = {
  rest:  { animation: 'popup-float 2.8s ease-in-out infinite' },
  focus: { animation: 'popup-zap 1.4s ease-in-out infinite' },
}

const CONFIG = {
  rest: {
    Icon: Coffee,
    title: 'Time to rest!',
    body: "Great work! Step away from the screen, stretch, and recharge. Your break has begun.",
    bg: 'bg-teal-50 dark:bg-teal-950',
    border: 'border-teal-200 dark:border-teal-800',
    btnClass: 'bg-teal-500 hover:bg-teal-600 text-white',
    iconBg: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300',
  },
  focus: {
    Icon: Zap,
    title: 'Time to focus!',
    body: "Break's over. Clear your mind, pick your next task, and dive back in. You've got this.",
    bg: 'bg-rose-50 dark:bg-rose-950',
    border: 'border-rose-200 dark:border-rose-800',
    btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
    iconBg: 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300',
  },
}

export function PhaseCompletePopup({ kind, onClose }: PhaseCompletePopupProps) {
  const [visible, setVisible] = useState(false)
  const soundRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trigger enter animation on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // After 1 minute, play reminder sound every 30 seconds until closed.
  useEffect(() => {
    soundRef.current = new Audio(popupSoundUrl)

    const play = () => {
      if (!soundRef.current) return
      soundRef.current.currentTime = 0
      soundRef.current.play().catch(() => undefined)
    }

    delayRef.current = setTimeout(() => {
      play()
      intervalRef.current = setInterval(play, 30_000)
    }, 60_000)

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const close = () => {
    if (delayRef.current) clearTimeout(delayRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const { Icon, title, body, bg, border, btnClass, iconBg } = CONFIG[kind]

  return (
    <>
    <style>{KEYFRAMES}</style>
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={close}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          'relative w-full max-w-sm rounded-3xl border p-8 shadow-2xl',
          'transition-all duration-300',
          bg, border,
          visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8',
        ].join(' ')}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-4 top-4 rounded-full p-1.5 opacity-40 transition-all hover:bg-black/10 hover:opacity-70 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className={`mb-5 inline-flex rounded-2xl p-4 ${iconBg}`}>
          <Icon className="h-8 w-8" style={ICON_STYLE[kind]} />
        </div>

        {/* Text */}
        <h2 className="mb-2 text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed opacity-60">{body}</p>

        {/* CTA */}
        <button
          onClick={close}
          className={[
            'mt-6 w-full rounded-2xl py-3 text-sm font-semibold shadow-lg',
            'transition-all duration-150 active:scale-95',
            btnClass,
          ].join(' ')}
        >
          Got it
        </button>

      </div>
    </div>
    </>
  )
}
