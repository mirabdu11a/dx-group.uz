import { describe, it, expect } from 'vitest'
import { formatDate } from './date'

describe('formatDate', () => {
  it('converts an ISO date to dd.mm.yyyy', () => {
    expect(formatDate('2025-09-01')).toBe('01.09.2025')
  })

  it('returns an empty string for a missing value', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })
})
