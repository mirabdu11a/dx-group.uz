import { apiGet, apiPost, request } from './client'

export const fetchCategories = () => apiGet('/api/category/')

export function fetchProducts({ category, page } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', String(category))
  if (page) params.set('page', String(page))
  const qs = params.toString()
  return apiGet(`/api/product/${qs ? `?${qs}` : ''}`)
}

export const fetchProduct = (id) => apiGet(`/api/product/${id}/`)

export function fetchPortfolioList({ page } = {}) {
  const params = new URLSearchParams()
  if (page) params.set('page', String(page))
  const qs = params.toString()
  return apiGet(`/api/portfolio/${qs ? `?${qs}` : ''}`)
}

export const fetchPortfolioItem = (id) => apiGet(`/api/portfolio/${id}/`)

// DRF's pagination `next` is already absolute — defined here rather than
// re-exported from client.js so tests can stub it on this module.
export const fetchUrl = (absoluteUrl) => request(absoluteUrl)

export const sendLead = (payload) => apiPost('/api/lead/', payload)
