import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BASE_URL } from './client'
import {
  fetchCategories,
  fetchProducts,
  fetchProduct,
  fetchPortfolioList,
  fetchPortfolioItem,
  fetchUrl,
  sendLead,
} from './endpoints'

function okResponse(body = {}) {
  return { ok: true, status: 200, json: async () => body }
}

describe('endpoints', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()))
  })

  const calledUrl = () => fetch.mock.calls[0][0]

  it('fetchCategories hits the unpaginated list', async () => {
    await fetchCategories()
    expect(calledUrl()).toBe(`${BASE_URL}/api/category/`)
  })

  it('fetchProducts without arguments hits the bare list', async () => {
    await fetchProducts()
    expect(calledUrl()).toBe(`${BASE_URL}/api/product/`)
  })

  it('fetchProducts passes the category filter', async () => {
    await fetchProducts({ category: 3 })
    expect(calledUrl()).toBe(`${BASE_URL}/api/product/?category=3`)
  })

  it('fetchProducts passes category and page together', async () => {
    await fetchProducts({ category: 3, page: 2 })
    expect(calledUrl()).toBe(`${BASE_URL}/api/product/?category=3&page=2`)
  })

  it('fetchProducts keeps a falsy-but-valid category of 0', async () => {
    // category=0 and page=0 are valid values, not "absent" — a truthy check
    // would silently drop them from the query string.
    await fetchProducts({ category: 0 })
    expect(calledUrl()).toBe(`${BASE_URL}/api/product/?category=0`)
  })

  it('fetchProduct hits the detail route', async () => {
    await fetchProduct(12)
    expect(calledUrl()).toBe(`${BASE_URL}/api/product/12/`)
  })

  it('fetchPortfolioList hits the portfolio list', async () => {
    await fetchPortfolioList()
    expect(calledUrl()).toBe(`${BASE_URL}/api/portfolio/`)
  })

  it('fetchPortfolioList passes the page', async () => {
    await fetchPortfolioList({ page: 3 })
    expect(calledUrl()).toBe(`${BASE_URL}/api/portfolio/?page=3`)
  })

  it('fetchPortfolioList keeps a falsy-but-valid page of 0', async () => {
    await fetchPortfolioList({ page: 0 })
    expect(calledUrl()).toBe(`${BASE_URL}/api/portfolio/?page=0`)
  })

  it('fetchPortfolioItem hits the detail route', async () => {
    await fetchPortfolioItem(4)
    expect(calledUrl()).toBe(`${BASE_URL}/api/portfolio/4/`)
  })

  it('fetchUrl requests an absolute pagination link as-is', async () => {
    const next = `${BASE_URL}/api/product/?page=2`

    await fetchUrl(next)

    expect(calledUrl()).toBe(next)
  })

  it('sendLead posts the form payload', async () => {
    await sendLead({ name: 'Иван', phone: '+998901234567', message: 'Тест' })

    expect(calledUrl()).toBe(`${BASE_URL}/api/lead/`)
    expect(fetch.mock.calls[0][1].method).toBe('POST')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      name: 'Иван',
      phone: '+998901234567',
      message: 'Тест',
    })
  })
})
