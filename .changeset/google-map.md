---
"@luwio/google": minor
---

Add the `@luwio/google/map` namespace: reliable Google Maps JS API loading for React. The base
script and each library load exactly once page-wide via a shared cache, with lazy per-library
`importLibrary` loading exposed through `<GoogleMapsProvider>` (+ `.Import` / `.ImportSuspense`)
and the `useGoogleMaps` / `useSuspenseGoogleMaps` hooks, reporting TanStack-Query-style states.

`@luwio/google` uses subpath exports (one namespace per Google library) so consumers import only
what they use — future libraries follow the same `@luwio/google/<lib>` pattern.
