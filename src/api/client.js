// Backend origin, no trailing slash. Set VITE_API_URL in .env; the
// fallback keeps `npm run dev` working with a local backend.
export const BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

export async function request(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`)
    error.status = response.status
    // DRF returns field errors as JSON; keep them so the contact form can
    // show what the backend rejected.
    try {
      error.body = await response.json()
    } catch {
      error.body = null
    }
    throw error
  }

  return response.json()
}

export const apiGet = (path) => request(`${BASE_URL}${path}`)

export const apiPost = (path, body) =>
  request(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

// The API already serialises absolute image URLs. mediaUrl is a safety net
// for any path that arrives relative, and it normalises the missing slash.
export function mediaUrl(path) {
  if (!path) return null
  // Matches absolute (http://, https://) and protocol-relative (//) URLs —
  // both already name their own host and must pass through untouched.
  if (/^(https?:)?\/\//i.test(path)) return path
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
