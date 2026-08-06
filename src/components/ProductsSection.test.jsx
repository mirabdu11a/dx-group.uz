import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import ProductsSection from './ProductsSection'
import * as endpoints from '../api/endpoints'
import '../i18n'

const CATEGORIES = [
  { id: 1, name_ru: 'Крупнощитовая опалубка', name_uz: 'Yirik qalqonli opalubka', image: 'http://api/media/categories/a.png', order: 1 },
  { id: 2, name_ru: 'Комплектующие', name_uz: 'Butlovchi qismlar', image: null, order: 2 },
]

function renderSection() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <ProductsSection />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('ProductsSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders a card per category', async () => {
    vi.spyOn(endpoints, 'fetchCategories').mockResolvedValue(CATEGORIES)

    renderSection()

    expect(await screen.findByText('Крупнощитовая опалубка')).toBeInTheDocument()
    expect(screen.getByText('Комплектующие')).toBeInTheDocument()

    // Strengthened: the fixture deliberately gives the second category a
    // null image to exercise the conditional `{image && <img .../>}`
    // branch, but the brief's assertions above never look at the <img>
    // elements at all — they would still pass if the image were dropped
    // entirely or rendered unconditionally with a broken src. Pin down
    // both: exactly one <img> exists (only the category that has one),
    // and it resolves through mediaUrl with the localized alt text.
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'http://api/media/categories/a.png')
    expect(images[0]).toHaveAttribute('alt', 'Крупнощитовая опалубка')
  })

  it('links each card to its filtered catalogue', async () => {
    vi.spyOn(endpoints, 'fetchCategories').mockResolvedValue(CATEGORIES)

    renderSection()

    const link = await screen.findByRole('link', { name: /Крупнощитовая опалубка/ })
    expect(link).toHaveAttribute('href', '/products?category=1')
  })

  it('shows skeletons while loading', () => {
    vi.spyOn(endpoints, 'fetchCategories').mockReturnValue(new Promise(() => {}))

    renderSection()

    expect(screen.getAllByTestId('category-skeleton')).toHaveLength(6)
  })

  it('shows an error message when the request fails', async () => {
    vi.spyOn(endpoints, 'fetchCategories').mockRejectedValue(new Error('boom'))

    renderSection()

    expect(
      await screen.findByText('Не удалось загрузить данные. Попробуйте позже.'),
    ).toBeInTheDocument()
  })

  it('shows the empty message when there are no categories', async () => {
    vi.spyOn(endpoints, 'fetchCategories').mockResolvedValue([])

    renderSection()

    expect(await screen.findByText('Данных пока нет.')).toBeInTheDocument()
  })

  it('renders Uzbek names when the language is Uzbek', async () => {
    window.localStorage.setItem('dx-lang', 'uz')
    vi.spyOn(endpoints, 'fetchCategories').mockResolvedValue(CATEGORIES)

    renderSection()

    expect(await screen.findByText('Yirik qalqonli opalubka')).toBeInTheDocument()

    // Strengthened: the title says "names" (plural) and the fixture
    // supplies two categories, but the brief only ever checked the first
    // one — a bug that translated just the first card (or that left
    // pickLocale hardcoded to a single field) would still pass. Check the
    // second category's Uzbek name too, and that neither Russian name
    // leaked through, mirroring the same strengthening already applied to
    // the Navbar language-switch test.
    expect(await screen.findByText('Butlovchi qismlar')).toBeInTheDocument()
    expect(screen.queryByText('Крупнощитовая опалубка')).not.toBeInTheDocument()
    expect(screen.queryByText('Комплектующие')).not.toBeInTheDocument()
  })
})
