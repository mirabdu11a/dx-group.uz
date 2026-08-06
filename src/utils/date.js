/**
 * Converts an API ISO date (`yyyy-mm-dd`) into the local `dd.mm.yyyy` form
 * shown across the site. A missing value (the field isn't documented as
 * required everywhere it's used) renders blank rather than throwing on
 * `.split('-')` of undefined.
 */
export function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}
