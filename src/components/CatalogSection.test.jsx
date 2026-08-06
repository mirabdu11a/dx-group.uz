import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import CatalogSection from './CatalogSection'
import * as endpoints from '../api/endpoints'
import '../i18n'

const CATEGORIES = [
  { id: 1, name_ru: 'Опалубка', name_uz: 'Opalubka', image: null, order: 1 },
  { id: 2, name_ru: 'Комплектующие', name_uz: 'Butlovchi qismlar', image: null, order: 2 },
]

const page = (results, next = null) => ({ count: results.length, next, previous: null, results })

const PRODUCT = {
  id: 10,
  category: 1,
  code: 'BEAM-H20',
  name_ru: 'Балка BEAM H20',
  name_uz: 'BEAM H20 balkasi',
  tizer_ru: 'Двутавровая балка',
  tizer_uz: 'Ikki tavrli balka',
  image: 'http://api/media/products/a.png',
  order: 1,
}

// Exposes the router's current search string so tests can assert the
// filter is genuinely reflected in the URL, not just in local state.
function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location-search">{location.search}</div>
}

// Stands in for the browser's back button: react-router's `navigate(-1)`
// pops the same history stack a real back button would.
function BackButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      back
    </button>
  )
}

function renderCatalog(initialEntry = '/products') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <LocationProbe />
        <BackButton />
        <CatalogSection />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('CatalogSection', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(endpoints, 'fetchCategories').mockResolvedValue(CATEGORIES)
  })

  it('lists categories as filter buttons plus an "all" button', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(page([PRODUCT]))

    renderCatalog()

    expect(await screen.findByRole('button', { name: 'Все' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Опалубка' })).toBeInTheDocument()
    // Strengthened: the brief only ever checked the first category, so a
    // bug that rendered just one filter button (e.g. `.slice(0, 1)`, or an
    // off-by-one in the list) would still pass. Check the second category
    // too, mirroring the same strengthening already applied elsewhere in
    // this codebase (ProductsSection.test.jsx).
    expect(screen.getByRole('button', { name: 'Комплектующие' })).toBeInTheDocument()
  })

  it('renders the product cards', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(page([PRODUCT]))

    renderCatalog()

    expect(await screen.findByText('Балка BEAM H20')).toBeInTheDocument()
    expect(screen.getByText('Двутавровая балка')).toBeInTheDocument()
  })

  it('applies the category from the URL on first load', async () => {
    const fetchProducts = vi
      .spyOn(endpoints, 'fetchProducts')
      .mockResolvedValue(page([PRODUCT]))

    renderCatalog('/products?category=2')

    await waitFor(() =>
      expect(fetchProducts).toHaveBeenCalledWith({ category: 2 }),
    )
  })

  it('re-requests when another category is clicked, replacing the previous items', async () => {
    const fetchProducts = vi
      .spyOn(endpoints, 'fetchProducts')
      .mockImplementation(({ category } = {}) =>
        Promise.resolve(
          category === 2
            ? page([{ ...PRODUCT, id: 20, category: 2, name_ru: 'Крепёж' }])
            : page([PRODUCT]),
        ),
      )

    renderCatalog()

    await screen.findByText('Балка BEAM H20')

    await userEvent.click(await screen.findByRole('button', { name: 'Комплектующие' }))

    await waitFor(() =>
      expect(fetchProducts).toHaveBeenLastCalledWith({ category: 2 }),
    )
    expect(await screen.findByText('Крепёж')).toBeInTheDocument()
    // Strengthened: the brief only checked the call args passed to
    // fetchProducts, which would still pass if the previous category's
    // items were left on screen (appended to rather than replaced by the
    // new list). Confirm the old item is actually gone.
    expect(screen.queryByText('Балка BEAM H20')).not.toBeInTheDocument()
  })

  it('appends the next page when "show more" is clicked', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(
      page([PRODUCT], 'http://api/api/product/?page=2'),
    )
    const fetchUrl = vi.spyOn(endpoints, 'fetchUrl').mockResolvedValue(
      page([{ ...PRODUCT, id: 11, name_ru: 'Замок' }]),
    )

    renderCatalog()

    await userEvent.click(await screen.findByRole('button', { name: 'Показать ещё' }))

    expect(fetchUrl).toHaveBeenCalledWith('http://api/api/product/?page=2')
    expect(await screen.findByText('Замок')).toBeInTheDocument()
    expect(screen.getByText('Балка BEAM H20')).toBeInTheDocument()
  })

  it('hides "show more" on the last page', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(page([PRODUCT]))

    renderCatalog()

    await screen.findByText('Балка BEAM H20')
    expect(screen.queryByRole('button', { name: 'Показать ещё' })).toBeNull()
  })

  it('shows the empty message for a category with no products', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(page([]))

    renderCatalog()

    expect(
      await screen.findByText('В этой категории пока нет продукции.'),
    ).toBeInTheDocument()
  })

  it('shows an error message when the products request fails', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockRejectedValue(new Error('boom'))

    renderCatalog()

    expect(
      await screen.findByText('Не удалось загрузить данные. Попробуйте позже.'),
    ).toBeInTheDocument()
  })

  // Added beyond the brief: the task brief describes this component as
  // holding manual "show more" state (items/next/loadingMore) alongside
  // useApi's own first-page fetch, guarded by a generation counter — but
  // none of the brief's own tests exercise that race. The filter buttons
  // are never disabled, so a visitor really can switch category while a
  // "show more" request for the old category is still in flight; without
  // the guard, the stale page would land on top of the new category's list.
  it('drops a stale "show more" response if the category changes before it resolves', async () => {
    const fetchProducts = vi
      .spyOn(endpoints, 'fetchProducts')
      .mockImplementation(({ category } = {}) =>
        Promise.resolve(
          category === 2
            ? page([{ ...PRODUCT, id: 20, category: 2, name_ru: 'Крепёж' }])
            : page([PRODUCT], 'http://api/api/product/?page=2'),
        ),
      )

    let resolveShowMore
    const fetchUrl = vi.spyOn(endpoints, 'fetchUrl').mockReturnValue(
      new Promise((resolve) => {
        resolveShowMore = resolve
      }),
    )

    renderCatalog()

    await userEvent.click(await screen.findByRole('button', { name: 'Показать ещё' }))
    expect(fetchUrl).toHaveBeenCalledTimes(1)

    // Switch category while the old category's "show more" request is
    // still pending.
    await userEvent.click(screen.getByRole('button', { name: 'Комплектующие' }))
    await waitFor(() =>
      expect(fetchProducts).toHaveBeenLastCalledWith({ category: 2 }),
    )
    expect(await screen.findByText('Крепёж')).toBeInTheDocument()

    // The stale page-2 response for the old category lands late. Flush the
    // microtask queue for it inside `act` so React processes any resulting
    // state update before we assert.
    await act(async () => {
      resolveShowMore(page([{ ...PRODUCT, id: 11, name_ru: 'Замок' }]))
      await new Promise((resolve) => setTimeout(resolve, 20))
    })

    expect(screen.queryByText('Замок')).not.toBeInTheDocument()
    expect(screen.queryByText('Балка BEAM H20')).not.toBeInTheDocument()
    expect(screen.getByText('Крепёж')).toBeInTheDocument()
  })

  // Added beyond the brief: Task 5 wired the home page's category cards to
  // `/products?category=<id>`, and the task's own framing calls this "a
  // category filter kept in sync with the URL" — but no test in the brief
  // checks that clicking a filter actually updates the URL (as opposed to
  // just local state), nor that the browser back button restores it.
  it('keeps the URL in sync with the selected filter, and back restores the previous one', async () => {
    vi.spyOn(endpoints, 'fetchProducts').mockResolvedValue(page([PRODUCT]))

    renderCatalog()

    await screen.findByRole('button', { name: 'Опалубка' })
    expect(screen.getByTestId('location-search').textContent).toBe('')

    await userEvent.click(screen.getByRole('button', { name: 'Комплектующие' }))
    expect(screen.getByTestId('location-search').textContent).toBe('?category=2')

    await userEvent.click(screen.getByRole('button', { name: 'back' }))
    await waitFor(() =>
      expect(screen.getByTestId('location-search').textContent).toBe(''),
    )
  })
})
