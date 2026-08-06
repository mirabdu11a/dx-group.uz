import { describe, it, expect } from 'vitest'
import ru from './ru'
import uz from './uz'

// Recurses into arrays by index (rather than treating them as opaque
// leaves), so a path like `advantages.items.0.title` is part of the
// compared key set. This is what lets the "same keys" test below catch an
// array-shape regression: if one locale's `items` becomes a string, or an
// item is missing a field, or the arrays differ in length, the two key
// sets stop matching.
function keyPaths(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}.${index}`))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) =>
      keyPaths(v, prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

// Walks both locales in lockstep and asserts, at every path, that
// array-ness and array length match before recursing further. `keyPaths`
// above already catches this indirectly (a shape mismatch changes the key
// set), but a direct structural walk gives a much more specific failure
// message — "advantages.items: array length differs (uz=2, ru=3)" instead
// of a diff of two long sorted key lists.
function assertSameShape(uzValue, ruValue, path) {
  const uzIsArray = Array.isArray(uzValue)
  const ruIsArray = Array.isArray(ruValue)
  expect(uzIsArray, `${path}: array-ness differs (uz=${uzIsArray}, ru=${ruIsArray})`).toBe(
    ruIsArray,
  )

  if (uzIsArray) {
    expect(uzValue.length, `${path}: array length differs (uz=${uzValue.length}, ru=${ruValue.length})`).toBe(
      ruValue.length,
    )
    uzValue.forEach((item, index) => assertSameShape(item, ruValue[index], `${path}.${index}`))
    return
  }

  if (uzValue && typeof uzValue === 'object') {
    expect(Object.keys(uzValue).sort(), `${path}: object keys differ`).toEqual(
      Object.keys(ruValue).sort(),
    )
    for (const key of Object.keys(uzValue)) {
      assertSameShape(uzValue[key], ruValue[key], `${path}.${key}`)
    }
  }
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

  // Added beyond the brief: the two tests above treated arrays as opaque
  // leaves, so they verified a key like `advantages.items` exists but not
  // its type, arity or per-item fields. `Premushestva` and `Feadbacks` both
  // do `t('…items', { returnObjects: true }).map(…)` — if a locale edit
  // ever turns that value into a string, `.map is not a function` throws
  // during render with no error boundary, blanking the whole SPA.
  it('match array shape and per-item fields between locales', () => {
    assertSameShape(uz, ru, 'root')
  })
})
