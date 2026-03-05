/**
 * LanguageContext.tsx
 * Provides the current language and translation strings to the entire app.
 * Defaults to English; persists the selection in localStorage.
 */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang, type Translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLang(): Lang {
  const saved = localStorage.getItem('lang')
  if (saved === 'en' || saved === 'de' || saved === 'uk') return saved
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = (next: Lang) => {
    localStorage.setItem('lang', next)
    setLangState(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
