import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import Header from './Header'
import SectionAbout from './SectionAbout'
import Premushestva from './Premushestva'
import Partners from './Partners'
import Feadbacks from './Feadbacks'
import AoutBody from './AoutBody'
import '../i18n'

// AoutBody's mount-visibility counter animation depends on
// IntersectionObserver, which jsdom does not implement.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Added beyond the brief: none of these six components — every one of them
// driven entirely by `t()`, two (Premushestva, Feadbacks) via
// `returnObjects: true` array lookups — had ever been rendered in a test,
// in either language. There is no error boundary anywhere in this app, so
// a locale edit that broke one of them (e.g. the array-shape regression
// locales.test.js now guards against) would blank the entire SPA on both
// `/` and `/about` with nothing catching it. This renders each in both
// languages and asserts only that it produces output without throwing.
const COMPONENTS = [
  ['Header', Header],
  ['SectionAbout', SectionAbout],
  ['Premushestva', Premushestva],
  ['Partners', Partners],
  ['Feadbacks', Feadbacks],
  ['AoutBody', AoutBody],
]

describe('components driven entirely by t()', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  for (const [name, Component] of COMPONENTS) {
    for (const lang of ['ru', 'uz']) {
      it(`renders ${name} in ${lang} without throwing`, () => {
        window.localStorage.setItem('dx-lang', lang)

        const { container } = render(
          <MemoryRouter>
            <LanguageProvider>
              <Component />
            </LanguageProvider>
          </MemoryRouter>,
        )

        expect(container).not.toBeEmptyDOMElement()
      })
    }
  }
})
