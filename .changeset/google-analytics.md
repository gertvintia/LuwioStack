---
"@luwio/google-analytics": minor
---

Initial release of `@luwio/google-analytics`: Google Analytics 4 (gtag.js) loading for React.
Loads the script once per Measurement ID and queues events fired before it's ready. A single
`consent` prop gates tracking — pass a boolean (hard on/off) or an object of per-category booleans
for Google Consent Mode v2. `useAnalytics()` returns the load state under `api` (mirroring
`useGoogleMaps`) plus consent-gated actions (`track`, `pageview`, `identify`, `setUserProperties`,
`updateConsent`, `gtag`); `useSuspenseAnalytics()` is the Suspense variant.
