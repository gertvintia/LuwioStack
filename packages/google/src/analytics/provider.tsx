import { useEffect } from 'react'
import { GoogleAnalyticsContext } from './context'
import { ensureAnalytics } from './gtag'
import type { GoogleAnalyticsProviderProps } from './types'

/**
 * Loads Google Analytics (gtag.js) once for its Measurement ID and provides the config to
 * descendants. Read the load state and fire events with the `useAnalytics` hook.
 *
 * A separate product from `@luwio/google/map` — its own script and credential — so it has its own
 * provider. Nest both when an app uses maps and analytics together.
 *
 * @example
 * <GoogleAnalyticsProvider measurementId="G-XXXXXXXXXX">
 *   <App />
 * </GoogleAnalyticsProvider>
 */
export function GoogleAnalyticsProvider({ children, ...options }: GoogleAnalyticsProviderProps) {
  const enabled = options.enabled !== false
  const key = options.measurementId

  // Start loading gtag.js the moment the provider mounts (unless disabled).
  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via measurementId/enabled
  useEffect(() => {
    if (enabled) ensureAnalytics(options)
  }, [key, enabled])
  if (enabled) ensureAnalytics(options)

  return (
    <GoogleAnalyticsContext.Provider value={options}>{children}</GoogleAnalyticsContext.Provider>
  )
}
GoogleAnalyticsProvider.displayName = 'GoogleAnalyticsProvider'
