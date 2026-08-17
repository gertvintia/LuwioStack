import { useEffect, useRef } from 'react'
import { GoogleAnalyticsContext } from './context'
import { ensureAnalytics, updateConsent } from './gtag'
import type { GoogleAnalyticsProps } from './types'

/**
 * Loads Google Analytics (gtag.js) once for its Measurement ID and provides the config to
 * descendants. Read the load state and fire events with the `useAnalytics` hook.
 *
 * A separate product from `@luwio/google/map` — its own script and credential — so it has its own
 * provider. Nest both when an app uses maps and analytics together.
 *
 * @example
 * <GoogleAnalytics measurementId="G-XXXXXXXXXX">
 *   <App />
 * </GoogleAnalytics>
 */
export function GoogleAnalytics({ children, ...options }: GoogleAnalyticsProps) {
  const { consent } = options
  const enabled = consent !== false
  const key = options.measurementId
  // Serialize granular (object) consent so an inline literal doesn't fire an update every render.
  const consentKey = consent && typeof consent === 'object' ? JSON.stringify(consent) : ''

  // Start loading gtag.js the moment the provider mounts (unless disabled). The initial Consent
  // Mode `default` is applied inside ensureAnalytics, before the config command.
  // biome-ignore lint/correctness/useExhaustiveDependencies: options captured via measurementId/enabled
  useEffect(() => {
    if (enabled) ensureAnalytics(options)
  }, [key, enabled])
  if (enabled) ensureAnalytics(options)

  // Push a Consent Mode `update` whenever granular consent changes after the initial default.
  const lastConsentKey = useRef(consentKey)
  // biome-ignore lint/correctness/useExhaustiveDependencies: consent captured via consentKey
  useEffect(() => {
    if (!enabled || consentKey === lastConsentKey.current) return
    lastConsentKey.current = consentKey
    if (consent && typeof consent === 'object') updateConsent(consent)
  }, [enabled, consentKey])

  return (
    <GoogleAnalyticsContext.Provider value={options}>{children}</GoogleAnalyticsContext.Provider>
  )
}
GoogleAnalytics.displayName = 'GoogleAnalytics'
