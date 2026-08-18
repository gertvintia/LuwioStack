import type { GoogleMapsOptions, GoogleMapsStatus } from './types'

// A module-level (not React-context) cache: the Google Maps JS API script is a single
// page-wide singleton, so every useGoogleMaps() / useSuspenseGoogleMaps() call for the same
// config shares one script tag and one in-flight load, however many components ask for it.
//
// Listeners are tracked per cache *key*, not per entry object, so that a status transition
// (or retryGoogleQuery) can swap in a brand-new entry without orphaning existing
// useSyncExternalStore subscribers. Entries are also replaced wholesale rather than mutated
// in place — useSyncExternalStore detects change via Object.is on the returned snapshot,
// so a status flip has to produce a new object reference to actually trigger a re-render.

export interface GoogleQueryEntry {
  status: GoogleMapsStatus
  /** The loaded value on success (the `window.google` namespace, or a library namespace), or the `Error` on failure. */
  data: unknown
  /**
   * Settles once the load finishes, success or failure — never rejects. Suspense reads
   * `status`/`data` after this resolves; it exists purely so `throw` targets a promise
   * that won't produce an unhandled-rejection warning.
   */
  suspender: Promise<void>
}

const cache = new Map<string, GoogleQueryEntry>()
const listenersByKey = new Map<string, Set<() => void>>()

/** A stable, never-recreated snapshot for `useSyncExternalStore`'s `getServerSnapshot`. */
const SERVER_ENTRY: GoogleQueryEntry = {
  status: 'pending',
  data: undefined,
  suspender: new Promise(() => {}),
}

/**
 * Same config (key order and casing aside) always maps to the same cache entry. `libraries` is
 * deliberately excluded — the base script no longer differs by which libraries were requested
 * (see loadGoogleScript below), only the `apiKey`/`version`/`language`/`region` combo does.
 */
export function getGoogleQueryKey(options: GoogleMapsOptions): string {
  return [
    options.apiKey,
    options.version ?? 'weekly',
    options.language ?? '',
    options.region ?? '',
  ].join('|')
}

/**
 * A load that neither resolves nor rejects within this window is treated as failed. Necessary
 * because not every failure mode gives us a signal: an unrecognized `libraries` entry used to be
 * passed straight into the script URL and would throw *inside* Google's own bootstrap before it
 * ever called back — no `onerror` (the script itself loaded fine), no callback, nothing, forever.
 * Moving libraries to `importLibrary()` (see ensureGoogleLibrary) avoids that specific cause, but
 * this stays as a general safety net for any other way the callback might never arrive.
 */
const SCRIPT_LOAD_TIMEOUT_MS = 15000

function withTimeout(promise: Promise<unknown>, ms: number, message: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function loadGoogleScript(options: GoogleMapsOptions): Promise<unknown> {
  const w = window as unknown as Record<string, unknown> & { google?: unknown }
  // Someone else (a hand-placed <script>, or a previous successful load in this session)
  // already loaded it — adopt it instead of injecting a second script tag.
  if (w.google) return Promise.resolve(w.google)

  const rawLoad = new Promise((resolve, reject) => {
    const callbackName = `__luwioGoogleLoad_${Math.random().toString(36).slice(2)}`
    w[callbackName] = () => {
      delete w[callbackName]
      resolve(w.google)
    }

    const params = new URLSearchParams({
      key: options.apiKey,
      v: options.version ?? 'weekly',
      callback: callbackName,
      // Google's own recommended loading pattern — omitting it logs a console warning.
      loading: 'async',
    })
    // No `libraries=` here on purpose — see ensureGoogleLibrary. Requesting libraries this way
    // means one unrecognized name throws inside Google's bootstrap and silently kills the whole
    // load, taking every other requested library down with it and never calling back at all.
    if (options.language) params.set('language', options.language)
    if (options.region) params.set('region', options.region)

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.onerror = () => {
      delete w[callbackName]
      reject(new Error('Failed to load the Google Maps JavaScript API script.'))
    }
    document.head.appendChild(script)
  })

  return withTimeout(
    rawLoad,
    SCRIPT_LOAD_TIMEOUT_MS,
    `Google Maps JavaScript API did not finish loading within ${SCRIPT_LOAD_TIMEOUT_MS / 1000}s.`,
  )
}

function notify(key: string) {
  listenersByKey.get(key)?.forEach((listener) => {
    listener()
  })
}

// The script loading (200 OK, callback fires) and the key actually being usable are different
// things — an invalid/restricted key still loads fine and only fails later, reported through a
// separate global hook Google calls instead of our per-load callback: `window.gm_authFailure`.
// It carries no information about *which* load it belongs to, so the most recently started key
// is what gets flipped to "error" — a real limitation of Google's API, not something we can
// resolve precisely, but correct for the overwhelming common case of one key per page.
let lastStartedKey: string | undefined

// `window.google` is a load-once global — Google's JS API cannot be reloaded with a different
// key in the same page once it's been loaded (see loadGoogleScript's "adopt existing window
// .google" branch below). So once an auth failure is observed, it's permanent for the rest of
// the page's life: retrying (or trying a different key) would otherwise silently "succeed" by
// adopting the same already-broken window.google, which is exactly the bug this guards against.
let permanentAuthFailure: Error | undefined

function installAuthFailureHandler() {
  const w = window as unknown as Record<string, unknown> & {
    gm_authFailure?: () => void
  }
  if (w.__luwioGoogleAuthFailurePatched) return
  w.__luwioGoogleAuthFailurePatched = true

  const existing = w.gm_authFailure
  w.gm_authFailure = () => {
    existing?.()
    permanentAuthFailure = new Error(
      'Google Maps JavaScript API authentication failed — check the API key, HTTP referrer ' +
        'restrictions, or billing. The script cannot be reloaded with a different key in the ' +
        'same page, so a full page reload is required before trying another key.',
    )
    if (!lastStartedKey) return
    const key = lastStartedKey
    cache.set(key, {
      status: 'error',
      data: permanentAuthFailure,
      suspender: Promise.resolve(),
    })
    notify(key)
  }
}

/**
 * There's nothing left to actually check once `permanentAuthFailure` is set — it can only ever
 * fail again. This delay exists purely so `retry()` still has a visible "pending" phase instead
 * of the status quietly staying on "error" with no feedback that the click did anything.
 */
const LATCHED_RETRY_DELAY_MS = 400

function startLoad(key: string, options: GoogleMapsOptions): GoogleQueryEntry {
  installAuthFailureHandler()
  lastStartedKey = key

  if (permanentAuthFailure) {
    const error = permanentAuthFailure
    const pendingEntry: GoogleQueryEntry = {
      status: 'pending',
      data: undefined,
      suspender: undefined as unknown as Promise<void>,
    }
    pendingEntry.suspender = new Promise((resolve) => {
      setTimeout(() => {
        // Only settle if this entry is still the current one for `key` — a newer retry() (or a
        // real page reload resetting everything) may have already superseded it.
        if (cache.get(key) === pendingEntry) {
          cache.set(key, {
            status: 'error',
            data: error,
            suspender: pendingEntry.suspender,
          })
          notify(key)
        }
        resolve()
      }, LATCHED_RETRY_DELAY_MS)
    })
    cache.set(key, pendingEntry)
    return pendingEntry
  }

  const suspender = loadGoogleScript(options).then(
    (google) => {
      // A fresh object — mutating the pending entry in place wouldn't change its reference,
      // and useSyncExternalStore only re-renders when getSnapshot returns a new one.
      cache.set(key, { status: 'success', data: google, suspender })
      notify(key)
    },
    (error: Error) => {
      // The errored entry stays cached (unlike deleting it) so status stays "error" until the
      // consumer explicitly calls retry() — no silent auto-retry on the next render.
      cache.set(key, { status: 'error', data: error, suspender })
      notify(key)
    },
  )
  const pendingEntry: GoogleQueryEntry = {
    status: 'pending',
    data: undefined,
    suspender,
  }
  cache.set(key, pendingEntry)
  return pendingEntry
}

/** Returns the shared entry for `key`, starting a load if this is the first request for it. */
export function ensureGoogleQuery(key: string, options: GoogleMapsOptions): GoogleQueryEntry {
  // No DOM to inject a <script> into (SSR) — a stable, permanently-pending snapshot.
  if (typeof document === 'undefined') return SERVER_ENTRY
  return cache.get(key) ?? startLoad(key, options)
}

/** A stable reference for `useSyncExternalStore`'s `getServerSnapshot`. */
export function getGoogleServerQuery(): GoogleQueryEntry {
  return SERVER_ENTRY
}

/** Discards any cached entry (successful or failed) for `key` and starts a fresh load. */
export function retryGoogleQuery(key: string, options: GoogleMapsOptions): void {
  cache.delete(key)
  startLoad(key, options)
  notify(key)
}

export function subscribeGoogleQuery(key: string, listener: () => void): () => void {
  const existing = listenersByKey.get(key)
  const set = existing ?? new Set<() => void>()
  if (!existing) listenersByKey.set(key, set)
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

// ── Per-library loading ──────────────────────────────────────────────────────────
//
// google.maps.importLibrary(name) is Google's own modern, per-library loading API: each call
// returns its own promise that resolves with that library's namespace or rejects with a real,
// specific error — independent of every other library, and independent of the base script's
// `libraries=` URL param (which this codebase deliberately no longer uses; see loadGoogleScript).
// Keyed by library name alone, page-wide: like the base script, an imported library is a global
// singleton — one `places` import anywhere on the page satisfies every consumer asking for it.

const libraryCache = new Map<string, GoogleQueryEntry>()
const libraryListenersByKey = new Map<string, Set<() => void>>()

function notifyLibrary(name: string) {
  libraryListenersByKey.get(name)?.forEach((listener) => {
    listener()
  })
}

function startLibraryLoad(name: string): GoogleQueryEntry {
  const w = window as unknown as {
    google?: { maps?: { importLibrary?: (n: string) => Promise<unknown> } }
  }
  const importLibrary = w.google?.maps?.importLibrary
  const rawImport = importLibrary
    ? importLibrary(name)
    : Promise.reject(
        new Error('google.maps.importLibrary is unavailable — load the base script first.'),
      )

  const suspender = rawImport.then(
    (value) => {
      libraryCache.set(name, { status: 'success', data: value, suspender })
      notifyLibrary(name)
    },
    (error: Error) => {
      libraryCache.set(name, { status: 'error', data: error, suspender })
      notifyLibrary(name)
    },
  )
  const pendingEntry: GoogleQueryEntry = {
    status: 'pending',
    data: undefined,
    suspender,
  }
  libraryCache.set(name, pendingEntry)
  return pendingEntry
}

/** Returns the shared entry for library `name`, starting its import if this is the first request. */
export function ensureGoogleLibrary(name: string): GoogleQueryEntry {
  if (typeof document === 'undefined') return SERVER_ENTRY
  return libraryCache.get(name) ?? startLibraryLoad(name)
}

/** Discards any cached entry (successful or failed) for library `name` and imports it again. */
export function retryGoogleLibrary(name: string): void {
  libraryCache.delete(name)
  startLibraryLoad(name)
  notifyLibrary(name)
}

export function subscribeGoogleLibrary(name: string, listener: () => void): () => void {
  const existing = libraryListenersByKey.get(name)
  const set = existing ?? new Set<() => void>()
  if (!existing) libraryListenersByKey.set(name, set)
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

/**
 * Test-only: clears all module state (cache, listeners, the `gm_authFailure` latch). In a real
 * page this state is only ever cleared by an actual reload, but a test file runs many isolated
 * scenarios in one process — without this, `permanentAuthFailure` from one test would leak into
 * every test after it, since it exists specifically to persist for the page's lifetime.
 */
export function __resetGoogleQueryCacheForTests(): void {
  cache.clear()
  listenersByKey.clear()
  libraryCache.clear()
  libraryListenersByKey.clear()
  lastStartedKey = undefined
  permanentAuthFailure = undefined
  if (typeof window === 'undefined') return
  const w = window as unknown as Record<string, unknown>
  delete w.google
  delete w.gm_authFailure
  delete w.__luwioGoogleAuthFailurePatched
}
