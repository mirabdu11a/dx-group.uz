import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import Portfolio from './Portfolio'
import * as endpoints from '../api/endpoints'
import '../i18n'

const PROJECT = {
  id: 3,
  title_ru: 'ЖК «Навруз»',
  title_uz: "Navro'z turar-joy majmuasi",
  tizer_ru: 'Опалубка стен и перекрытий',
  tizer_uz: 'Devor va yopma opalubkasi',
  image: 'http://api/media/portfolio/a.png',
  date: '2025-09-01',
  order: 1,
}

const OTHER_PROJECT = {
  id: 5,
  title_ru: 'Завод «Кемикал»',
  title_uz: "Kemikal zavodi",
  tizer_ru: 'Промышленное строительство',
  tizer_uz: 'Sanoat qurilishi',
  image: 'http://api/media/portfolio/b.png',
  date: '2025-01-15',
  order: 2,
}

const page = (results, next = null) => ({ count: results.length, next, previous: null, results })

function renderPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Portfolio />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Portfolio list', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders a card per project', async () => {
    // Strengthened: the brief supplied only one project, so a test named
    // "a card per project" would still pass even if the component only
    // ever rendered its first item (e.g. `items[0]` instead of
    // `items.map(...)`). Render two and check both survive.
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(
      page([PROJECT, OTHER_PROJECT]),
    )

    renderPage()

    expect(await screen.findByText('ЖК «Навруз»')).toBeInTheDocument()
    expect(screen.getByText('Опалубка стен и перекрытий')).toBeInTheDocument()
    expect(screen.getByText('Завод «Кемикал»')).toBeInTheDocument()
    expect(screen.getByText('Промышленное строительство')).toBeInTheDocument()
  })

  it('shows the project date', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(page([PROJECT]))

    renderPage()

    expect(await screen.findByText('01.09.2025')).toBeInTheDocument()
  })

  it('links each card to its detail page', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(page([PROJECT]))

    renderPage()

    const link = await screen.findByRole('link', { name: /Навруз/ })
    expect(link).toHaveAttribute('href', '/portfolio/3')
  })

  it('shows skeletons while loading', () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getAllByTestId('portfolio-skeleton')).toHaveLength(6)
  })

  it('shows the empty message when there are no projects', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(page([]))

    renderPage()

    expect(
      await screen.findByText('Проекты появятся здесь совсем скоро.'),
    ).toBeInTheDocument()
  })

  it('appends the next page when "show more" is clicked', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(
      page([PROJECT], 'http://api/api/portfolio/?page=2'),
    )
    // Strengthened: the brief's version of this test never checks what URL
    // reaches fetchUrl — a bug that fed it the wrong value (or nothing)
    // would still pass as long as the mock resolved with the fixture page,
    // since mockResolvedValue answers any call regardless of arguments.
    // Assert the exact `next` cursor is what gets requested, mirroring the
    // same check already made in CatalogSection.test.jsx.
    const fetchUrl = vi.spyOn(endpoints, 'fetchUrl').mockResolvedValue(
      page([{ ...PROJECT, id: 4, title_ru: 'Завод' }]),
    )

    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Показать ещё' }))

    expect(fetchUrl).toHaveBeenCalledWith('http://api/api/portfolio/?page=2')
    expect(await screen.findByText('Завод')).toBeInTheDocument()
    expect(screen.getByText('ЖК «Навруз»')).toBeInTheDocument()
  })

  // Added beyond the brief: showMore here was `try { … } finally { … }`
  // with no `catch`, so a rejected fetchUrl became an unhandled rejection —
  // the button re-enabled and nothing else told the visitor anything
  // failed. This pins the fix: the already-loaded first page must survive
  // and an error message must appear near the button.
  it('shows an error and keeps existing items when "show more" fails', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(
      page([PROJECT], 'http://api/api/portfolio/?page=2'),
    )
    vi.spyOn(endpoints, 'fetchUrl').mockRejectedValue(new Error('boom'))

    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Показать ещё' }))

    expect(
      await screen.findByText('Не удалось загрузить данные. Попробуйте позже.'),
    ).toBeInTheDocument()
    expect(screen.getByText('ЖК «Навруз»')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Показать ещё' })).not.toBeDisabled()
  })

  // Added beyond the brief: the "show more" cursor chaining across two
  // consecutive clicks had no test exercising a second click landing on
  // top of the first.
  it('chains two sequential "show more" clicks', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(
      page([PROJECT], 'http://api/api/portfolio/?page=2'),
    )
    const fetchUrl = vi
      .spyOn(endpoints, 'fetchUrl')
      .mockResolvedValueOnce(
        page([{ ...PROJECT, id: 4, title_ru: 'Завод' }], 'http://api/api/portfolio/?page=3'),
      )
      .mockResolvedValueOnce(page([{ ...PROJECT, id: 6, title_ru: 'Склад' }]))

    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Показать ещё' }))
    expect(await screen.findByText('Завод')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Показать ещё' }))
    expect(await screen.findByText('Склад')).toBeInTheDocument()

    expect(fetchUrl).toHaveBeenNthCalledWith(1, 'http://api/api/portfolio/?page=2')
    expect(fetchUrl).toHaveBeenNthCalledWith(2, 'http://api/api/portfolio/?page=3')
    expect(screen.getByText('ЖК «Навруз»')).toBeInTheDocument()
    expect(screen.getByText('Завод')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Показать ещё' })).toBeNull()
  })

  it('renders Uzbek titles when the language is Uzbek', async () => {
    window.localStorage.setItem('dx-lang', 'uz')
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(page([PROJECT]))

    renderPage()

    expect(await screen.findByText("Navro'z turar-joy majmuasi")).toBeInTheDocument()
  })

  // Added beyond the brief: none of the brief's fixtures ever omit `date`,
  // so nothing exercises formatDate's `if (!value) return ''` guard. The
  // backend field isn't documented as required, and a naive
  // `value.split('-')` on a missing date would throw and take the whole
  // card list down with it rather than just leaving one date blank.
  it('renders a card with a missing date without crashing', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioList').mockResolvedValue(
      page([{ ...PROJECT, date: null }]),
    )

    renderPage()

    expect(await screen.findByText('ЖК «Навруз»')).toBeInTheDocument()
    expect(screen.queryByText('NaN.NaN.NaN')).not.toBeInTheDocument()
  })
})
