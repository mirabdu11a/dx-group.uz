import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, NavLink, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import ProductDetail from './ProductDetail'
import * as endpoints from '../api/endpoints'
import '../i18n'

const PRODUCT = {
  id: 10,
  category: 1,
  code: 'BEAM-H20',
  name_ru: 'Балка BEAM H20',
  name_uz: 'BEAM H20 balkasi',
  tizer_ru: 'Двутавровая балка',
  tizer_uz: 'Ikki tavrli balka',
  description_ru: '<p>Полное описание</p>',
  description_uz: "<p>To'liq tavsif</p>",
  image: 'http://api/media/products/a.png',
  order: 1,
  images: [
    { id: 1, image: 'http://api/media/products/a.png', order: 1 },
    { id: 2, image: 'http://api/media/products/b.png', order: 2 },
  ],
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/products/10']}>
      <LanguageProvider>
        <Routes>
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('ProductDetail', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('requests the product from the route parameter', async () => {
    const fetchProduct = vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue(PRODUCT)

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    expect(fetchProduct).toHaveBeenCalledWith('10')
  })

  it('renders the name, code and description', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue(PRODUCT)

    renderDetail()

    expect(await screen.findByText('Балка BEAM H20')).toBeInTheDocument()
    expect(screen.getByText(/BEAM-H20/)).toBeInTheDocument()
    expect(screen.getByText('Полное описание')).toBeInTheDocument()
  })

  it('renders every gallery image', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue(PRODUCT)

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    // Corrected from the brief's expectation of 2. The brief's own Step 4
    // structure — a main viewer plus a full thumbnail strip — necessarily
    // renders the active image twice (once large, once as its own
    // thumbnail), so a 2-image product renders 3 <img> elements, not 2. The
    // brief's count of 2 was simply wrong for that structure; see the task
    // report for why removing the active thumbnail instead (to make 2 come
    // out right) was tried and reverted as a worse design.
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  // Added beyond the brief: makes the corrected design (full thumbnail
  // strip, active one highlighted rather than removed) load-bearing. Without
  // the `is-active` class wired up and moved correctly, a visitor has no
  // way to tell which picture the main viewer is currently showing.
  it('marks the active thumbnail and moves the mark when another is clicked', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue(PRODUCT)

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    expect(screen.getByTestId('gallery-thumb-1')).toHaveClass('is-active')
    expect(screen.getByTestId('gallery-thumb-2')).not.toHaveClass('is-active')

    await userEvent.click(screen.getByTestId('gallery-thumb-2'))

    expect(screen.getByTestId('gallery-thumb-2')).toHaveClass('is-active')
    expect(screen.getByTestId('gallery-thumb-1')).not.toHaveClass('is-active')
  })

  it('switches the main image when a thumbnail is clicked', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue(PRODUCT)

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    const main = screen.getByTestId('gallery-main')
    expect(main).toHaveAttribute('src', 'http://api/media/products/a.png')

    await userEvent.click(screen.getByTestId('gallery-thumb-2'))

    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/products/b.png',
    )
  })

  it('hides the code line when the product has none', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue({ ...PRODUCT, code: '' })

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    expect(screen.queryByText(/Артикул/)).toBeNull()
  })

  it('shows an error message when the product cannot be loaded', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockRejectedValue(new Error('404'))

    renderDetail()

    expect(
      await screen.findByText('Не удалось загрузить данные. Попробуйте позже.'),
    ).toBeInTheDocument()
  })

  // Added beyond the brief: none of the six tests above exercise the
  // gallery's edge cases, even though the task explicitly calls them out —
  // an empty `images` array (fall back to the cover `image`), exactly one
  // image (no thumbnail row), and a null cover with no gallery at all (no
  // <img> rendered, rather than a broken one).
  it('falls back to the cover image when the gallery is empty', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue({ ...PRODUCT, images: [] })

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    const images = screen.getAllByRole('img')
    // Exactly the cover image, and nothing else — confirms both that it
    // rendered and that no thumbnail row appeared for an empty gallery.
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'http://api/media/products/a.png')
  })

  it('shows no thumbnail row when the gallery holds exactly one image', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue({
      ...PRODUCT,
      images: [{ id: 1, image: 'http://api/media/products/a.png', order: 1 }],
    })

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.queryByTestId('gallery-thumb-1')).toBeNull()
  })

  it('renders no image at all when both the gallery and the cover are empty', async () => {
    vi.spyOn(endpoints, 'fetchProduct').mockResolvedValue({
      ...PRODUCT,
      image: null,
      images: [],
    })

    renderDetail()

    await screen.findByText('Балка BEAM H20')
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  // Added beyond the brief: the page keeps `activeId` (which gallery image
  // is shown as the main picture) as local state, but ProductDetail stays
  // mounted across a `/products/:id` param change — the route only swaps
  // which element occupies the same tree position. Without an explicit
  // reset keyed on `id`, a thumbnail selected on one product would still be
  // "active" once a different product's data arrives, showing its picture
  // under the wrong product.
  it('resets the selected gallery image after navigating to a different product', async () => {
    // Deliberately reuses ids 1 and 2 from PRODUCT's gallery (rather than
    // fresh ids like 3/4). If the id-keyed selection were left to leak
    // across navigation with no explicit reset, id 2 would still happen to
    // match an entry in this gallery too — showing d.png instead of the
    // new product's own first image, c.png — so this only proves the reset
    // fires deliberately rather than passing by coincidence of unique ids.
    const OTHER_PRODUCT = {
      ...PRODUCT,
      id: 11,
      name_ru: 'Опора H30',
      name_uz: 'H30 tayanchi',
      images: [
        { id: 1, image: 'http://api/media/products/c.png', order: 1 },
        { id: 2, image: 'http://api/media/products/d.png', order: 2 },
      ],
    }
    vi.spyOn(endpoints, 'fetchProduct').mockImplementation((id) =>
      Promise.resolve(id === '11' ? OTHER_PRODUCT : PRODUCT),
    )

    render(
      <MemoryRouter initialEntries={['/products/10']}>
        <LanguageProvider>
          <NavLink to="/products/11">go to 11</NavLink>
          <Routes>
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await screen.findByText('Балка BEAM H20')
    await userEvent.click(screen.getByTestId('gallery-thumb-2'))
    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/products/b.png',
    )

    await userEvent.click(screen.getByRole('link', { name: 'go to 11' }))

    await screen.findByText('Опора H30')
    expect(screen.getByTestId('gallery-main')).toHaveAttribute(
      'src', 'http://api/media/products/c.png',
    )
  })
})
