import { useEffect, useState } from 'react'

/**
 * Runs `fetcher` on mount and whenever `deps` change.
 *
 * The `alive` flag drops responses that land after the component
 * unmounted or after a newer request superseded this one — without it a
 * slow first request could overwrite the result of a faster second one.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!alive) return
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (!alive) return
        setError(err)
        setData(null)
        setLoading(false)
      })

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
