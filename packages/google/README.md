# @luwio/google

Google web-platform integrations for React — **one namespace per library**, so you only import
what you use.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

```ts
import { GoogleMapsProvider, useGoogleMaps } from '@luwio/google/map'
import { GoogleAnalyticsProvider, useAnalytics } from '@luwio/google/analytics'
```

Each namespace is a **separate Google product** — its own script, credential and provider — so
each ships its own `<…Provider>`. Nest the ones you use; there is no shared root provider because
there is nothing shared to configure. Future libraries follow the same pattern
(`@luwio/google/places`, …). The package root exports no library code — always import from a
namespace.

> Maps loading ported and restructured from [`@tacky-org/googlemaps`](https://github.com/tacky-org/GoogleMaps).

## Install

```bash
npm install @luwio/google
```

React 18+ is a peer dependency.

## `@luwio/google/map`

Reliable Google Maps loading: the base JS API script and each library load exactly once
page-wide (a shared cache dedups across every consumer). Libraries load lazily via
`google.maps.importLibrary`, each tracked independently with TanStack-Query-style states.

```tsx
import { GoogleMapsProvider } from '@luwio/google/map'

function App() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMapsProvider>
  )
}

function MapSection() {
  return (
    <GoogleMapsProvider.Import libraries={['maps', 'marker']}>
      {(api, libraries) => {
        if (api.isError) return <button onClick={api.retry}>Retry</button>
        if (api.isPending) return <p>Loading map…</p>
        const { Map } = libraries.maps as google.maps.MapsLibrary
        // …instantiate your map with the loaded namespace
        return <div id="map" />
      }}
    </GoogleMapsProvider.Import>
  )
}
```

### Hooks

Both `<GoogleMapsProvider.Import>` and `<GoogleMapsProvider.ImportSuspense>` are thin wrappers over
hooks you can use directly:

```tsx
// TanStack-Query-style states
const { api, libraries } = useGoogleMaps(['places'])

// Suspense variant — suspends until ready, throws to an error boundary on failure
const { libraries } = useSuspenseGoogleMaps(['places'])
```

### API surface (`/map`)

- `GoogleMapsProvider` — loads the base script + provides config. Statics: `.Import`, `.ImportSuspense`.
- `useGoogleMaps(libraries)` → `{ api, libraries }` (status + loaded namespaces).
- `useSuspenseGoogleMaps(libraries)` → `{ libraries }` (suspends until ready).
- `GOOGLE_MAPS_LIBRARY_NAMES` — every known library name.

## `@luwio/google/analytics`

Google Analytics 4 (gtag.js) loading for React. Loads the script once per Measurement ID and
queues events fired before it's ready.

```tsx
import { GoogleAnalyticsProvider, useAnalytics } from '@luwio/google/analytics'

function App() {
  return (
    <GoogleAnalyticsProvider measurementId="G-XXXXXXXXXX">
      <SignUpButton />
    </GoogleAnalyticsProvider>
  )
}

function SignUpButton() {
  const { track } = useAnalytics()
  return <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
}
```

Pass `enabled={false}` to skip loading and make every tracking call a no-op (e.g. in dev or until
consent). `useAnalytics()` returns `{ status, isSuccess, isError, isDisabled, error, track, pageview, retry }`.

### API surface (`/analytics`)

- `GoogleAnalyticsProvider` — loads gtag.js + provides config (`measurementId`, `enabled`, `config`, `nonce`).
- `useAnalytics()` → load state plus `track(event, params)` and `pageview(path?)`.
