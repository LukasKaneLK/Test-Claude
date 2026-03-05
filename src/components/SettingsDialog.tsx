/**
 * SettingsDialog.tsx
 * Modal dialog for configuring phase durations, session count, and language.
 */
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DEFAULT_CONFIG } from '@/features/pomodoro/engine/types'
import type { Config } from '@/features/pomodoro/engine/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/translations'
import GB from 'country-flag-icons/react/3x2/GB'
import DE from 'country-flag-icons/react/3x2/DE'
import UA from 'country-flag-icons/react/3x2/UA'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  config: Config
  onUpdate: (config: Partial<Config>) => void
}

type DraftConfig = {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsBeforeLongBreak: number
}

const LANGUAGES: { value: Lang; Flag: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string }[] = [
  { value: 'en', Flag: GB, label: 'English' },
  { value: 'de', Flag: DE, label: 'Deutsch' },
  { value: 'uk', Flag: UA, label: 'Українська' },
]

export function SettingsDialog({ open, onClose, config, onUpdate }: SettingsDialogProps) {
  const { t, lang, setLang } = useLanguage()

  const FIELDS: {
    label: string
    key: keyof DraftConfig
    min: number
    max: number
  }[] = [
    { label: t.fieldFocus, key: 'focusMinutes', min: 1, max: 90 },
    { label: t.fieldShortBreak, key: 'shortBreakMinutes', min: 1, max: 30 },
    { label: t.fieldLongBreak, key: 'longBreakMinutes', min: 1, max: 60 },
    { label: t.fieldSessions, key: 'sessionsBeforeLongBreak', min: 1, max: 8 },
  ]

  const [draft, setDraft] = useState<DraftConfig>(() => ({
    focusMinutes: config.focusMinutes,
    shortBreakMinutes: config.shortBreakMinutes,
    longBreakMinutes: config.longBreakMinutes,
    sessionsBeforeLongBreak: config.sessionsBeforeLongBreak,
  }))

  // Reset draft to current config when dialog opens.
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDraft({
        focusMinutes: config.focusMinutes,
        shortBreakMinutes: config.shortBreakMinutes,
        longBreakMinutes: config.longBreakMinutes,
        sessionsBeforeLongBreak: config.sessionsBeforeLongBreak,
      })
    } else {
      onClose()
    }
  }

  const handleSave = () => {
    onUpdate(draft)
    onClose()
  }

  const handleReset = () => {
    const defaults: DraftConfig = {
      focusMinutes: DEFAULT_CONFIG.focusMinutes,
      shortBreakMinutes: DEFAULT_CONFIG.shortBreakMinutes,
      longBreakMinutes: DEFAULT_CONFIG.longBreakMinutes,
      sessionsBeforeLongBreak: DEFAULT_CONFIG.sessionsBeforeLongBreak,
    }
    setDraft(defaults)
    onUpdate(defaults)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.timerSettings}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {FIELDS.map(({ label, key, min, max }) => (
            <div key={key} className="grid grid-cols-2 items-center gap-4">
              <label htmlFor={key} className="text-sm font-medium leading-none">
                {label}
              </label>
              <input
                id={key}
                type="number"
                min={min}
                max={max}
                value={draft[key]}
                onChange={(e) => {
                  const val = Math.min(max, Math.max(min, Number(e.target.value)))
                  setDraft((d) => ({ ...d, [key]: val }))
                }}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          ))}

          {/* Language selector */}
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="text-sm font-medium leading-none">{t.language}</span>
            <div className="flex gap-2">
              {LANGUAGES.map(({ value, Flag, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLang(value)}
                  aria-label={label}
                  title={label}
                  className={[
                    'overflow-hidden rounded border transition-all',
                    lang === value
                      ? 'ring-2 ring-ring opacity-100'
                      : 'opacity-40 hover:opacity-70',
                  ].join(' ')}
                >
                  <Flag className="h-6 w-9 block" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            {t.btnResetDefaults}
          </Button>
          <Button onClick={handleSave}>{t.btnSave}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
