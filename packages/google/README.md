# @luwio/google

Google web-platform integrations for React — **one namespace per library**, so you only import
what you use.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

```ts
import { GoogleMapsProvider, useGoogleMaps } from '@luwio/google/map'
```

Future Google libraries follow the same pattern (`@luwio/google/places`,
`@luwio/google/analytics`, …). The package root exports no library code — always import from a
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

## API surface (`/map`)

- `GoogleMapsProvider` — loads the base script + provides config. Statics: `.Import`, `.ImportSuspense`.
- `useGoogleMaps(libraries)` → `{ api, libraries }` (status + loaded namespaces).
- `useSuspenseGoogleMaps(libraries)` → `{ libraries }` (suspends until ready).
- `GOOGLE_MAPS_LIBRARY_NAMES` — every known library name.
