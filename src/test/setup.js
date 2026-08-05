import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Modern Node exposes its own experimental `localStorage` global, and it
// shadows jsdom's working implementation (Vitest's environment bridge skips
// re-copying keys that already exist on globalThis). Without a
// `--localstorage-file`, Node's version silently resolves to `undefined`,
// which breaks every test that reads or writes localStorage. Re-point
// `window.localStorage` at jsdom's real Storage instance, which Vitest
// exposes on `window.jsdom.window`.
if (typeof window !== 'undefined' && window.jsdom?.window?.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    get: () => window.jsdom.window.localStorage,
    configurable: true,
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
