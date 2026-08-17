---
"@luwio/google": minor
---

Add the `@luwio/google/map` namespace: reliable Google Maps JS API loading for React. The base
script and each library load exactly once page-wide via a shared cache, with lazy per-library
`importLibrary` loading exposed through `<GoogleMapsProvider>` (+ `.Import` / `.ImportSuspense`)
and the `useGoogleMaps` / `useSuspenseGoogleMaps` hooks, reporting TanStack-Query-style states.

Also add the `@luwio/google/analytics` namespace: Google Analytics 4 (gtag.js) loading via
`<GoogleAnalyticsProvider>` + `useAnalytics` (`track` / `pageview`), loading the script once per
Measurement ID and queuing events fired before it's ready.

`@luwio/google` uses subpath exports (one namespace per Google library, each a separate product
with its own provider) so consumers import only what they use — future libraries follow the same
`@luwio/google/<lib>` pattern.
