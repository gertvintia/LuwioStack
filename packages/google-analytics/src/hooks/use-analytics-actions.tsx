import { useCallback } from 'react'
import { callGtag, updateConsent as pushConsentUpdate } from '../gtag'
import type { ConsentOptions, GoogleAnalyticsActions } from '../types'

/**
 * The consent-gated tracking actions shared by `useAnalytics` and `useSuspenseAnalytics`. Every
 * action is a void no-op while `enabled` is `false` — nothing reaches gtag/dataLayer, so no events
 * fire and no hits are sent.
 */
export function useAnalyticsActions(enabled: boolean, id: string): GoogleAnalyticsActions {
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

  return { track, pageview, identify, setUserProperties, updateConsent, gtag }
}
