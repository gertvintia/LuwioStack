import type { ConsentOptions, GoogleAnalyticsOptions, GoogleAnalyticsStatus } from './types'

type ConsentValue = 'granted' | 'denied'

// A module-level (not React-context) store for the gtag.js script, mirroring the /map cache:
// gtag.js is a page-wide singleton keyed by Measurement ID, so every useAnalytics() for the
// same id shares one script tag and one load. Entries are replaced (not mutated) on each status
// transition so useSyncExternalStore's Object.is check re-renders subscribers.

export interface AnalyticsEntry {
  status: GoogleAnalyticsStatus
  error: Error | undefined
  /**
   * Settles once the load finishes, success or failure — never rejects. `useSuspenseAnalytics`
   * throws this while pending so Suspense has a promise to await.
   */
  suspender: Promise<void>
}

type Gtag = (...args: unknown[]) => void

const cache = new Map<string, AnalyticsEntry>()
const listenersById = new Map<string, Set<() => void>>()

/** Stable snapshots for `useSyncExternalStore`. */
const SERVER_ENTRY: AnalyticsEntry = {
  status: 'pending',
  error: undefined,
  suspender: new Promise(() => {}),
}
export const DISABLED_ENTRY: AnalyticsEntry = {
  status: 'disabled',
  error: undefined,
  suspender: Promise.resolve(),
}

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

function startLoad(options: GoogleAnalyticsOptions): AnalyticsEntry {
  const id = options.measurementId
  let settle: () => void = () => {}
  const suspender = new Promise<void>((resolve) => {
    settle = resolve
  })

  const gtag = ensureGtag()
  // Consent Mode defaults MUST be set before any config command — do it first. Only granular
  // (object) consent produces signals; a boolean gate loads/doesn't-load without Consent Mode.
  if (options.consent && typeof options.consent === 'object') {
    gtag('consent', 'default', toConsentDefault(options.consent))
  }
  // Bootstrap config immediately — safe to call before the script exists (it queues).
  gtag('js', new Date())
  gtag('config', id, options.config ?? {})

  // Replaces the pending entry wholesale on settle so useSyncExternalStore re-renders, and
  // resolves the suspender so any Suspense boundary retries.
  const finish = (status: 'success' | 'error', error?: Error) => {
    cache.set(id, { status, error, suspender })
    settle()
    notify(id)
  }

  const domId = SCRIPT_DOM_ID_PREFIX + id
  if (document.getElementById(domId)) {
    // Already injected (by us, or a hand-placed tag) — adopt it as ready rather than hang.
    cache.set(id, { status: 'pending', error: undefined, suspender })
    finish('success')
    return cache.get(id) as AnalyticsEntry
  }

  const script = document.createElement('script')
  script.id = domId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  if (options.nonce) script.nonce = options.nonce
  script.onload = () => finish('success')
  script.onerror = () =>
    finish('error', new Error(`Failed to load the Google Analytics (gtag.js) script for ${id}.`))
  document.head.appendChild(script)

  const entry: AnalyticsEntry = { status: 'pending', error: undefined, suspender }
  cache.set(id, entry)
  return entry
}

/** Returns the shared entry for `id`, injecting gtag.js if this is the first request for it. */
export function ensureAnalytics(options: GoogleAnalyticsOptions): AnalyticsEntry {
  if (typeof document === 'undefined') return SERVER_ENTRY
  return cache.get(options.measurementId) ?? startLoad(options)
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

/**
 * Forward a raw `gtag(...)` call — the single low-level primitive every tracking action is built
 * on. Queued on `dataLayer` until gtag.js is ready. Consent gating lives in the hook, not here:
 * this only runs when a caller decides it should.
 */
export function callGtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return
  ensureGtag()(...args)
}

const CONSENT_SIGNAL_KEYS = [
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'analytics_storage',
  'functionality_storage',
  'personalization_storage',
  'security_storage',
] as const

function toSignal(value: boolean | undefined): ConsentValue | undefined {
  return value === undefined ? undefined : value ? 'granted' : 'denied'
}

/** Map boolean consent options to a gtag `consent` 'default' payload (signals + wait_for_update/region). */
export function toConsentDefault(consent: ConsentOptions): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of CONSENT_SIGNAL_KEYS) {
    const signal = toSignal(consent[key])
    if (signal !== undefined) out[key] = signal
  }
  if (consent.wait_for_update !== undefined) out.wait_for_update = consent.wait_for_update
  if (consent.region !== undefined) out.region = consent.region
  return out
}

/** Push a Consent Mode v2 update from booleans — `gtag('consent', 'update', signals)`. */
export function updateConsent(consent: ConsentOptions): void {
  if (typeof window === 'undefined') return
  const signals: Record<string, ConsentValue> = {}
  for (const key of CONSENT_SIGNAL_KEYS) {
    const signal = toSignal(consent[key])
    if (signal !== undefined) signals[key] = signal
  }
  ensureGtag()('consent', 'update', signals)
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
