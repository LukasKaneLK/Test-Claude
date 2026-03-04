/**
 * SettingsDialog.tsx
 * Modal dialog for configuring phase durations and session count.
 */
import { useState } from 'react'
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

const FIELDS: {
  label: string
  key: keyof DraftConfig
  min: number
  max: number
}[] = [
  { label: 'Focus (minutes)', key: 'focusMinutes', min: 1, max: 90 },
  { label: 'Short break (minutes)', key: 'shortBreakMinutes', min: 1, max: 30 },
  { label: 'Long break (minutes)', key: 'longBreakMinutes', min: 1, max: 60 },
  { label: 'Sessions before long break', key: 'sessionsBeforeLongBreak', min: 1, max: 8 },
]

export function SettingsDialog({ open, onClose, config, onUpdate }: SettingsDialogProps) {
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
          <DialogTitle>Timer settings</DialogTitle>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to defaults
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
