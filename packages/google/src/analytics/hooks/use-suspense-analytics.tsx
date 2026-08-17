import { useCallback, useSyncExternalStore } from 'react'
import {
  DISABLED_ENTRY,
  ensureAnalytics,
  getAnalyticsServerSnapshot,
  subscribeAnalytics,
} from '../gtag'
import type { GoogleAnalyticsSuspenseResult } from '../types'
import { useAnalyticsActions } from './use-analytics-actions'
import { useGoogleAnalyticsContext } from './use-google-analytics-context'

/**
 * Suspense-compatible variant of `useAnalytics`, mirroring `useSuspenseGoogleMaps` in the `/map`
 * namespace. Suspends the nearest `<Suspense>` boundary while gtag.js loads and throws to the
 * nearest error boundary on failure, then returns just the tracking actions.
 *
 * When `consent` is `false` it never suspends — the actions are returned as void no-ops.
 *
 * @example
 * const { track } = useSuspenseAnalytics()
 * track('sign_up')
 */
export function useSuspenseAnalytics(): GoogleAnalyticsSuspenseResult {
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

  // All hooks are called before any suspending throw.
  const actions = useAnalyticsActions(enabled, id)

  if (enabled) {
    if (entry.status === 'pending') throw entry.suspender
    if (entry.status === 'error') throw entry.error
  }

  return actions
}
