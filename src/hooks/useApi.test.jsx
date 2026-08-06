import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useApi } from './useApi'

describe('useApi', () => {
  it('starts in the loading state', () => {
    const { result } = renderHook(() => useApi(() => new Promise(() => {})))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('exposes the resolved data', async () => {
    const { result } = renderHook(() => useApi(() => Promise.resolve([{ id: 1 }])))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 1 }])
    expect(result.current.error).toBeNull()
  })

  it('exposes the rejection', async () => {
    const boom = new Error('boom')
    const { result } = renderHook(() => useApi(() => Promise.reject(boom)))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(boom)
    expect(result.current.data).toBeNull()
  })

  it('re-runs when a dependency changes', async () => {
    const fetcher = vi.fn().mockResolvedValue([])
    const { rerender } = renderHook(({ id }) => useApi(() => fetcher(id), [id]), {
      initialProps: { id: 1 },
    })

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    rerender({ id: 2 })
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(fetcher).toHaveBeenLastCalledWith(2)
  })

  it('ignores a response that lands after unmount', async () => {
    // Setting state on an unmounted component logs a React warning; the
    // `alive` guard is what keeps this console clean.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let resolve
    const { unmount } = renderHook(() =>
      useApi(() => new Promise((r) => { resolve = r })),
    )

    unmount()
    resolve([{ id: 1 }])
    await Promise.resolve()

    expect(consoleError).not.toHaveBeenCalled()
  })

  // Strengthened per standing instruction: the test above only asserts that
  // no console warning fires, which is a truism under React 18+ — React
  // stopped warning on setState-after-unmount, and testing-library freezes
  // `result.current` once a hook unmounts, so that assertion passes even
  // with the `alive` guard deleted entirely (verified by mutation test).
  // The guard's actual, observable job is preventing a slow *stale* request
  // from clobbering a faster *newer* one once deps change — this test pins
  // that down directly and fails if the guard is removed.
  it('ignores a stale response once a newer request supersedes it', async () => {
    let resolveFirst
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r }))
      .mockImplementationOnce(() => Promise.resolve('second'))

    const { result, rerender } = renderHook(
      ({ id }) => useApi(() => fetcher(id), [id]),
      { initialProps: { id: 1 } },
    )

    // Changing the dependency starts the second (fast) request while the
    // first (slow) one is still in flight.
    rerender({ id: 2 })
    await waitFor(() => expect(result.current.data).toBe('second'))

    // The stale first request now resolves. Without the `alive` guard this
    // would overwrite the already-settled, newer result. `act` flushes the
    // resulting state update (if any) so it's reliably observable here.
    await act(async () => {
      resolveFirst('first')
      await Promise.resolve()
    })

    expect(result.current.data).toBe('second')
  })

  it('clears a stale error once a subsequent request succeeds', async () => {
    const boom = new Error('boom')
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(boom)
      .mockResolvedValueOnce([{ id: 1 }])

    const { result, rerender } = renderHook(
      ({ id }) => useApi(() => fetcher(id), [id]),
      { initialProps: { id: 1 } },
    )

    await waitFor(() => expect(result.current.error).toBe(boom))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))
    expect(result.current.error).toBeNull()
  })

  it('clears stale data once a subsequent request fails', async () => {
    const boom = new Error('boom')
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockRejectedValueOnce(boom)

    const { result, rerender } = renderHook(
      ({ id }) => useApi(() => fetcher(id), [id]),
      { initialProps: { id: 1 } },
    )

    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.error).toBe(boom))
    expect(result.current.data).toBeNull()
  })

  // Pins the render-phase reset: setLoading(true) previously lived only
  // inside the effect, which runs after paint. That left one committed,
  // painted frame where `deps` had already changed but `data` still held
  // the *previous* deps' value and `loading` was still `false` — a
  // consumer gating on `if (loading || !data)` renders the stale value in
  // that frame. This asserts the state immediately visible once a deps
  // change has been processed (rerender flushes the synchronous render-
  // phase reset and the effect within the same `act`), before the new
  // fetch settles: `data` must already be back to `null`, not the id=1
  // value hanging around while `loading` reads `true`.
  it('resets data to null before the new value arrives on a deps change', async () => {
    let resolveSecond
    const fetcher = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve('data-for-1'))
      .mockImplementationOnce(() => new Promise((r) => { resolveSecond = r }))

    const { result, rerender } = renderHook(
      ({ id }) => useApi(() => fetcher(id), [id]),
      { initialProps: { id: 1 } },
    )

    await waitFor(() => expect(result.current.data).toBe('data-for-1'))

    rerender({ id: 2 })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await act(async () => {
      resolveSecond('data-for-2')
      await Promise.resolve()
    })

    expect(result.current.data).toBe('data-for-2')
  })
})
