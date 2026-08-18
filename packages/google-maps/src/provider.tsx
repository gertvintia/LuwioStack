import { useEffect } from 'react'
import { ensureGoogleQuery, getGoogleQueryKey } from './cache'
import { GoogleMapsContext } from './context'
import { useGoogleMaps } from './hooks/use-google-maps'
import { useSuspenseGoogleMaps } from './hooks/use-suspense-google-maps'
import type {
  GoogleMapsImportProps,
  GoogleMapsImportSuspenseProps,
  GoogleMapsLibraryName,
  GoogleMapsProps,
} from './types'

// ── <GoogleMaps> ─────────────────────────────────────────────────────

/**
 * Sets up Google Maps. Loads the base JS script once (eagerly, non-blocking) and provides the
 * config (api key, version, language, region) to descendants. It loads **no** libraries itself.
 *
 * Load libraries as close as possible to the components that need them, with
 * `<GoogleMaps.import>` (TanStack-Query-style `status`/`error`/`retry`) or
 * `<GoogleMaps.importSuspense>` (suspends until ready) — or the matching hooks
 * `useGoogleMaps` / `useSuspenseGoogleMaps`. All share one cache: the script and each library
 * load exactly once, however many importers ask.
 *
 * @example
 * <GoogleMaps apiKey="…">
 *   <GoogleMaps.import libraries={['maps']}>
 *     {(api, libraries) => api.isSuccess && <MyMap maps={libraries.maps} />}
 *   </GoogleMaps.import>
 * </GoogleMaps>
 */
export function GoogleMaps({ children, ...options }: GoogleMapsProps) {
  const key = getGoogleQueryKey(options)

  // Start loading the base script the moment <GoogleMaps> mounts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: options is captured via the stable key
  useEffect(() => {
    ensureGoogleQuery(key, options)
  }, [key])
  ensureGoogleQuery(key, options)

  return <GoogleMapsContext.Provider value={options}>{children}</GoogleMapsContext.Provider>
}
GoogleMaps.displayName = 'GoogleMaps'

// ── <GoogleMaps.import> ──────────────────────────────────────────────

/**
 * Loads the requested libraries and reports load state in the shape of a TanStack Query result
 * (`status` / `isPending` / `isLoading` / `isSuccess` / `isError` / `error` / `retry`), plus the
 * loaded namespaces in `libraries`, keyed by name. Hand each component the library it needs
 * (`<MyMap maps={libraries.maps}>`), so place the import close to those components.
 *
 * Multiple imports can nest or sit side-by-side; the cache dedups, so a library requested in
 * several places still loads once.
 */
export function GoogleMapsImport<const T extends readonly GoogleMapsLibraryName[]>({
  libraries,
  children,
}: GoogleMapsImportProps<T>) {
  // A thin wrapper over the hook: `useGoogleMaps` returns the load-state `api` and the loaded
  // `libraries`; the render prop receives them as `(api, libraries)`.
  const { api, libraries: loaded } = useGoogleMaps(libraries)
  return <>{children(api, loaded)}</>
}
GoogleMapsImport.displayName = 'GoogleMaps.import'

// ── <GoogleMaps.importSuspense> ──────────────────────────────────────

/**
 * Suspense variant of `<GoogleMaps.import>`. Suspends the nearest `<Suspense>` boundary
 * until every requested library is ready and throws to the nearest error boundary on failure — so
 * the render prop is only ever called with everything loaded, and receives the ready `libraries`
 * namespaces keyed by name.
 */
export function GoogleMapsImportSuspense<const T extends readonly GoogleMapsLibraryName[]>({
  libraries,
  children,
}: GoogleMapsImportSuspenseProps<T>) {
  // A thin wrapper over the hook: `useSuspenseGoogleMaps` suspends/throws until ready and returns
  // the loaded `{ libraries }` — handed to the render prop as its single argument.
  const { libraries: loaded } = useSuspenseGoogleMaps(libraries)
  return <>{children(loaded)}</>
}
GoogleMapsImportSuspense.displayName = 'GoogleMaps.importSuspense'

// Attach the loaders as statics so `<GoogleMaps.import>` reads naturally.
GoogleMaps.import = GoogleMapsImport
GoogleMaps.importSuspense = GoogleMapsImportSuspense
