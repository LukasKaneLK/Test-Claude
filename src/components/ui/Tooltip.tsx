/**
 * Tooltip.tsx
 * Hover tooltip rendered via portal to document.body so it escapes
 * any ancestor overflow, transform, or backdrop-filter stacking context.
 */
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'

interface TooltipProps {
  text: string
  children: ReactElement
  position?: 'top' | 'bottom'
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const show = () => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({
      x: r.left + r.width / 2,
      y: position === 'top' ? r.top : r.bottom,
    })
  }

  return (
    <span ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      {children}
      {pos && createPortal(
        <span
          role="tooltip"
          style={{
            position: 'fixed',
            left: pos.x,
            top: position === 'top' ? pos.y - 8 : pos.y + 8,
            transform: position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-lg bg-gray-900/90 text-white dark:bg-white/95 dark:text-gray-900"
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  )
}
