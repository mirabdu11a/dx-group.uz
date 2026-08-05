/**
 * Reads one language out of an API row that carries them all.
 *
 * Falls back to Russian, which the admin always fills in — an untranslated
 * Uzbek field renders Russian text rather than a blank card.
 */
export function pickLocale(obj, language, field) {
  if (!obj) return ''
  return obj[`${field}_${language}`] || obj[`${field}_ru`] || ''
}
