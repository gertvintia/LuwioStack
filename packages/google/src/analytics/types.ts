import type { ReactNode } from 'react'

// ── Options ────────────────────────────────────────────────────────────────────

export interface GoogleAnalyticsOptions {
  /** GA4 Measurement ID, e.g. `"G-XXXXXXXXXX"`. */
  measurementId: string
  /**
   * When `false`, the gtag.js script is never loaded and every tracking call is a no-op —
   * handy for disabling analytics in development or until consent is granted. @default true
   */
  enabled?: boolean
  /** Extra params forwarded to `gtag('config', id, …)`, e.g. `{ anonymize_ip: true }`. */
  config?: Record<string, unknown>
  /** Optional `nonce` for the injected `<script>` (Content-Security-Policy). */
  nonce?: string
}

export type GoogleAnalyticsContextValue = GoogleAnalyticsOptions

export interface GoogleAnalyticsProviderProps extends GoogleAnalyticsOptions {
  children: ReactNode
}

// ── Load state ───────────────────────────────────────────────────────────────

export type GoogleAnalyticsStatus = 'pending' | 'success' | 'error' | 'disabled'

/** What `useAnalytics` returns: the gtag.js load state plus tracking actions. */
export interface GoogleAnalyticsApi {
  status: GoogleAnalyticsStatus
  /** `true` while the gtag.js script is still loading. */
  isPending: boolean
  /** `true` once gtag.js has loaded. */
  isSuccess: boolean
  /** `true` if the gtag.js script failed to load. */
  isError: boolean
  /** `true` when `enabled: false` — tracking calls are no-ops. */
  isDisabled: boolean
  /** The load failure once `status` is `"error"`, else `undefined`. */
  error: Error | undefined
  /**
   * Whether tracking is currently on — i.e. the provider's `enabled` (consent) flag. When `false`,
   * `track`, `pageview`, `set` and `gtag` are all void no-ops. Read this to reflect consent in the UI.
   */
  enabled: boolean
  /**
   * Send a GA4 event — `gtag('event', name, params)`. Events fired before the script finishes
   * loading are queued on `dataLayer` and flushed once it's ready. **No-op when disabled.**
   */
  track: (event: string, params?: Record<string, unknown>) => void
  /** Send a `page_view` event for `path` (defaults to the current location). No-op when disabled. */
  pageview: (path?: string, params?: Record<string, unknown>) => void
  /** Set global/user params — `gtag('set', params)`. No-op when disabled. */
  set: (params: Record<string, unknown>) => void
  /** Raw gated passthrough to `gtag(...args)` for anything without a dedicated helper. No-op when disabled. */
  gtag: (...args: unknown[]) => void
  /** Discard a failed load and inject the script again. No-op unless `status` is `"error"`. */
  retry: () => void
}
