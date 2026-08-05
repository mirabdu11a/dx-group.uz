import { describe, it, expect } from 'vitest'
import ru from './ru'
import uz from './uz'

function keyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' && !Array.isArray(value)
      ? keyPaths(value, path)
      : [path]
  })
}

describe('locale files', () => {
  it('define exactly the same keys', () => {
    expect(keyPaths(uz).sort()).toEqual(keyPaths(ru).sort())
  })

  it('leave no value empty', () => {
    for (const [locale, dict] of [['ru', ru], ['uz', uz]]) {
      for (const path of keyPaths(dict)) {
        const value = path.split('.').reduce((acc, key) => acc[key], dict)
        expect(value, `${locale}.${path} is empty`).toBeTruthy()
      }
    }
  })
})
