import { describe, it, expect } from 'vitest'
import { pickLocale } from './locale'

const row = {
  name_ru: 'Опалубка',
  name_uz: 'Opalubka',
  tizer_ru: 'Кратко',
  tizer_uz: '',
}

describe('pickLocale', () => {
  it('returns the requested language', () => {
    expect(pickLocale(row, 'uz', 'name')).toBe('Opalubka')
    expect(pickLocale(row, 'ru', 'name')).toBe('Опалубка')
  })

  it('falls back to Russian when the translation is empty', () => {
    expect(pickLocale(row, 'uz', 'tizer')).toBe('Кратко')
  })

  it('falls back to Russian for an unknown language', () => {
    expect(pickLocale(row, 'en', 'name')).toBe('Опалубка')
  })

  it('returns an empty string for a missing object', () => {
    expect(pickLocale(null, 'ru', 'name')).toBe('')
    expect(pickLocale(undefined, 'ru', 'name')).toBe('')
  })

  it('returns an empty string when neither language has a value', () => {
    expect(pickLocale({ name_ru: '', name_uz: '' }, 'uz', 'name')).toBe('')
  })
})
