# @luwio/google-analytics

Google Analytics 4 (gtag.js) loading for React. Loads the script once per Measurement ID, queues
events fired before it's ready, and gates everything behind a single consent prop.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

## Install

```bash
npm install @luwio/google-analytics
```

React 18+ is a peer dependency.

## Consent-gated tracking

A single **`consent` prop** controls whether — and how — analytics runs (managing consent itself is
out of scope — wire it to your cookie banner / CMP):

- `true` (or omitted): load gtag.js and send everything.
- `false`: never load gtag.js; every tracking call is a plain void no-op.
- an **object of per-category booleans**: load gtag.js but gate storage via Consent Mode v2 (below).

```tsx
import { useState } from 'react'
import { GoogleAnalytics, useAnalytics } from '@luwio/google-analytics'

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

`useAnalytics()` returns the load state under `api` (mirroring `useGoogleMaps`) plus a
consent-gated action set — all no-ops when off:

```tsx
const { api, track, pageview, identify, setUserProperties, gtag } = useAnalytics()

api.status // 'pending' | 'success' | 'error' | 'disabled'
api.isSuccess, api.isError, api.error, api.retry

track('purchase', { value: 42, currency: 'EUR' }) // gtag('event', 'purchase', …)
pageview('/pricing')                               // gtag('event', 'page_view', …)
identify('u_123')                                  // GA4 user_id (null to clear)
setUserProperties({ plan: 'pro' })                 // gtag('set', 'user_properties', …)
gtag('event', 'custom', { any: 'thing' })          // raw escape hatch
```

There's a Suspense variant too — it suspends until gtag.js is ready and returns just the actions:

```tsx
const { track } = useSuspenseAnalytics()
```

## Consent Mode v2 (granular)

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

## API surface

- `GoogleAnalytics` — loads gtag.js + provides config (`measurementId`, `consent`, `config`, `nonce`).
- `useAnalytics()` → `{ api, track, pageview, identify, setUserProperties, updateConsent, gtag }`, where
  `api` = `{ status, isPending, isLoading, isSuccess, isError, isDisabled, enabled, error, retry }`.
- `useSuspenseAnalytics()` → the actions only; suspends until ready, throws on failure.
