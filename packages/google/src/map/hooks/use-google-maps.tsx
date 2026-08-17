import { useCallback, useSyncExternalStore } from 'react'
import {
  ensureGoogleQuery,
  getGoogleQueryKey,
  getGoogleServerQuery,
  retryGoogleQuery,
  subscribeGoogleQuery,
} from '../cache'
import type {
  GoogleMapsImportResult,
  GoogleMapsLibraryApi,
  GoogleMapsLibraryName,
  GoogleMapsStatus,
} from '../types'
import { useGoogleLibraries } from './use-google-libraries'
import { useGoogleMapsContext } from './use-google-maps-context'

/**
 * Loads the requested Google Maps libraries and reports load state in the shape of a TanStack
 * Query result — the very same `api` object `<GoogleMapsProvider.Import>` hands its render prop:
 * `status` / `isPending` / `isLoading` / `isSuccess` / `isError` / `error` / `retry`, plus the
 * loaded namespaces in `libraries`, keyed by the requested names (`libraries.maps`).
 * `<GoogleMapsProvider.Import>` is a thin wrapper over this hook.
 *
 * Each requested library loads independently via `google.maps.importLibrary`, so one failing
 * name never blocks the others; `retry()` re-attempts every failed library. When the base
 * script itself fails, the whole result is `isError`.
 *
 * Must be rendered inside `<GoogleMapsProvider>` — the API key is read from context.
 *
 * @example
 * const { api, libraries } = useGoogleMaps(['maps'])
 * if (api.isSuccess) new (libraries.maps as MapsLib).Map(el, opts)
 */
export function useGoogleMaps<const T extends readonly GoogleMapsLibraryName[]>(
  libraries: T,
): GoogleMapsImportResult<T> {
  const options = useGoogleMapsContext()
  const key = getGoogleQueryKey(options)

  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeGoogleQuery(key, onStoreChange),
    [key],
  )
  const entry = useSyncExternalStore(
    subscribe,
    () => ensureGoogleQuery(key, options),
    getGoogleServerQuery,
  )

  const names = libraries as unknown as string[]
  const rawLibraries = useGoogleLibraries(names, entry.status === 'success')

  // When the base script itself fails, the whole result is an error — every requested
  // namespace is undefined and `retry` re-attempts the script load.
  if (entry.status === 'error') {
    const empty: Record<string, unknown> = {}
    for (const name of names) empty[name] = undefined
    return {
      api: {
        status: 'error',
        isPending: false,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: entry.data as Error,
        retry: () => retryGoogleQuery(key, options),
      },
      libraries: empty as GoogleMapsImportResult<T>['libraries'],
    }
  }

  // Requested but importLibrary not dispatched yet (script still loading).
  const loadingSentinel: GoogleMapsLibraryApi = {
    status: 'pending',
    isPending: true,
    isLoading: true,
    isSuccess: false,
    isError: false,
    error: undefined,
    retry: () => {},
  }

  // Gather each requested library's status + its loaded namespace value.
  const perLib: GoogleMapsLibraryApi[] = []
  const loaded: Record<string, unknown> = {}
  for (const name of names) {
    const raw = rawLibraries[name]
    if (!raw) {
      perLib.push(loadingSentinel)
      loaded[name] = undefined
    } else {
      const { value, ...status } = raw
      perLib.push(status)
      loaded[name] = value
    }
  }

  // Aggregate across the requested libraries — mirrors TanStack Query's combined result.
  const isError = perLib.some((l) => l.isError)
  const isSuccess = perLib.length === 0 || perLib.every((l) => l.isSuccess)
  const isLoading = perLib.some((l) => l.isLoading)
  const error = perLib.find((l) => l.isError)?.error
  const status: GoogleMapsStatus = isError ? 'error' : isSuccess ? 'success' : 'pending'
  const retry = () => {
    for (const l of perLib) if (l.isError) l.retry()
  }

  return {
    api: {
      status,
      isPending: status === 'pending',
      isLoading,
      isSuccess,
      isError,
      error,
      retry,
    },
    libraries: loaded as GoogleMapsImportResult<T>['libraries'],
  }
}
