import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, NavLink, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import PortfolioDetail from './PortfolioDetail'
import * as endpoints from '../api/endpoints'
import '../i18n'

const PROJECT = {
  id: 3,
  title_ru: 'ЖК «Навруз»',
  title_uz: "Navro'z turar-joy majmuasi",
  tizer_ru: 'Опалубка стен и перекрытий',
  tizer_uz: 'Devor va yopma opalubkasi',
  description_ru: '<p>16 этажей монолита</p>',
  description_uz: "<p>16 qavatli monolit</p>",
  image: 'http://api/media/portfolio/a.png',
  date: '2025-09-01',
  order: 1,
  images: [
    { id: 1, image: 'http://api/media/portfolio/a.png', order: 1 },
    { id: 2, image: 'http://api/media/portfolio/b.png', order: 2 },
  ],
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/portfolio/3']}>
      <LanguageProvider>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('PortfolioDetail', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('requests the project from the route parameter', async () => {
    const fetchItem = vi
      .spyOn(endpoints, 'fetchPortfolioItem')
      .mockResolvedValue(PROJECT)

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    expect(fetchItem).toHaveBeenCalledWith('3')
  })

  it('renders the title, date and description', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue(PROJECT)

    renderDetail()

    expect(await screen.findByText('ЖК «Навруз»')).toBeInTheDocument()
    expect(screen.getByText('01.09.2025')).toBeInTheDocument()
    expect(screen.getByText('16 этажей монолита')).toBeInTheDocument()
  })

  // Strengthened beyond the brief: the brief's own Step 3 structure — a main
  // viewer plus a full thumbnail strip — renders the active image twice
  // (once large, once as its own thumbnail), so a 2-image project renders 3
  // <img> elements, not 2. This also proves the strip keeps every image
  // (including the active one) rather than excluding it, which would shift
  // every other thumbnail's position on each click.
  it('renders every gallery image', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue(PROJECT)

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  // Added beyond the brief: without the `is-active` class wired up (and
  // moved on click) a visitor has no way to tell which picture the main
  // viewer is currently showing.
  it('marks the active thumbnail and moves the mark when another is clicked', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue(PROJECT)

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    expect(screen.getByTestId('gallery-thumb-1')).toHaveClass('is-active')
    expect(screen.getByTestId('gallery-thumb-2')).not.toHaveClass('is-active')

    await userEvent.click(screen.getByTestId('gallery-thumb-2'))

    expect(screen.getByTestId('gallery-thumb-2')).toHaveClass('is-active')
    expect(screen.getByTestId('gallery-thumb-1')).not.toHaveClass('is-active')
  })

  it('switches the main image when a thumbnail is clicked', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue(PROJECT)

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    await userEvent.click(screen.getByTestId('gallery-thumb-2'))

    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/portfolio/b.png',
    )
  })

  it('links back to the project list', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue(PROJECT)

    renderDetail()

    const back = await screen.findByRole('link', { name: /Назад к проектам/ })
    expect(back).toHaveAttribute('href', '/portfolio')
  })

  it('shows an error message when the project cannot be loaded', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockRejectedValue(new Error('404'))

    renderDetail()

    expect(
      await screen.findByText('Не удалось загрузить данные. Попробуйте позже.'),
    ).toBeInTheDocument()
  })

  // Added beyond the brief: none of the tests above exercise the gallery's
  // edge cases, even though the sibling ProductDetail page (and this page's
  // own description) explicitly calls them out — an empty `images` array
  // (fall back to the cover `image`), exactly one image (no thumbnail row),
  // and a null cover with no gallery at all (no <img> rendered).
  it('falls back to the cover image when the gallery is empty', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue({ ...PROJECT, images: [] })

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'http://api/media/portfolio/a.png')
  })

  it('shows no thumbnail row when the gallery holds exactly one image', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue({
      ...PROJECT,
      images: [{ id: 1, image: 'http://api/media/portfolio/a.png', order: 1 }],
    })

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.queryByTestId('gallery-thumb-1')).toBeNull()
  })

  it('renders no image at all when both the gallery and the cover are empty', async () => {
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockResolvedValue({
      ...PROJECT,
      image: null,
      images: [],
    })

    renderDetail()

    await screen.findByText('ЖК «Навруз»')
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  // Added beyond the brief: PortfolioDetail stays mounted across a
  // `/portfolio/:id` param change — the route only swaps which element
  // occupies the same tree position. Without an explicit reset keyed on
  // `id`, a thumbnail selected on one project would still be "active" once
  // a different project's data arrives, showing its picture under the wrong
  // project. Deliberately reuses gallery ids 1 and 2 from PROJECT (rather
  // than fresh ids like 3/4): if the id-keyed selection leaked across
  // navigation with no explicit reset, id 2 would still happen to match an
  // entry in the other project's gallery too, so this only proves the reset
  // fires deliberately rather than passing by coincidence of unique ids.
  it('resets the selected gallery image after navigating to a different project', async () => {
    const OTHER_PROJECT = {
      ...PROJECT,
      id: 4,
      title_ru: 'ЖК «Тонг»',
      title_uz: "Tong turar-joy majmuasi",
      images: [
        { id: 1, image: 'http://api/media/portfolio/c.png', order: 1 },
        { id: 2, image: 'http://api/media/portfolio/d.png', order: 2 },
      ],
    }
    vi.spyOn(endpoints, 'fetchPortfolioItem').mockImplementation((id) =>
      Promise.resolve(id === '4' ? OTHER_PROJECT : PROJECT),
    )

    render(
      <MemoryRouter initialEntries={['/portfolio/3']}>
        <LanguageProvider>
          <NavLink to="/portfolio/4">go to 4</NavLink>
          <Routes>
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await screen.findByText('ЖК «Навруз»')
    await userEvent.click(screen.getByTestId('gallery-thumb-2'))
    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/portfolio/b.png',
    )

    await userEvent.click(screen.getByRole('link', { name: 'go to 4' }))

    await screen.findByText('ЖК «Тонг»')
    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/portfolio/c.png',
    )
  })
})
