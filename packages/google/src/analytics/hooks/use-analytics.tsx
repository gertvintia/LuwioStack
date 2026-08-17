import { useCallback, useSyncExternalStore } from 'react'
import {
  DISABLED_ENTRY,
  ensureAnalytics,
  getAnalyticsServerSnapshot,
  retryAnalytics,
  sendEvent,
  sendPageview,
  subscribeAnalytics,
} from '../gtag'
import type { GoogleAnalyticsApi } from '../types'
import { useGoogleAnalyticsContext } from './use-google-analytics-context'

/**
 * Reports the gtag.js load state (TanStack-Query-style) and returns tracking actions. Must be
 * rendered inside `<GoogleAnalyticsProvider>` — the Measurement ID is read from context.
 *
 * @example
 * const { track, pageview, isSuccess } = useAnalytics()
 * <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
 */
export function useAnalytics(): GoogleAnalyticsApi {
  const options = useGoogleAnalyticsContext()
  const enabled = options.enabled !== false
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

  const track = useCallback(
    (event: string, params?: Record<string, unknown>) => {
      if (enabled) sendEvent(event, params)
    },
    [enabled],
  )

  const pageview = useCallback(
    (path?: string) => {
      if (enabled) sendPageview(id, path)
    },
    [id, enabled],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via id/enabled
  const retry = useCallback(() => {
    if (enabled) retryAnalytics(options)
  }, [id, enabled])

  const status = entry.status
  return {
    status,
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    isDisabled: status === 'disabled',
    error: entry.error,
    track,
    pageview,
    retry,
  }
}
