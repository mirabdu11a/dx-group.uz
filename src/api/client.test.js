import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiGet, apiPost, mediaUrl, BASE_URL } from './client'

function okResponse(body) {
  return { ok: true, status: 200, json: async () => body }
}

describe('mediaUrl', () => {
  it('returns null for a missing path', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl('')).toBeNull()
  })

  it('passes absolute URLs through untouched', () => {
    // Strengthened per standing instruction: the implementation regex is
    // `/^https?:\/\//i`, so both schemes must be pinned, not just http.
    const httpUrl = 'http://127.0.0.1:8000/media/products/a.png'
    const httpsUrl = 'https://api.dx-group.uz/media/products/a.png'
    expect(mediaUrl(httpUrl)).toBe(httpUrl)
    expect(mediaUrl(httpsUrl)).toBe(httpsUrl)
  })

  it('prefixes relative paths with the backend origin', () => {
    expect(mediaUrl('/media/products/a.png')).toBe(`${BASE_URL}/media/products/a.png`)
  })

  it('inserts the missing slash', () => {
    expect(mediaUrl('media/a.png')).toBe(`${BASE_URL}/media/a.png`)
  })
})

describe('apiGet', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('requests the path against the backend origin', async () => {
    fetch.mockResolvedValue(okResponse([{ id: 1 }]))

    const data = await apiGet('/api/category/')

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/category/`, {})
    expect(data).toEqual([{ id: 1 }])
  })

  it('throws with the status on a failed response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) })

    await expect(apiGet('/api/product/9/')).rejects.toMatchObject({ status: 404 })
  })
})

describe('apiPost', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends JSON', async () => {
    fetch.mockResolvedValue(okResponse({ id: 7 }))

    const data = await apiPost('/api/lead/', { name: 'Иван' })

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/lead/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Иван' }),
    })
    expect(data).toEqual({ id: 7 })
  })

  it('attaches the parsed body to validation errors', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ phone: ['Неверный номер.'] }),
    })

    await expect(apiPost('/api/lead/', {})).rejects.toMatchObject({
      status: 400,
      body: { phone: ['Неверный номер.'] },
    })
  })
})
