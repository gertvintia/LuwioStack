import { useEffect } from 'react'
import { ensureGoogleQuery, getGoogleQueryKey } from './cache'
import { GoogleMapsContext } from './context'
import { useGoogleMaps } from './hooks/use-google-maps'
import { useSuspenseGoogleMaps } from './hooks/use-suspense-google-maps'
import type {
  GoogleMapsLibraryName,
  GoogleMapsProviderImportProps,
  GoogleMapsProviderImportSuspenseProps,
  GoogleMapsProviderProps,
} from './types'

// ── <GoogleMapsProvider> ─────────────────────────────────────────────────────

/**
 * Sets up Google Maps. Loads the base JS script once (eagerly, non-blocking) and provides the
 * config (api key, version, language, region) to descendants. It loads **no** libraries itself.
 *
 * Load libraries as close as possible to the components that need them, with
 * `<GoogleMapsProvider.Import>` (TanStack-Query-style `status`/`error`/`retry`) or
 * `<GoogleMapsProvider.ImportSuspense>` (suspends until ready) — or the matching hooks
 * `useGoogleMaps` / `useSuspenseGoogleMaps`. All share one cache: the script and each library
 * load exactly once, however many importers ask.
 *
 * @example
 * <GoogleMapsProvider apiKey="…">
 *   <GoogleMapsProvider.Import libraries={['maps']}>
 *     {(api, libraries) => api.isSuccess && <MyMap maps={libraries.maps} />}
 *   </GoogleMapsProvider.Import>
 * </GoogleMapsProvider>
 */
export function GoogleMapsProvider({ children, ...options }: GoogleMapsProviderProps) {
  const key = getGoogleQueryKey(options)

  // Start loading the base script the moment <GoogleMapsProvider> mounts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: options is captured via the stable key
  useEffect(() => {
    ensureGoogleQuery(key, options)
  }, [key])
  ensureGoogleQuery(key, options)

  return <GoogleMapsContext.Provider value={options}>{children}</GoogleMapsContext.Provider>
}
GoogleMapsProvider.displayName = 'GoogleMapsProvider'

// ── <GoogleMapsProvider.Import> ──────────────────────────────────────────────

/**
 * Loads the requested libraries and reports load state in the shape of a TanStack Query result
 * (`status` / `isPending` / `isLoading` / `isSuccess` / `isError` / `error` / `retry`), plus the
 * loaded namespaces in `libraries`, keyed by name. Hand each component the library it needs
 * (`<MyMap maps={libraries.maps}>`), so place the import close to those components.
 *
 * Multiple imports can nest or sit side-by-side; the cache dedups, so a library requested in
 * several places still loads once.
 */
export function GoogleMapsProviderImport<const T extends readonly GoogleMapsLibraryName[]>({
  libraries,
  children,
}: GoogleMapsProviderImportProps<T>) {
  // A thin wrapper over the hook: `useGoogleMaps` returns the load-state `api` and the loaded
  // `libraries`; the render prop receives them as `(api, libraries)`.
  const { api, libraries: loaded } = useGoogleMaps(libraries)
  return <>{children(api, loaded)}</>
}
GoogleMapsProviderImport.displayName = 'GoogleMapsProvider.Import'

// ── <GoogleMapsProvider.ImportSuspense> ──────────────────────────────────────

/**
 * Suspense variant of `<GoogleMapsProvider.Import>`. Suspends the nearest `<Suspense>` boundary
 * until every requested library is ready and throws to the nearest error boundary on failure — so
 * the render prop is only ever called with everything loaded, and receives the ready `libraries`
 * namespaces keyed by name.
 */
export function GoogleMapsProviderImportSuspense<const T extends readonly GoogleMapsLibraryName[]>({
  libraries,
  children,
}: GoogleMapsProviderImportSuspenseProps<T>) {
  // A thin wrapper over the hook: `useSuspenseGoogleMaps` suspends/throws until ready and returns
  // the loaded `{ libraries }` — handed to the render prop as its single argument.
  const { libraries: loaded } = useSuspenseGoogleMaps(libraries)
  return <>{children(loaded)}</>
}
GoogleMapsProviderImportSuspense.displayName = 'GoogleMapsProvider.ImportSuspense'

// Attach the loaders as statics so `<GoogleMapsProvider.Import>` reads naturally.
GoogleMapsProvider.Import = GoogleMapsProviderImport
GoogleMapsProvider.ImportSuspense = GoogleMapsProviderImportSuspense
