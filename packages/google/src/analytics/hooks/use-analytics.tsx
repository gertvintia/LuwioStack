import { useCallback, useSyncExternalStore } from 'react'
import {
  callGtag,
  DISABLED_ENTRY,
  ensureAnalytics,
  getAnalyticsServerSnapshot,
  updateConsent as pushConsentUpdate,
  retryAnalytics,
  subscribeAnalytics,
} from '../gtag'
import type { ConsentOptions, GoogleAnalyticsApi } from '../types'
import { useGoogleAnalyticsContext } from './use-google-analytics-context'

/**
 * Reports the gtag.js load state and returns tracking actions. Must be rendered inside
 * `<GoogleAnalytics>` — the Measurement ID is read from context. Every action is a void no-op
 * while `enabled` is `false`.
 *
 * @example
 * const { track, isReady } = useAnalytics()
 * <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
 */
export function useAnalytics(): GoogleAnalyticsApi {
  const options = useGoogleAnalyticsContext()
  const enabled = options.consent !== false
  const id = options.measurementId

  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeAnalytics(id, onStoreChange),
    [id],
  )
  const entry = useSyncExternalStore(
    subscribe,
    () => (enabled ? ensureAnalytics(options) : DISABLED_ENTRY),
    getAnalyticsServerSnapshot,
  )

  // Every action is gated on `enabled` (the provider's consent flag). When consent is off each is
  // a plain void no-op — nothing reaches gtag/dataLayer, so no events fire and no hits are sent.
  const track = useCallback(
    (event: string, params?: Record<string, unknown>) => {
      if (!enabled) return
      callGtag('event', event, params ?? {})
    },
    [enabled],
  )

  const pageview = useCallback(
    (path?: string, params?: Record<string, unknown>) => {
      if (!enabled) return
      const page_path =
        path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined)
      callGtag('event', 'page_view', { page_path, send_to: id, ...params })
    },
    [enabled, id],
  )

  const identify = useCallback(
    (userId: string | null) => {
      if (!enabled) return
      callGtag('set', { user_id: userId })
    },
    [enabled],
  )

  const setUserProperties = useCallback(
    (properties: Record<string, unknown>) => {
      if (!enabled) return
      callGtag('set', 'user_properties', properties)
    },
    [enabled],
  )

  const updateConsent = useCallback(
    (consent: ConsentOptions) => {
      if (!enabled) return
      pushConsentUpdate(consent)
    },
    [enabled],
  )

  const gtag = useCallback(
    (...args: unknown[]) => {
      if (!enabled) return
      callGtag(...args)
    },
    [enabled],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via id/enabled
  const retry = useCallback(() => {
    if (enabled) retryAnalytics(options)
  }, [id, enabled])

  const status = entry.status
  return {
    status,
    isReady: status === 'success',
    error: entry.error,
    enabled,
    track,
    pageview,
    identify,
    setUserProperties,
    updateConsent,
    gtag,
    retry,
  }
}
