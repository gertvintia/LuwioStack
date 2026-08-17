import type { ReactNode } from 'react'

// ── Consent Mode v2 ──────────────────────────────────────────────────────────

export type ConsentValue = 'granted' | 'denied'

/**
 * The Google Consent Mode v2 consent types. Each defaults to Google's own default when omitted.
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export interface ConsentSettings {
  /** Cookies for advertising. */
  ad_storage?: ConsentValue
  /** Sending user data to Google for advertising. */
  ad_user_data?: ConsentValue
  /** Personalized advertising (e.g. remarketing). */
  ad_personalization?: ConsentValue
  /** Cookies for analytics (e.g. visit duration). */
  analytics_storage?: ConsentValue
  /** Cookies for site functionality (e.g. language). */
  functionality_storage?: ConsentValue
  /** Cookies for personalization (e.g. recommendations). */
  personalization_storage?: ConsentValue
  /** Cookies for security (e.g. auth, fraud prevention). */
  security_storage?: ConsentValue
}

/** The `gtag('consent', 'default', …)` payload — consent signals plus Consent Mode options. */
export interface ConsentDefaults extends ConsentSettings {
  /** Milliseconds to hold hits for before an `update` arrives (Consent Mode `wait_for_update`). */
  wait_for_update?: number
  /** Restrict these defaults to specific regions, ISO 3166-2 (Consent Mode `region`). */
  region?: string[]
}

// ── Options ────────────────────────────────────────────────────────────────────

export interface GoogleAnalyticsOptions {
  /** GA4 Measurement ID, e.g. `"G-XXXXXXXXXX"`. */
  measurementId: string
  /**
   * When `false`, the gtag.js script is never loaded and every tracking call is a no-op —
   * handy for disabling analytics in development or until consent is granted. @default true
   */
  enabled?: boolean
  /**
   * Google Consent Mode v2 default signals, applied via `gtag('consent', 'default', …)` **before**
   * the config command. Changing this at runtime issues a `gtag('consent', 'update', …)`. Optional —
   * omit it for a plain on/off setup (`enabled`), or set it to gate storage per Google's model
   * while still loading gtag.js (recommended for EEA traffic / Google Ads).
   */
  consent?: ConsentDefaults
  /** Extra params forwarded to `gtag('config', id, …)`, e.g. `{ anonymize_ip: true }`. */
  config?: Record<string, unknown>
  /** Optional `nonce` for the injected `<script>` (Content-Security-Policy). */
  nonce?: string
}

export type GoogleAnalyticsContextValue = GoogleAnalyticsOptions

export interface GoogleAnalyticsProps extends GoogleAnalyticsOptions {
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
  /**
   * Push a Consent Mode v2 update — `gtag('consent', 'update', settings)` — to change granted/denied
   * signals at runtime (e.g. when the user accepts). No-op when disabled. You can also drive this
   * declaratively via the provider's `consent` prop.
   */
  updateConsent: (settings: ConsentSettings) => void
  /** Discard a failed load and inject the script again. No-op unless `status` is `"error"`. */
  retry: () => void
}
