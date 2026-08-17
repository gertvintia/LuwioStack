import type { ReactNode } from 'react'

// ── Script-level options (shared by provider, context, and cache) ─────────────

export interface GoogleMapsOptions {
  /** Google Maps Platform API key. */
  apiKey: string
  /** Version channel or pinned version, passed as the script's `v` param. @default "weekly" */
  version?: string
  /** Restricts results to a language, passed as the script's `language` param. */
  language?: string
  /** Biases results to a region, passed as the script's `region` param. */
  region?: string
}

// ── Context value (what the provider puts in context for child hooks) ─────────

export type GoogleMapsContextValue = GoogleMapsOptions

// ── <GoogleMaps> props ────────────────────────────────────────────────

export interface GoogleMapsProps extends GoogleMapsOptions {
  /**
   * `<GoogleMaps>` only sets up the script + config context — it loads **no** libraries
   * itself. Load libraries close to where they're used with `<GoogleMaps.import>` /
   * `<GoogleMaps.importSuspense>` (or the `useGoogleMaps` / `useSuspenseGoogleMaps` hooks).
   */
  children: ReactNode
}

// ── Library state ──────────────────────────────────────────────────────────────

export type GoogleMapsStatus = 'pending' | 'error' | 'success'

export interface GoogleMapsLibraryApi {
  status: GoogleMapsStatus
  isPending: boolean
  /** True while a fetch is actively in flight. False for idle (not-requested) libraries. */
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  /** The load failure once `status` is `"error"`, else `undefined`. */
  error: Error | undefined
  /** Discards a failed attempt and tries again. No-op unless `status` is `"error"`. */
  retry: () => void
}

// ── Known library names ─────────────────────────────────────────────────────────

/**
 * All known Google Maps JS API library names, including the deprecated `"drawing"`.
 * Use `GoogleMapsLibraryName` (which excludes `"drawing"`) as the parameter type for hooks.
 */
export const GOOGLE_MAPS_LIBRARY_NAMES = [
  'core',
  'maps',
  'maps3d',
  'places',
  'geocoding',
  'routes',
  'marker',
  'geometry',
  'elevation',
  'streetView',
  'journeySharing',
  'visualization',
  'airQuality',
  'addressValidation',
  'drawing',
] as const

/**
 * Requestable Google Maps library names — all known names except the deprecated `"drawing"`.
 * Pass these to `useGoogleMaps` and `useSuspenseGoogleMaps`.
 */
export type GoogleMapsLibraryName = Exclude<(typeof GOOGLE_MAPS_LIBRARY_NAMES)[number], 'drawing'>

// ── google.maps namespace ─────────────────────────────────────────────────────

/**
 * The library namespaces returned by `google.maps.importLibrary`, keyed by library name.
 * Each value is `unknown` until the library is loaded — cast after checking `api.<name>.isSuccess`.
 */
export interface GoogleMapsGoogleMaps {
  core: unknown
  maps: unknown
  maps3d: unknown
  places: unknown
  geocoding: unknown
  routes: unknown
  marker: unknown
  geometry: unknown
  elevation: unknown
  streetView: unknown
  journeySharing: unknown
  visualization: unknown
  airQuality: unknown
  addressValidation: unknown
  /** @deprecated The Drawing library is deprecated by Google. Migrate away from it. */
  drawing: unknown
}

// ── <GoogleMaps.import> (library loader — TanStack-Query-style states) ──

/**
 * The load state (`api`) for a `<GoogleMaps.import>` / `useGoogleMaps`, in the shape of a
 * TanStack Query result — purely status + actions, no data. `status` is `"pending"` until every
 * requested library has loaded, `"error"` if any failed, else `"success"`.
 */
export interface GoogleMapsImportApi {
  status: GoogleMapsStatus
  /** `true` until every requested library has loaded (and none errored). */
  isPending: boolean
  /** `true` while at least one requested library is actively fetching. */
  isLoading: boolean
  /** `true` once every requested library has loaded. */
  isSuccess: boolean
  /** `true` if any requested library failed. */
  isError: boolean
  /** The first error among the requested libraries, else `undefined`. */
  error: Error | undefined
  /** Re-attempt every failed library. No-op if none failed. */
  retry(): void
}

/**
 * The loaded library namespaces, keyed by the requested names — one entry per library, each
 * defined once its library has loaded (i.e. once `api.isSuccess`).
 */
export type GoogleMapsLibraries<T extends readonly GoogleMapsLibraryName[]> = Pick<
  GoogleMapsGoogleMaps,
  T[number]
>

/** What `useGoogleMaps` returns: the load-state `api` plus the loaded `libraries`. */
export interface GoogleMapsImportResult<T extends readonly GoogleMapsLibraryName[]> {
  api: GoogleMapsImportApi
  libraries: GoogleMapsLibraries<T>
}

export interface GoogleMapsImportProps<T extends readonly GoogleMapsLibraryName[]> {
  /** Libraries to load, via `google.maps.importLibrary`, each independently. */
  libraries: T
  /** Render prop: `(api, libraries)` — status/actions first, the loaded namespaces second. */
  children: (api: GoogleMapsImportApi, libraries: GoogleMapsLibraries<T>) => ReactNode
}

// ── <GoogleMaps.importSuspense> (Suspense variant) ─────────────────────

/** What `useSuspenseGoogleMaps` returns once everything is ready: just the loaded `libraries`. */
export interface GoogleMapsSuspenseResult<T extends readonly GoogleMapsLibraryName[]> {
  libraries: GoogleMapsLibraries<T>
}

export interface GoogleMapsImportSuspenseProps<T extends readonly GoogleMapsLibraryName[]> {
  libraries: T
  /**
   * Render prop: `(libraries)`. Only ever called once every requested library is ready — it
   * suspends until then and throws to an error boundary on failure, so there is no `api` to expose.
   */
  children: (libraries: GoogleMapsLibraries<T>) => ReactNode
}
