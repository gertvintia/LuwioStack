import type { ReactNode } from 'react'

// ── Consent ───────────────────────────────────────────────────────────────────

/**
 * Per-category consent as booleans — `true` = granted, `false` = denied, omitted = leave to
 * Google's own default. These map to Google Consent Mode v2 signals under the hood.
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export interface ConsentOptions {
  /** Cookies for advertising. */
  ad_storage?: boolean
  /** Sending user data to Google for advertising. */
  ad_user_data?: boolean
  /** Personalized advertising (e.g. remarketing). */
  ad_personalization?: boolean
  /** Cookies for analytics (e.g. visit duration). */
  analytics_storage?: boolean
  /** Cookies for site functionality (e.g. language). */
  functionality_storage?: boolean
  /** Cookies for personalization (e.g. recommendations). */
  personalization_storage?: boolean
  /** Cookies for security (e.g. auth, fraud prevention). */
  security_storage?: boolean
  /** ms to hold hits before an update arrives (Consent Mode `wait_for_update`). Default state only. */
  wait_for_update?: number
  /** Restrict these defaults to regions, ISO 3166-2 (Consent Mode `region`). Default state only. */
  region?: string[]
}

/**
 * Controls whether — and how — analytics runs:
 * - `true` (or omitted): load gtag.js and send everything.
 * - `false`: never load gtag.js; every tracking call becomes a void no-op.
 * - an object of per-category booleans: load gtag.js but gate storage via Google Consent Mode v2,
 *   mapping each boolean to a granted/denied signal (recommended for EEA traffic / Google Ads).
 *   Changing it at runtime issues a Consent Mode `update`.
 */
export type ConsentProp = boolean | ConsentOptions

// ── Options ────────────────────────────────────────────────────────────────────

export interface GoogleAnalyticsOptions {
  /** GA4 Measurement ID, e.g. `"G-XXXXXXXXXX"`. */
  measurementId: string
  /** Whether/how analytics runs — a boolean gate, or granular Consent Mode signals. @default true */
  consent?: ConsentProp
  /** Extra params forwarded to `gtag('config', id, …)`, e.g. `{ anonymize_ip: true }`. */
  config?: Record<string, unknown>
  /** Optional `nonce` for the injected `<script>` (Content-Security-Policy). */
  nonce?: string
}

export type GoogleAnalyticsContextValue = GoogleAnalyticsOptions

export interface GoogleAnalyticsProps extends GoogleAnalyticsOptions {
  children: ReactNode
}

// ── Load state + actions ───────────────────────────────────────────────────────

export type GoogleAnalyticsStatus = 'pending' | 'success' | 'error' | 'disabled'

/**
 * The gtag.js load state, in the shape of a TanStack-Query-style result — mirrors the `api` object
 * of `useGoogleMaps` in the `/map` namespace.
 */
export interface GoogleAnalyticsApi {
  /** `'pending'` while loading, `'success'` once loaded, `'error'` on failure, `'disabled'` when off. */
  status: GoogleAnalyticsStatus
  /** `true` while gtag.js is still loading. */
  isPending: boolean
  /** `true` while gtag.js is actively fetching (same as `isPending` for a single script). */
  isLoading: boolean
  /** `true` once gtag.js has loaded. */
  isSuccess: boolean
  /** `true` if the gtag.js script failed to load. */
  isError: boolean
  /** `true` when `consent` is `false` — tracking is off and nothing loads. */
  isDisabled: boolean
  /** `true` unless `consent` is `false`. */
  enabled: boolean
  /** The load failure once `status` is `'error'`, else `undefined`. */
  error: Error | undefined
  /** Discard a failed load and inject the script again. No-op unless `status` is `'error'`. */
  retry: () => void
}

/** The consent-gated tracking actions — all void no-ops while `api.enabled` is `false`. */
export interface GoogleAnalyticsActions {
  /** Send a GA4 event — `gtag('event', name, params)`. Queued on `dataLayer` until gtag.js is ready. */
  track: (event: string, params?: Record<string, unknown>) => void
  /** Send a `page_view` event for `path` (defaults to the current location). */
  pageview: (path?: string, params?: Record<string, unknown>) => void
  /** Attach a GA4 `user_id` to subsequent hits — pass `null` to clear it. */
  identify: (userId: string | null) => void
  /** Set GA4 user properties — `gtag('set', 'user_properties', properties)`. */
  setUserProperties: (properties: Record<string, unknown>) => void
  /** Push a Consent Mode v2 update from booleans, e.g. `updateConsent({ analytics_storage: true })`. */
  updateConsent: (consent: ConsentOptions) => void
  /** Raw passthrough to `gtag(...args)` for anything without a dedicated helper. */
  gtag: (...args: unknown[]) => void
}

/** What `useAnalytics` returns: the load-state `api` plus the tracking actions. */
export interface GoogleAnalyticsResult extends GoogleAnalyticsActions {
  api: GoogleAnalyticsApi
}

/**
 * What `useSuspenseAnalytics` returns: just the tracking actions. It suspends until gtag.js is
 * ready and throws to the nearest error boundary on failure, so there is no `api` to expose.
 */
export type GoogleAnalyticsSuspenseResult = GoogleAnalyticsActions
