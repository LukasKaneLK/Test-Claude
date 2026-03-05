/**
 * Footer.tsx
 * Persistent footer that surfaces the available keyboard shortcuts to the user.
 * Pure presentational component — no props, no state.
 */
import { useLanguage } from '@/i18n/LanguageContext'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="px-6 py-4 text-center text-xs opacity-40 space-y-1.5">
      <div>
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>
        {' '}{t.footerStart}
        {' · '}
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">R</kbd>
        {' '}{t.footerReset}
        {' · '}
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">S</kbd>
        {' '}{t.footerSkip}
      </div>
      <div>
        {t.footerCredit} &nbsp;·&nbsp; &copy; {new Date().getFullYear()} Andrii Khudiashov
      </div>
    </footer>
  )
}
