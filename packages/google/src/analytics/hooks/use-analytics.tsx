import { useCallback, useSyncExternalStore } from 'react'
import {
  DISABLED_ENTRY,
  ensureAnalytics,
  getAnalyticsServerSnapshot,
  retryAnalytics,
  subscribeAnalytics,
} from '../gtag'
import type { GoogleAnalyticsResult } from '../types'
import { useAnalyticsActions } from './use-analytics-actions'
import { useGoogleAnalyticsContext } from './use-google-analytics-context'

/**
 * Reports the gtag.js load state under `api` (TanStack-Query-style, mirroring `useGoogleMaps`) and
 * returns the tracking actions alongside it. Must be rendered inside `<GoogleAnalytics>`.
 *
 * @example
 * const { api, track } = useAnalytics()
 * if (api.isSuccess) track('sign_up', { method: 'google' })
 */
export function useAnalytics(): GoogleAnalyticsResult {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via id/enabled
  const retry = useCallback(() => {
    if (enabled) retryAnalytics(options)
  }, [id, enabled])

  const actions = useAnalyticsActions(enabled, id)
  const status = entry.status

  return {
    api: {
      status,
      isPending: status === 'pending',
      isLoading: status === 'pending',
      isSuccess: status === 'success',
      isError: status === 'error',
      isDisabled: status === 'disabled',
      enabled,
      error: entry.error,
      retry,
    },
    ...actions,
  }
}
