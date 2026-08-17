import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'namespaces', label: 'Namespaces' },
  { id: 'usage', label: 'Loading a map' },
  { id: 'suspense', label: 'Suspense' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'api', label: 'API reference' },
]

const SETUP_CODE = `import { GoogleMapsProvider } from '@luwio/google/map'

function App() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMapsProvider>
  )
}`

const IMPORT_CODE = `import { GoogleMapsProvider } from '@luwio/google/map'

function MapSection() {
  // Load libraries close to where they're used. The cache dedups, so a library
  // requested in several places still loads once.
  return (
    <GoogleMapsProvider.Import libraries={['maps', 'marker']}>
      {(api, libraries) => {
        if (api.isError) return <button onClick={api.retry}>Retry</button>
        if (api.isPending) return <p>Loading map…</p>
        const { Map } = libraries.maps as google.maps.MapsLibrary
        return <MapCanvas Map={Map} />
      }}
    </GoogleMapsProvider.Import>
  )
}`

const SUSPENSE_CODE = `import { Suspense } from 'react'
import { GoogleMapsProvider } from '@luwio/google/map'

// Suspends until ready; throws to the nearest error boundary on failure —
// so the render prop only ever runs with everything loaded.
<Suspense fallback={<Spinner />}>
  <GoogleMapsProvider.ImportSuspense libraries={['places']}>
    {(libraries) => <PlacesSearch places={libraries.places} />}
  </GoogleMapsProvider.ImportSuspense>
</Suspense>`

const HOOKS_CODE = `import { useGoogleMaps, useSuspenseGoogleMaps } from '@luwio/google/map'

// TanStack-Query-style states + the loaded namespaces
const { api, libraries } = useGoogleMaps(['geocoding'])

// …or, inside a <Suspense> boundary, the suspense variant
const { libraries } = useSuspenseGoogleMaps(['geocoding'])`

export function GooglePage() {
  return (
    <DocsLayout slug="google" sections={SECTIONS}>
      <DocHero slug="google" />

      <p>
        <code>@luwio/google</code> collects Google web-platform integrations, with{' '}
        <strong>one namespace per library</strong> so you import only what you use. The first
        namespace, <code>@luwio/google/map</code>, is reliable Google Maps loading for React: the
        base script and each library load exactly once page-wide through a shared cache.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/google" />
      <p>React 18+ is a peer dependency.</p>

      <h2 id="namespaces">Namespaces</h2>
      <p>
        The package root ships no library code — always import from a namespace. Everything for maps
        lives under <code>/map</code>:
      </p>
      <CodeBlock code={"import { GoogleMapsProvider, useGoogleMaps } from '@luwio/google/map'"} />
      <Callout>
        Future Google libraries follow the same pattern — <code>@luwio/google/places</code>,{' '}
        <code>@luwio/google/analytics</code>, and so on — each tree-shakeable on its own.
      </Callout>

      <h2 id="usage">Loading a map</h2>
      <p>
        Wrap your app in <code>GoogleMapsProvider</code> once (it loads the base script and provides
        the API key), then load libraries where you need them with{' '}
        <code>{'<GoogleMapsProvider.Import>'}</code>. Its render prop receives a
        TanStack-Query-style <code>api</code> and the loaded <code>libraries</code>, keyed by name.
      </p>
      <CodeBlock code={SETUP_CODE} />
      <CodeBlock code={IMPORT_CODE} />

      <h2 id="suspense">Suspense</h2>
      <p>
        Prefer Suspense? <code>{'<GoogleMapsProvider.ImportSuspense>'}</code> suspends until every
        requested library is ready and throws to an error boundary on failure.
      </p>
      <CodeBlock code={SUSPENSE_CODE} />

      <h2 id="hooks">Hooks</h2>
      <p>Both components are thin wrappers over hooks you can call directly for full control.</p>
      <CodeBlock code={HOOKS_CODE} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'GoogleMapsProvider',
            desc: 'Loads the base script + provides config. Statics: .Import, .ImportSuspense.',
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
        ]}
      />
    </DocsLayout>
  )
}
