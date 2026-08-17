# @luwio/google

Google web-platform integrations for React — **one namespace per library**, so you only import
what you use.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

```ts
import { GoogleMaps, useGoogleMaps } from '@luwio/google/map'
import { GoogleAnalytics, useAnalytics } from '@luwio/google/analytics'
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
import { GoogleMaps } from '@luwio/google/map'

function App() {
  return (
    <GoogleMaps apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMaps>
  )
}

function MapSection() {
  return (
    <GoogleMaps.import libraries={['maps', 'marker']}>
      {(api, libraries) => {
        if (api.isError) return <button onClick={api.retry}>Retry</button>
        if (api.isPending) return <p>Loading map…</p>
        const { Map } = libraries.maps as google.maps.MapsLibrary
        // …instantiate your map with the loaded namespace
        return <div id="map" />
      }}
    </GoogleMaps.import>
  )
}
```

### Hooks

Both `<GoogleMaps.import>` and `<GoogleMaps.importSuspense>` are thin wrappers over
hooks you can use directly:

```tsx
// TanStack-Query-style states
const { api, libraries } = useGoogleMaps(['places'])

// Suspense variant — suspends until ready, throws to an error boundary on failure
const { libraries } = useSuspenseGoogleMaps(['places'])
```

### API surface (`/map`)

- `GoogleMaps` — loads the base script + provides config. Statics: `.import`, `.importSuspense`.
- `useGoogleMaps(libraries)` → `{ api, libraries }` (status + loaded namespaces).
- `useSuspenseGoogleMaps(libraries)` → `{ libraries }` (suspends until ready).
- `GOOGLE_MAPS_LIBRARY_NAMES` — every known library name.

## `@luwio/google/analytics`

Google Analytics 4 (gtag.js) loading for React. Loads the script once per Measurement ID and
queues events fired before it's ready.

### Consent-gated tracking

A single **`consent` prop** controls whether — and how — analytics runs. It's a gate you own
(managing consent itself is out of scope — wire it to your cookie banner / CMP):

- `true` (or omitted): load gtag.js and send everything.
- `false`: never load gtag.js; every tracking call is a plain void no-op.
- an **object of per-category booleans**: load gtag.js but gate storage via Consent Mode v2 (below).

```tsx
import { useState } from 'react'
import { GoogleAnalytics, useAnalytics } from '@luwio/google/analytics'

function App() {
  const [consent, setConsent] = useState(false) // ← from your consent banner
  return (
    <GoogleAnalytics measurementId="G-XXXXXXXXXX" consent={consent}>
      <button onClick={() => setConsent(true)}>Accept analytics</button>
      <SignUpButton />
    </GoogleAnalytics>
  )
}

function SignUpButton() {
  const { track } = useAnalytics()
  // No-op until consent is true; starts sending the moment it is.
  return <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
}
```

`useAnalytics()` returns the load state plus a consent-gated action set — all no-ops when off:

```tsx
const { track, pageview, identify, setUserProperties, gtag } = useAnalytics()

track('purchase', { value: 42, currency: 'EUR' }) // gtag('event', 'purchase', …)
pageview('/pricing')                               // gtag('event', 'page_view', …)
identify('u_123')                                  // GA4 user_id (null to clear)
setUserProperties({ plan: 'pro' })                 // gtag('set', 'user_properties', …)
gtag('event', 'custom', { any: 'thing' })          // raw escape hatch
```

### Consent Mode v2 (granular)

A boolean `consent` is enough for analytics-only apps. For per-category consent — Google Ads, or
EEA traffic where Google requires it — pass an **object of per-category booleans**. Each maps to a
Consent Mode v2 signal (`true` → granted, `false` → denied), applied as `gtag('consent', 'default',
…)` before config and re-sent as an `update` whenever it changes (or call `updateConsent()`).

```tsx
<GoogleAnalytics
  measurementId="G-XXXXXXXXXX"
  consent={{
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
    analytics_storage: false,
    wait_for_update: 500,
  }}
>
  <App />
</GoogleAnalytics>

// later, from your consent banner:
const { updateConsent } = useAnalytics()
updateConsent({ analytics_storage: true, ad_storage: true })
```

`consent={false}` is a hard gate (gtag.js never loads); an object keeps it loaded but tells Google
what's allowed, so denied traffic still yields cookieless pings and modeling. One prop covers both.

### API surface (`/analytics`)

- `GoogleAnalytics` — loads gtag.js + provides config (`measurementId`, `consent`, `config`, `nonce`).
- `useAnalytics()` → `{ status, isReady, error, enabled, track, pageview, identify, setUserProperties, updateConsent, gtag, retry }`.
  Every action is a void no-op while `enabled` is `false`.
