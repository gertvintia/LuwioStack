import { useEffect, useRef } from 'react'
import { GoogleAnalyticsContext } from './context'
import { consentSignals, ensureAnalytics, updateConsent } from './gtag'
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
  // Serialize the consent prop so an inline object literal doesn't fire an update every render.
  const consentKey = options.consent ? JSON.stringify(options.consent) : ''

  // Start loading gtag.js the moment the provider mounts (unless disabled). The initial Consent
  // Mode `default` is applied inside ensureAnalytics, before the config command.
  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via measurementId/enabled
  useEffect(() => {
    if (enabled) ensureAnalytics(options)
  }, [key, enabled])
  if (enabled) ensureAnalytics(options)

  // Push a Consent Mode `update` whenever the consent prop changes after the initial default.
  const lastConsentKey = useRef(consentKey)
  // biome-ignore lint/correctness/useExhaustiveDependencies: options.consent captured via consentKey
  useEffect(() => {
    if (!enabled || consentKey === lastConsentKey.current) return
    lastConsentKey.current = consentKey
    if (options.consent) updateConsent(consentSignals(options.consent))
  }, [enabled, consentKey])

  return (
    <GoogleAnalyticsContext.Provider value={options}>{children}</GoogleAnalyticsContext.Provider>
  )
}
GoogleAnalyticsProvider.displayName = 'GoogleAnalyticsProvider'
