import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'namespaces', label: 'Namespaces' },
  { id: 'usage', label: 'Loading a map' },
  { id: 'suspense', label: 'Suspense' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'api', label: 'API reference' },
]

const SETUP_CODE = `import { GoogleMaps } from '@luwio/google/map'

function App() {
  return (
    <GoogleMaps apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMaps>
  )
}`

const IMPORT_CODE = `import { GoogleMaps } from '@luwio/google/map'

function MapSection() {
  // Load libraries close to where they're used. The cache dedups, so a library
  // requested in several places still loads once.
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
}`

const SUSPENSE_CODE = `import { Suspense } from 'react'
import { GoogleMaps } from '@luwio/google/map'

// Suspends until ready; throws to the nearest error boundary on failure —
// so the render prop only ever runs with everything loaded.
<Suspense fallback={<Spinner />}>
  <GoogleMaps.importSuspense libraries={['places']}>
    {(libraries) => <PlacesSearch places={libraries.places} />}
  </GoogleMaps.importSuspense>
</Suspense>`

const HOOKS_CODE = `import { useGoogleMaps, useSuspenseGoogleMaps } from '@luwio/google/map'

// TanStack-Query-style states + the loaded namespaces
const { api, libraries } = useGoogleMaps(['geocoding'])

// …or, inside a <Suspense> boundary, the suspense variant
const { libraries } = useSuspenseGoogleMaps(['geocoding'])`

const ANALYTICS_CODE = `import { useState } from 'react'
import { GoogleAnalytics, useAnalytics } from '@luwio/google/analytics'

function App() {
  // \`consent\` is a single prop: pass a boolean (on/off) or an object of
  // per-category booleans. Wire it to your cookie banner / CMP.
  const [consent, setConsent] = useState(false)
  return (
    <GoogleAnalytics measurementId="G-XXXXXXXXXX" consent={consent}>
      <button onClick={() => setConsent(true)}>Accept analytics</button>
      <SignUpButton />
    </GoogleAnalytics>
  )
}

function SignUpButton() {
  const { track } = useAnalytics()
  // No-op until consent is true — gtag.js isn't even loaded yet. Flip
  // \`consent\` to true and the same call starts sending events.
  return <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
}`

const CONSENT_MODE_CODE = `import { GoogleAnalytics, useAnalytics } from '@luwio/google/analytics'

// Granular consent: pass an object of per-category booleans instead of a bool.
// gtag.js still loads, but storage is gated per Google Consent Mode v2 (booleans
// map to granted/denied). Google sends cookieless pings while denied and models
// the rest — recommended for EEA traffic with Google Ads.
function Root({ consent, children }) {
  return (
    <GoogleAnalytics
      measurementId="G-XXXXXXXXXX"
      consent={{
        ad_storage: consent.ads,
        ad_user_data: consent.ads,
        ad_personalization: consent.ads,
        analytics_storage: consent.analytics,
        wait_for_update: 500,
      }}
    >
      {children}
    </GoogleAnalytics>
  )
}

// Or update imperatively from the hook (e.g. in your banner's onAccept):
const { updateConsent } = useAnalytics()
updateConsent({ analytics_storage: true, ad_storage: true })`

export function GooglePage() {
  return (
    <DocsLayout slug="google" sections={SECTIONS}>
      <DocHero slug="google" />

      <p>
        <code>@luwio/google</code> collects Google web-platform integrations, with{' '}
        <strong>one namespace per library</strong> so you import only what you use. Today it ships
        two: <code>@luwio/google/map</code> (reliable Google Maps loading) and{' '}
        <code>@luwio/google/analytics</code> (Google Analytics 4). Each is a separate Google product
        with its own provider — nest the ones you need.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/google" />
      <p>React 18+ is a peer dependency.</p>

      <h2 id="namespaces">Namespaces</h2>
      <p>
        The package root ships no library code — always import from a namespace. Everything for maps
        lives under <code>/map</code>:
      </p>
      <CodeBlock code={"import { GoogleMaps, useGoogleMaps } from '@luwio/google/map'"} />
      <Callout>
        Future Google libraries follow the same pattern — <code>@luwio/google/places</code>,{' '}
        <code>@luwio/google/analytics</code>, and so on — each tree-shakeable on its own.
      </Callout>

      <h2 id="usage">Loading a map</h2>
      <p>
        Wrap your app in <code>GoogleMaps</code> once (it loads the base script and provides the API
        key), then load libraries where you need them with <code>{'<GoogleMaps.import>'}</code>. Its
        render prop receives a TanStack-Query-style <code>api</code> and the loaded{' '}
        <code>libraries</code>, keyed by name.
      </p>
      <CodeBlock code={SETUP_CODE} />
      <CodeBlock code={IMPORT_CODE} />

      <h2 id="suspense">Suspense</h2>
      <p>
        Prefer Suspense? <code>{'<GoogleMaps.importSuspense>'}</code> suspends until every requested
        library is ready and throws to an error boundary on failure.
      </p>
      <CodeBlock code={SUSPENSE_CODE} />

      <h2 id="hooks">Hooks</h2>
      <p>Both components are thin wrappers over hooks you can call directly for full control.</p>
      <CodeBlock code={HOOKS_CODE} />

      <h2 id="analytics">Analytics — a second namespace</h2>
      <p>
        <code>@luwio/google/analytics</code> loads Google Analytics 4 (gtag.js). It's a{' '}
        <strong>separate Google product</strong> — a different script and credential — so it has its
        own <code>GoogleAnalytics</code> and <code>useAnalytics</code> hook. Events fired before the
        script finishes loading are queued and flushed once it's ready.
      </p>
      <p>
        Tracking is <strong>consent-gated</strong> by a single <code>consent</code> prop — wire it
        to your own consent banner (consent management is out of scope). Pass <code>false</code> and
        gtag.js is never loaded; <code>track</code>, <code>pageview</code>, <code>identify</code>,{' '}
        <code>setUserProperties</code> and the raw <code>gtag</code> passthrough are all void
        no-ops. Flip it to <code>true</code> and the same calls start sending — no other code
        changes.
      </p>
      <CodeBlock code={ANALYTICS_CODE} />
      <Callout>
        There's no shared "Google" provider: each namespace configures a different product, so you
        nest exactly the providers you use. That independence is the point of the per-namespace
        split.
      </Callout>

      <h3>Consent Mode v2 (granular)</h3>
      <p>
        A boolean <code>consent</code> is enough for analytics-only apps. When you need per-category
        consent — Google Ads, or EEA traffic where Google requires it — pass an{' '}
        <strong>object of per-category booleans</strong> instead: <code>analytics_storage</code>,{' '}
        <code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code> and the
        storage types. Booleans map to Consent Mode v2 signals, applied as{' '}
        <code>gtag('consent', 'default', …)</code> before config and re-sent as an{' '}
        <code>update</code> whenever they change; or call <code>updateConsent()</code> from the
        hook.
      </p>
      <CodeBlock code={CONSENT_MODE_CODE} />
      <Callout>
        Boolean vs. object: <code>consent={'{false}'}</code> is a hard gate (gtag.js never loads);
        an object keeps it loaded but tells Google what's allowed, so denied traffic still yields
        cookieless pings and modeling. One prop covers both.
      </Callout>

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'GoogleMaps',
            desc: 'Loads the base script + provides config. Statics: .import, .importSuspense.',
          },
          {
            sig: 'useGoogleMaps(libraries)',
            desc: 'Returns { api, libraries } — load state plus the loaded namespaces, keyed by name.',
          },
          {
            sig: 'useSuspenseGoogleMaps(libraries)',
            desc: 'Suspense variant → { libraries }. Suspends until ready, throws on failure.',
          },
          {
            sig: 'GOOGLE_MAPS_LIBRARY_NAMES',
            desc: 'Every known Google Maps library name.',
          },
          {
            sig: 'GoogleAnalytics',
            desc: 'Loads gtag.js + provides config (measurementId, consent, config, nonce).',
          },
          {
            sig: 'useAnalytics()',
            desc: 'status / isReady / enabled + track, pageview, identify, setUserProperties, updateConsent, gtag. All no-op when consent is off.',
          },
        ]}
      />
    </DocsLayout>
  )
}
