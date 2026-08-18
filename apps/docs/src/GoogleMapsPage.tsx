import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Loading a map' },
  { id: 'suspense', label: 'Suspense' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'api', label: 'API reference' },
]

const SETUP_CODE = `import { GoogleMaps } from '@luwio/google-maps'

function App() {
  return (
    <GoogleMaps apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <MapSection />
    </GoogleMaps>
  )
}`

const IMPORT_CODE = `import { GoogleMaps } from '@luwio/google-maps'

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
import { GoogleMaps } from '@luwio/google-maps'

// Suspends until ready; throws to the nearest error boundary on failure —
// so the render prop only ever runs with everything loaded.
<Suspense fallback={<Spinner />}>
  <GoogleMaps.importSuspense libraries={['places']}>
    {(libraries) => <PlacesSearch places={libraries.places} />}
  </GoogleMaps.importSuspense>
</Suspense>`

const HOOKS_CODE = `import { useGoogleMaps, useSuspenseGoogleMaps } from '@luwio/google-maps'

// TanStack-Query-style states + the loaded namespaces
const { api, libraries } = useGoogleMaps(['geocoding'])

// …or, inside a <Suspense> boundary, the suspense variant
const { libraries } = useSuspenseGoogleMaps(['geocoding'])`

export function GoogleMapsPage() {
  return (
    <DocsLayout slug="google-maps" sections={SECTIONS}>
      <DocHero slug="google-maps" />

      <p>
        <code>@luwio/google-maps</code> is reliable Google Maps loading for React: the base JS API
        script and each library load exactly once page-wide through a shared cache. Libraries load
        lazily via <code>google.maps.importLibrary</code>, each tracked independently.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/google-maps" />
      <p>React 18+ is a peer dependency.</p>

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
        ]}
      />
    </DocsLayout>
  )
}
