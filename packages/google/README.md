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

### Consent-gated tracking

The provider's `enabled` flag is a **consent gate you control** (managing consent itself is out of
scope — wire `enabled` to your own cookie banner / CMP). When it's `false`, gtag.js is never loaded
and every tracking call is a plain void no-op; flip it to `true` and the same calls start sending.

```tsx
import { useState } from 'react'
import { GoogleAnalyticsProvider, useAnalytics } from '@luwio/google/analytics'

function App() {
  const [consent, setConsent] = useState(false) // ← from your consent banner
  return (
    <GoogleAnalyticsProvider measurementId="G-XXXXXXXXXX" enabled={consent}>
      <button onClick={() => setConsent(true)}>Accept analytics</button>
      <SignUpButton />
    </GoogleAnalyticsProvider>
  )
}

function SignUpButton() {
  const { track } = useAnalytics()
  // No-op until consent is granted; starts sending the moment it is.
  return <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
}
```

`useAnalytics()` returns the load state plus a consent-gated action set — all no-ops when disabled:

```tsx
const { enabled, track, pageview, set, gtag } = useAnalytics()

track('purchase', { value: 42, currency: 'EUR' }) // gtag('event', 'purchase', …)
pageview('/pricing')                               // gtag('event', 'page_view', …)
set({ user_id: 'u_123' })                          // gtag('set', …)
gtag('event', 'custom', { any: 'thing' })          // raw escape hatch
```

### Consent Mode v2 (granular)

On/off (`enabled`) is enough for analytics-only apps. For per-category consent — Google Ads, or
EEA traffic where Google requires it — pass the `consent` prop: the full Consent Mode v2 signal
set. It's applied as `gtag('consent', 'default', …)` before config and re-sent as an `update`
whenever it changes (or call `updateConsent()` from the hook).

```tsx
<GoogleAnalyticsProvider
  measurementId="G-XXXXXXXXXX"
  consent={{
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  }}
>
  <App />
</GoogleAnalyticsProvider>

// later, from your consent banner:
const { updateConsent } = useAnalytics()
updateConsent({ analytics_storage: 'granted', ad_storage: 'granted' })
```

`enabled` vs `consent`: `enabled` is a hard gate (gtag.js loads or it doesn't); `consent` keeps it
loaded but tells Google what's allowed, so denied traffic still yields cookieless pings and
modeling. Use whichever your compliance needs — or both.

### API surface (`/analytics`)

- `GoogleAnalyticsProvider` — loads gtag.js + provides config (`measurementId`, `enabled`, `consent`, `config`, `nonce`).
- `useAnalytics()` → `{ status, isSuccess, isError, isDisabled, error, enabled, track, pageview, set, gtag, updateConsent, retry }`.
  Every action is a void no-op while `enabled` is `false`.
