import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsDialog } from './SettingsDialog'
import { DEFAULT_CONFIG } from '@/features/pomodoro/engine/types'
import type { Config } from '@/features/pomodoro/engine/types'
import { LanguageProvider } from '@/i18n/LanguageContext'

const baseConfig: Config = { ...DEFAULT_CONFIG }

function renderDialog(props?: Partial<React.ComponentProps<typeof SettingsDialog>>) {
  const onClose = vi.fn()
  const onUpdate = vi.fn()
  render(
    <LanguageProvider>
      <SettingsDialog
        open={true}
        onClose={onClose}
        config={baseConfig}
        onUpdate={onUpdate}
        {...props}
      />
    </LanguageProvider>
  )
  return { onClose, onUpdate }
}

describe('SettingsDialog', () => {
  it('renders all four inputs with current config values', () => {
    renderDialog()
    expect(screen.getByLabelText(/focus \(minutes\)/i)).toHaveValue(DEFAULT_CONFIG.focusMinutes)
    expect(screen.getByLabelText(/short break \(minutes\)/i)).toHaveValue(DEFAULT_CONFIG.shortBreakMinutes)
    expect(screen.getByLabelText(/long break \(minutes\)/i)).toHaveValue(DEFAULT_CONFIG.longBreakMinutes)
    expect(screen.getByLabelText(/sessions before long break/i)).toHaveValue(
      DEFAULT_CONFIG.sessionsBeforeLongBreak
    )
  })

  it('calls onUpdate and onClose with new values on Save', async () => {
    const user = userEvent.setup()
    const { onUpdate, onClose } = renderDialog()

    fireEvent.change(screen.getByLabelText(/focus \(minutes\)/i), { target: { value: '30' } })

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ focusMinutes: 30 })
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onUpdate with DEFAULT_CONFIG values and onClose on Reset', async () => {
    const user = userEvent.setup()
    const customConfig: Config = { ...DEFAULT_CONFIG, focusMinutes: 45, shortBreakMinutes: 10 }
    const { onUpdate, onClose } = renderDialog({ config: customConfig })

    await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        focusMinutes: DEFAULT_CONFIG.focusMinutes,
        shortBreakMinutes: DEFAULT_CONFIG.shortBreakMinutes,
        longBreakMinutes: DEFAULT_CONFIG.longBreakMinutes,
        sessionsBeforeLongBreak: DEFAULT_CONFIG.sessionsBeforeLongBreak,
      })
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render when open=false', () => {
    renderDialog({ open: false })
    expect(screen.queryByLabelText(/focus/i)).toBeNull()
  })
})
