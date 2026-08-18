import { useCallback, useSyncExternalStore } from 'react'
import {
  ensureGoogleQuery,
  getGoogleQueryKey,
  getGoogleServerQuery,
  subscribeGoogleQuery,
} from '../cache'
import type { GoogleMapsLibraryName, GoogleMapsSuspenseResult } from '../types'
import { useGoogleLibraryEntries } from './use-google-libraries'
import { useGoogleMapsContext } from './use-google-maps-context'

/**
 * Suspense-compatible variant of `useGoogleMaps`, returning the same `{ libraries }` shape
 * `<GoogleMaps.importSuspense>` hands its render prop (which is a thin wrapper over this
 * hook). Suspends the nearest `<Suspense>` boundary while the base script and every requested
 * library are loading, throws to the nearest error boundary on failure, and returns the ready
 * namespaces in `libraries`, keyed by the requested names, once everything is ready.
 *
 * Must be rendered inside `<GoogleMaps>` — the API key is read from context.
 *
 * Stays subscribed after resolving — so a later `gm_authFailure` re-throws to the
 * error boundary instead of silently leaving a stale "success" render in place.
 *
 * Shares the same cache as `useGoogleMaps` — mixing the two for the same config
 * still only loads the script (and each library) once.
 *
 * @example
 * const { libraries } = useSuspenseGoogleMaps(['places'])
 * const placesLib = libraries.places as { PlacesService: typeof google.maps.places.PlacesService }
 */
export function useSuspenseGoogleMaps<const T extends readonly GoogleMapsLibraryName[]>(
  libraries: T,
): GoogleMapsSuspenseResult<T> {
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

  const { entries: libraryEntries } = useGoogleLibraryEntries(
    libraries as unknown as string[],
    entry.status === 'success',
  )

  if (entry.status === 'pending') throw entry.suspender
  if (entry.status === 'error') throw entry.data

  if (libraryEntries.some((e) => e.status === 'pending')) {
    throw Promise.all(libraryEntries.map((e) => e.suspender))
  }
  const errored = libraryEntries.find((e) => e.status === 'error')
  if (errored) throw errored.data

  const loaded = Object.fromEntries(
    (libraries as unknown as string[]).map((name, i) => [name, libraryEntries[i]?.data]),
  ) as GoogleMapsSuspenseResult<T>['libraries']
  return { libraries: loaded }
}
