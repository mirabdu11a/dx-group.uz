import { useEffect, useRef, useState } from 'react'

function depsChanged(prev, next) {
  if (prev.length !== next.length) return true
  return prev.some((dep, index) => !Object.is(dep, next[index]))
}

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

  // Render-phase reset, mirroring the pattern CatalogSection's `resetKey`
  // and the detail pages' `routeKey` already use: when `deps` differ from
  // the deps this render's state was computed for, drop synchronously to
  // {data: null, loading: true, error: null} in the same render — before
  // anything commits or paints. Without this, the effect below (which runs
  // *after* paint) is the only place state gets reset, so React commits and
  // paints one frame where `deps` has already changed but `data`/`error`
  // still hold the *previous* deps' settled values with `loading: false`.
  // Any consumer that gates on `loading` (or renders `data` once truthy)
  // shows a flash of stale content in that frame.
  const prevDeps = useRef(deps)
  if (depsChanged(prevDeps.current, deps)) {
    prevDeps.current = deps
    setData(null)
    setLoading(true)
    setError(null)
  }

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
