import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Copy, type Lang } from './i18n'

interface LanguageContextValue {
  language: Lang
  t: Copy
  setLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'axio-lang'

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'th') return stored
  } catch {
    /* ignore */
  }
  return 'th'
}

function applyDocumentLang(lang: Lang) {
  const t = translations[lang]
  document.documentElement.lang = lang
  document.title = `${t.appTitle} · AXONS`
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', t.pageDescription)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(readLang)

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
    applyDocumentLang(language)
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: translations[language],
      setLanguage,
    }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
