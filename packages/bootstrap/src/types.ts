// Core types for config-based bootstrap. React-free — shared by the loader, transports, and caches.

/** A config payload tagged with the version (ETag) it was fetched at. */
export interface VersionedConfig<T> {
  version: string
  data: T
}

/**
 * The outcome of a conditional fetch. `unchanged` carries no body — the caller reuses the cached
 * data for that version (an HTTP `304`). `fresh` is a full response (a `200`).
 */
export type FetchResult<T> =
  | { status: 'fresh'; version: string; data: T }
  | { status: 'unchanged'; version: string }

/**
 * Fetches the config, given the last-seen version for a conditional request (`null` on a cold
 * start). Return `unchanged` when the version still matches, `fresh` otherwise. `httpConfig()` is
 * the ready-made implementation; supply your own to hit a mock or a non-HTTP source.
 */
export type ConfigFetcher<T> = (version: string | null) => Promise<FetchResult<T>>

/** Persists the last-seen config across reloads — the client half of HTTP caching. */
export interface ConfigCache<T> {
  read(): VersionedConfig<T> | null
  write(value: VersionedConfig<T>): void
}

/** Options for background revalidation (stale-while-revalidate). */
export interface WatchOptions {
  /** Poll interval in ms; the check also runs on window focus / tab-visible. Default `30000`. */
  intervalMs?: number
}

export interface ConfigLoaderOptions<Raw, Out> {
  /** How to fetch the config (conditional on the cached version). */
  fetch: ConfigFetcher<Raw>
  /** Where to remember the last-seen config across reloads. Omit to always fetch. */
  cache?: ConfigCache<Raw>
  /**
   * Map the raw (JSON-serializable) body to the shape the app consumes — e.g. hydrate ids into
   * domain objects. Runs on every `load()`; only the raw body is cached. Defaults to identity.
   */
  map?: (raw: Raw) => Out
  /** Log fetch/revalidation outcomes to the console under `[bootstrap]`. Default `false`. */
  debug?: boolean
}

/** The result of a background revalidation check. */
export interface RevalidateResult {
  /** True when the published version now differs from the one `load()` last applied. */
  changed: boolean
  version: string
}

export interface ConfigLoader<T> {
  /** Fetch (or revalidate) the config and return the mapped value. Marks its version as applied. */
  load(): Promise<T>
  /** Re-check the source without touching the applied config; reports whether it changed. */
  revalidate(): Promise<RevalidateResult>
  /**
   * Start background revalidation. Calls `onChange` once, the first time the published version
   * diverges from the applied one. Returns a function that stops watching.
   */
  watch(onChange: (info: { version: string }) => void, options?: WatchOptions): () => void
}
