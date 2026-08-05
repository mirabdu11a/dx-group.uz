import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ru from './locales/ru'
import uz from './locales/uz'

export const STORAGE_KEY = 'dx-lang'
export const LANGUAGES = ['ru', 'uz']
export const DEFAULT_LANGUAGE = 'ru'

export function storedLanguage() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
  },
  lng: storedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

export default i18n
