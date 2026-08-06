import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { LanguageProvider } from '../context/LanguageContext'
import Navbar from '../components/Navbar'
import ProductsSection from '../components/ProductsSection'
import * as endpoints from '../api/endpoints'
import './index'

// The whole two-language design rests on one property: the API returns
// every language in a single response, so switching language re-reads a
// different field and never goes back to the network. Every other test in
// the suite seeds localStorage *before* rendering, which exercises
// pickLocale but never a runtime switch — so nothing would fail if someone
// added `language` to a useApi deps array. This test is that guard.
//
// Navbar owns the language <select>; ProductsSection is the component that
// fetches. Rendering both under one LanguageProvider is what lets a click
// in the first change what the second displays.

const CATEGORIES = [
  { id: 1, name_ru: 'Крупнощитовая опалубка', name_uz: 'Yirik qalqonli opalubka', image: null, order: 1 },
]

describe('switching language', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('re-reads the loaded data instead of fetching again', async () => {
    const fetchCategories = vi
      .spyOn(endpoints, 'fetchCategories')
      .mockResolvedValue(CATEGORIES)

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Navbar />
          <ProductsSection />
        </LanguageProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Крупнощитовая опалубка')).toBeInTheDocument()
    const callsAfterLoad = fetchCategories.mock.calls.length

    await userEvent.selectOptions(screen.getByRole('combobox'), 'uz')

    // The Uzbek name comes from the row already in memory…
    expect(await screen.findByText('Yirik qalqonli opalubka')).toBeInTheDocument()
    expect(screen.queryByText('Крупнощитовая опалубка')).toBeNull()

    // …and no further request was made to get it.
    expect(fetchCategories.mock.calls.length).toBe(callsAfterLoad)
  })
})
