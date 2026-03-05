/**
 * Header.tsx
 * Top navigation bar displaying the app title, the current timer phase badge,
 * and a light/dark theme toggle button.
 */
import { CircleHelp, Moon, Settings, Sun, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Phase } from '@/features/pomodoro/engine/types'
import { useLanguage } from '@/i18n/LanguageContext'

/** Tailwind colour classes for the coloured dot inside the phase badge. */
const PHASE_DOT: Record<Phase, string> = {
  focus: 'bg-rose-500',
  shortBreak: 'bg-teal-500',
  longBreak: 'bg-indigo-500',
}

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  phase: Phase
  onOpenTutorial: () => void
  onOpenSettings: () => void
}

export function Header({ isDark, onToggleTheme, phase, onOpenTutorial, onOpenSettings }: HeaderProps) {
  const { t } = useLanguage()

  const PHASE_LABEL: Record<Phase, string> = {
    focus: t.phaseFocus,
    shortBreak: t.phaseShortBreak,
    longBreak: t.phaseLongBreak,
  }

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-current opacity-70" />
        <span className="text-lg font-semibold tracking-tight opacity-80">Pomodoro</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 dark:bg-white/10">
        <span className={`h-2 w-2 rounded-full ${PHASE_DOT[phase]}`} />
        <span className="text-xs font-medium opacity-70">{PHASE_LABEL[phase]}</span>
      </div>

      <div className="flex items-center gap-1">
      <Tooltip text={t.tooltipSettings} position="bottom">
        <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label={t.tooltipSettings} className="opacity-50 hover:opacity-100">
          <Settings className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip text={t.tooltipTutorial} position="bottom">
        <Button variant="ghost" size="icon" onClick={onOpenTutorial} aria-label={t.tooltipTutorial} className="opacity-50 hover:opacity-100">
          <CircleHelp className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip text={isDark ? t.tooltipLightMode : t.tooltipDarkMode} position="bottom">
        <Button
          data-tutorial="theme-toggle"
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={isDark ? t.tooltipLightMode : t.tooltipDarkMode}
          className="opacity-70 hover:opacity-100"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </Tooltip>
      </div>
    </header>
  )
}
