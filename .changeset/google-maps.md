---
"@luwio/google-maps": minor
---

Initial release of `@luwio/google-maps`: reliable Google Maps JS API loading for React. The base
script and each library load exactly once page-wide via a shared cache, with lazy per-library
`importLibrary` loading through `<GoogleMaps>` (+ `.import` / `.importSuspense`) and the
`useGoogleMaps` / `useSuspenseGoogleMaps` hooks, reporting TanStack-Query-style states.
