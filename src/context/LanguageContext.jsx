import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import i18n, { DEFAULT_LANGUAGE, LANGUAGES, STORAGE_KEY, storedLanguage } from '../i18n'

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
})

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(storedLanguage)

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    // Keeps i18next's UI strings and the API-row picker on the same
    // language; document.lang matters for screen readers and for the
    // browser's own translate prompt.
    i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
