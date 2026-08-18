# @luwio/google-maps

Reliable Google Maps JS API loading for React. The base script and each library load exactly once
page-wide through a shared cache; libraries load lazily via `google.maps.importLibrary`, each
tracked independently with TanStack-Query-style states.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> Ported and restructured from [`@tacky-org/googlemaps`](https://github.com/tacky-org/GoogleMaps).

## Install

```bash
npm install @luwio/google-maps
```

React 18+ is a peer dependency.

## Usage

```tsx
import { GoogleMaps } from '@luwio/google-maps'

function App() {
  return (
    <GoogleMaps apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMaps>
  )
}

function MapSection() {
  // Load libraries close to where they're used — the cache dedups.
  return (
    <GoogleMaps.import libraries={['maps', 'marker']}>
      {(api, libraries) => {
        if (api.isError) return <button onClick={api.retry}>Retry</button>
        if (api.isPending) return <p>Loading map…</p>
        const { Map } = libraries.maps as google.maps.MapsLibrary
        return <MapCanvas Map={Map} />
      }}
    </GoogleMaps.import>
  )
}
```

`<GoogleMaps.importSuspense>` is the Suspense variant. Both are thin wrappers over the
`useGoogleMaps` / `useSuspenseGoogleMaps` hooks, which you can use directly.

## API surface

- `GoogleMaps` — loads the base script + provides config. Statics: `.import`, `.importSuspense`.
- `useGoogleMaps(libraries)` → `{ api, libraries }` (load state + loaded namespaces, keyed by name).
- `useSuspenseGoogleMaps(libraries)` → `{ libraries }` (suspends until ready).
- `GOOGLE_MAPS_LIBRARY_NAMES` — every known Google Maps library name.
