import type { GoogleAnalyticsOptions, GoogleAnalyticsStatus } from './types'

// A module-level (not React-context) store for the gtag.js script, mirroring the /map cache:
// gtag.js is a page-wide singleton keyed by Measurement ID, so every useAnalytics() for the
// same id shares one script tag and one load. Entries are replaced (not mutated) on each status
// transition so useSyncExternalStore's Object.is check re-renders subscribers.

export interface AnalyticsEntry {
  status: GoogleAnalyticsStatus
  error: Error | undefined
}

type Gtag = (...args: unknown[]) => void

const cache = new Map<string, AnalyticsEntry>()
const listenersById = new Map<string, Set<() => void>>()

/** Stable snapshots for `useSyncExternalStore`. */
const SERVER_ENTRY: AnalyticsEntry = { status: 'pending', error: undefined }
export const DISABLED_ENTRY: AnalyticsEntry = { status: 'disabled', error: undefined }

const SCRIPT_DOM_ID_PREFIX = 'luwio-ga-'

function notify(id: string) {
  listenersById.get(id)?.forEach((listener) => {
    listener()
  })
}

/**
 * Ensures `window.dataLayer` and the `gtag` shim exist, returning `gtag`. Defining these up front
 * means events pushed before gtag.js finishes downloading are queued and flushed once it loads.
 */
function ensureGtag(): Gtag {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag }
  if (!w.dataLayer) w.dataLayer = []
  if (!w.gtag) {
    // gtag.js reads each dataLayer entry as an argument list; an array is array-like and works.
    w.gtag = (...args: unknown[]) => {
      w.dataLayer?.push(args)
    }
  }
  return w.gtag
}

function injectScript(options: GoogleAnalyticsOptions): void {
  const id = options.measurementId
  const gtag = ensureGtag()
  // Bootstrap config immediately — safe to call before the script exists (it queues).
  gtag('js', new Date())
  gtag('config', id, options.config ?? {})

  const domId = SCRIPT_DOM_ID_PREFIX + id
  if (document.getElementById(domId)) return // already injected for this id

  const script = document.createElement('script')
  script.id = domId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  if (options.nonce) script.nonce = options.nonce
  script.onload = () => {
    cache.set(id, { status: 'success', error: undefined })
    notify(id)
  }
  script.onerror = () => {
    cache.set(id, {
      status: 'error',
      error: new Error(`Failed to load the Google Analytics (gtag.js) script for ${id}.`),
    })
    notify(id)
  }
  document.head.appendChild(script)
}

/** Returns the shared entry for `id`, injecting gtag.js if this is the first request for it. */
export function ensureAnalytics(options: GoogleAnalyticsOptions): AnalyticsEntry {
  if (typeof document === 'undefined') return SERVER_ENTRY
  const id = options.measurementId
  const existing = cache.get(id)
  if (existing) return existing
  const entry: AnalyticsEntry = { status: 'pending', error: undefined }
  cache.set(id, entry)
  injectScript(options)
  return entry
}

/** A stable reference for `useSyncExternalStore`'s `getServerSnapshot`. */
export function getAnalyticsServerSnapshot(): AnalyticsEntry {
  return SERVER_ENTRY
}

/** Discards any cached entry for `id`, removes the injected script, and loads it again. */
export function retryAnalytics(options: GoogleAnalyticsOptions): void {
  const id = options.measurementId
  cache.delete(id)
  document.getElementById(SCRIPT_DOM_ID_PREFIX + id)?.remove()
  ensureAnalytics(options)
  notify(id)
}

export function subscribeAnalytics(id: string, listener: () => void): () => void {
  const existing = listenersById.get(id)
  const set = existing ?? new Set<() => void>()
  if (!existing) listenersById.set(id, set)
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

/** Send a GA4 event. Queued on `dataLayer` until gtag.js is ready. */
export function sendEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  ensureGtag()('event', event, params ?? {})
}

/** Send a `page_view` event for `path` (defaults to the current location), scoped to `id`. */
export function sendPageview(id: string, path?: string): void {
  if (typeof window === 'undefined') return
  ensureGtag()('event', 'page_view', {
    page_path: path ?? window.location.pathname,
    send_to: id,
  })
}

/**
 * Test-only: clears all module state (cache, listeners) and the `gtag`/`dataLayer` globals. A test
 * file runs many isolated scenarios in one process; without this, gtag state would leak between them.
 */
export function __resetAnalyticsForTests(): void {
  cache.clear()
  listenersById.clear()
  if (typeof document !== 'undefined') {
    for (const el of document.querySelectorAll(`script[id^="${SCRIPT_DOM_ID_PREFIX}"]`)) el.remove()
  }
  if (typeof window === 'undefined') return
  const w = window as unknown as Record<string, unknown>
  w.dataLayer = undefined
  w.gtag = undefined
}
