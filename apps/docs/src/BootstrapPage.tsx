import { createConfigLoader, memoryCache } from '@luwio/bootstrap'
import { Bootstrap, useBootstrapConfig } from '@luwio/bootstrap/react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'the-idea', label: 'The idea' },
  { id: 'installation', label: 'Installation' },
  { id: 'loader', label: 'The loader' },
  { id: 'caching', label: 'Caching & refresh' },
  { id: 'react', label: 'React bindings' },
  { id: 'luwio', label: 'In a Luwio app' },
  { id: 'api', label: 'API reference' },
]

const LOADER_CODE = `import { createConfigLoader, httpConfig, sessionStorageCache } from '@luwio/bootstrap'

interface AppConfig {
  locales: string[]
  featureFlags: Record<string, boolean>
}

// Define the loader once and export it — a small state machine around a fetch + a cache.
export const configLoader = createConfigLoader<AppConfig>({
  fetch: httpConfig('/api/config'),            // conditional GET (sends If-None-Match, reads ETag)
  cache: sessionStorageCache('my-app:config'), // survives a refresh, like the browser's HTTP cache
})`

const BOOT_CODE = `// entry.tsx — fetch the config FIRST, then build the app from it.
const config = await configLoader.load()
const router = createRouter({ locales: config.locales })

createRoot(el).render(<RouterProvider router={router} />)`

const MAP_CODE = `createConfigLoader<AppConfigJson, AppConfig>({
  fetch: httpConfig('/api/config'),
  cache: sessionStorageCache('my-app:config'),
  // The raw JSON is what gets cached (it must be serializable). \`map\` runs on every load() to turn
  // it into the shape your app consumes — hydrate ids into objects, parse dates, etc.
  map: (json) => ({ ...json, startedAt: new Date(json.startedAt) }),
})`

const CACHE_FLOW = `1st load    →  GET /api/config                    →  200 + ETag: "v1"   (cache "v1")
refresh     →  GET /api/config  If-None-Match: "v1"  →  304 (no body)      (reuse "v1")   ← cheap
after edit  →  GET /api/config  If-None-Match: "v1"  →  200 + ETag: "v2"   (cache "v2")   ← fresh`

const WATCH_CODE = `// An open tab won't notice a publish on its own — nothing pushes to it. watch() pulls cheaply,
// on window focus / tab-visible / a slow interval, and fires ONCE when the version diverges.
const stop = configLoader.watch(({ version }) => {
  showReloadBanner()   // config is only re-applied on reload — don't swap it under the user
})
// stop() to unsubscribe`

const GATE_CODE = `import { Bootstrap, useBootstrapConfig } from '@luwio/bootstrap/react'
import { configLoader } from './config'

// The gate fetches before it renders. \`children\` runs once per successful load, so building a
// singleton (a router) inside it is safe.
export function Root() {
  return (
    <Bootstrap loader={configLoader} fallback={<Splash />} error={(err, retry) => <Failed onRetry={retry} />}>
      {(config) => <App config={config} />}
    </Bootstrap>
  )
}

// Anywhere below the gate:
function Header() {
  const config = useBootstrapConfig<AppConfig>()
  return <span>{config.locales.length} locales</span>
}`

const UPDATE_CODE = `import { useConfigUpdate } from '@luwio/bootstrap/react'
import { configLoader } from './config'

export function UpdateBanner() {
  const { available, reload } = useConfigUpdate(configLoader)
  if (!available) return null
  return <button onClick={reload}>New configuration available — Reload</button>
}`

const LOCALE_CODE = `import { createConfigLoader, sessionStorageCache } from '@luwio/bootstrap'
import { Locale } from '@luwio/locale'

// The API sends locale codes (serializable); map hydrates them into Locale objects on read.
export const localeConfig = createConfigLoader({
  fetch: httpConfig('/api/config'),
  cache: sessionStorageCache('my-app:localeConfig'),
  map: (body) => ({
    locales: body.locales.map((code) => Locale.new({ languageOrLocale: code })),
    defaultLocale: Locale.new({ languageOrLocale: body.defaultLocale }),
  }),
})`

const LIVE_CODE = `// A mock endpoint that resolves a "fresh" config after 700ms. In a real app this is
// httpConfig('/api/config') — a conditional GET that sends If-None-Match and reads the ETag.
const loader = createConfigLoader({
  fetch: () =>
    new Promise((resolve) =>
      setTimeout(
        () => resolve({ status: 'fresh', version: 'v1', data: { title: 'Config loaded from the backend' } }),
        700,
      ),
    ),
  cache: memoryCache(),
})

function Screen() {
  // Reads the config the gate loaded, from context.
  const config = useBootstrapConfig()
  return <strong>{config.title}</strong>
}

// The gate shows the fallback until the fetch resolves, then renders the app once.
render(
  <Bootstrap loader={loader} fallback={<em>loading config…</em>}>
    {() => <Screen />}
  </Bootstrap>,
)`

export function BootstrapPage() {
  return (
    <DocsLayout slug="bootstrap" sections={SECTIONS}>
      <DocHero slug="bootstrap" />

      <p>
        Many apps can't render until they know something the backend decides at runtime — which
        locales to mount, a set of feature flags, a theme, an API base. That config has to be
        fetched <em>before</em> the router or i18n layer can be built. <code>@luwio/bootstrap</code>{' '}
        packages that fetch → cache → revalidate loop so you don't hand-roll it, and it's generic:
        it knows nothing about locales or the rest of Luwio, so it works in any React app.
      </p>

      <h2 id="the-idea">The idea</h2>
      <p>
        There are two obvious ways to get runtime config into an app, and both have a failure mode:
      </p>
      <ul>
        <li>
          <strong>Bake it into the build.</strong> Fast to read, but it goes stale — every config
          change means a rebuild and redeploy.
        </li>
        <li>
          <strong>Mount, then fetch, then bootstrap.</strong> Always fresh, but it puts a network
          waterfall and a spinner in front of the very first paint.
        </li>
      </ul>
      <p>
        The way out is to <strong>separate the write path from the read path</strong>. Editing
        config is rare and dynamic (your backend). <em>Reading</em> it happens on every load and
        must be cheap — so serve it from a <strong>backend-cached endpoint</strong> (effectively a
        static asset) with an <code>ETag</code>. The app fetches that one small resource, and the
        browser's own HTTP cache makes a refresh nearly free when nothing changed. That's the model
        this package implements.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/bootstrap" />
      <p>
        The root entry is <strong>React-free</strong> — React is an <em>optional</em> peer, needed
        only for <code>@luwio/bootstrap/react</code>. So a non-React app can use the loader too.
      </p>

      <h2 id="loader">The loader</h2>
      <p>
        <code>createConfigLoader</code> is the core. You give it a <code>fetch</code> (where config
        comes from) and, usually, a <code>cache</code> (how it survives reloads); it returns three
        methods: <code>load()</code>, <code>revalidate()</code>, and <code>watch()</code>.
      </p>
      <CodeBlock code={LOADER_CODE} />
      <p>
        Call <code>load()</code> in your entry file, before mounting — it fetches (or revalidates)
        and returns the config, so you can build the router synchronously from the result:
      </p>
      <CodeBlock code={BOOT_CODE} />
      <Callout>
        Doing this <strong>outside React</strong> (not in an effect) keeps it a single request and
        sidesteps React StrictMode's double-invoke in development. If you'd rather bootstrap
        declaratively, the <code>{'<Bootstrap>'}</code> gate below does the same thing inside React.
      </Callout>
      <p>
        Only the raw, JSON-serializable body is cached. Pass <code>map</code> to transform it into
        the richer shape your app actually consumes — it runs on every <code>load()</code>, so
        non-serializable values (class instances, <code>Date</code>s) never touch storage:
      </p>
      <CodeBlock code={MAP_CODE} />
      <p>
        The three pieces are all swappable. <code>fetch</code> can be <code>httpConfig(url)</code>,
        a mock, or anything returning a <code>FetchResult</code>. <code>cache</code> can be{' '}
        <code>sessionStorageCache</code>, <code>localStorageCache</code>, <code>memoryCache</code>,
        or your own <code>{'{ read, write }'}</code>. Omit the cache entirely to always fetch fresh.
      </p>

      <h2 id="caching">Caching &amp; what a refresh does</h2>
      <p>
        <code>httpConfig(url)</code> issues a <strong>conditional GET</strong>: it sends the
        last-seen version as <code>If-None-Match</code> and reads the <code>ETag</code> back. The
        server answers <code>304 Not Modified</code> (no body — reuse the cache) when nothing
        changed, or a full <code>200</code> with new JSON when it did. The loader keeps the last
        body in the <code>cache</code>, so the whole exchange looks like this:
      </p>
      <CodeBlock code={CACHE_FLOW} lang="text" />
      <p>
        This is exactly what the browser does natively for a resource served with{' '}
        <code>Cache-Control: no-cache</code> + <code>ETag</code>. So the answer to “does a refresh
        pick up new config?” is <strong>yes</strong>: a refresh re-runs boot, re-requests the
        endpoint, and gets the new config — while staying cheap (a <code>304</code>) whenever
        nothing changed. Set those two response headers on your endpoint and you're done.
      </p>
      <Callout>
        <code>no-cache</code> is a misnomer — it means “cache it, but revalidate before reusing,”
        not “don't cache.” That revalidation is the cheap <code>304</code>. Avoid a bare{' '}
        <code>max-age</code> on the config resource, or a refresh will serve a stale copy from disk
        without asking the server.
      </Callout>
      <p>
        A refresh covers the reader who reloads. A tab that stays <em>open</em> won't notice a
        publish on its own — nothing pushes to it. <code>watch()</code> adds{' '}
        <strong>stale-while-revalidate</strong>: it re-checks cheaply on window focus, tab-visible,
        and a slow interval, and fires once when the published version diverges from the running
        one.
      </p>
      <CodeBlock code={WATCH_CODE} />
      <p>
        Note the loader never swaps config under a running app — <code>revalidate()</code> and{' '}
        <code>watch()</code> only <em>report</em> a change. Applying it means reloading, which
        re-runs boot. That keeps a mounted router and its already-rendered tree consistent.
      </p>

      <h2 id="react">React bindings</h2>
      <p>
        <code>@luwio/bootstrap/react</code> offers a gate that fetches before it renders — ideal
        when startup needs the config synchronously (building a router from it). It shows{' '}
        <code>fallback</code> while loading, renders <code>children(config)</code> once when ready,
        and provides the config via context.
      </p>
      <LiveExample
        code={LIVE_CODE}
        scope={{ Bootstrap, useBootstrapConfig, createConfigLoader, memoryCache }}
      />
      <CodeBlock code={GATE_CODE} />
      <Callout>
        <code>children</code> runs a single time per successful load, so a router or other singleton
        built inside it isn't recreated on later re-renders. <code>useBootstrapConfig()</code> reads
        that same config anywhere below the gate.
      </Callout>
      <p>
        If you bootstrap imperatively instead (the <code>await load()</code> pattern), you still get
        the update nudge as a headless hook. <code>useConfigUpdate(loader)</code> runs the{' '}
        <code>watch()</code> for you and exposes <code>{'{ available, version, reload }'}</code>:
      </p>
      <CodeBlock code={UPDATE_CODE} />

      <h2 id="luwio">In a Luwio app</h2>
      <p>
        A Luwio app uses this to load its locale set from the backend, then builds the{' '}
        <a href="#/docs/router">
          <code>@luwio/router</code>
        </a>{' '}
        from it. The wiring is thin: a loader whose <code>map</code> hydrates locale codes into{' '}
        <a href="#/docs/locale">
          <code>Locale</code>
        </a>{' '}
        objects.
      </p>
      <CodeBlock code={LOCALE_CODE} />
      <Callout>
        The <a href="#/docs/cli">CLI</a> scaffolds exactly this — a <code>locale-config.ts</code>{' '}
        loader, an <code>await localeConfig.load()</code> in <code>main.tsx</code>, and a{' '}
        <code>ConfigUpdateBanner</code> using <code>useConfigUpdate</code> — so a new app ships with
        the pattern already wired.
      </Callout>

      <h2 id="api">API reference</h2>
      <p>
        Core — from <code>@luwio/bootstrap</code> (React-free):
      </p>
      <ApiTable
        rows={[
          {
            sig: 'createConfigLoader({ fetch, cache?, map?, debug? })',
            desc: 'Returns a loader: { load, revalidate, watch }. Generic over the raw body and the mapped output.',
          },
          {
            sig: 'loader.load()',
            desc: 'Fetch (or revalidate) and return the mapped config; marks its version as applied. Call at boot.',
          },
          {
            sig: 'loader.revalidate()',
            desc: 'Re-check without touching the running app. Resolves { changed, version }.',
          },
          {
            sig: 'loader.watch(onChange, { intervalMs? })',
            desc: 'Stale-while-revalidate on focus / visibility / interval; fires onChange once when the version diverges. Returns an unsubscribe.',
          },
          {
            sig: 'httpConfig(url, { init?, fetchImpl? })',
            desc: 'A ready-made ConfigFetcher — a conditional GET (If-None-Match → 304 / 200). Falls back to a body hash if the server sends no ETag.',
          },
          {
            sig: 'sessionStorageCache(key)',
            desc: 'Cache in sessionStorage (per tab; survives a refresh). The natural default.',
          },
          {
            sig: 'localStorageCache(key) / memoryCache()',
            desc: 'Persist across tabs/restarts, or keep in-memory (tests, SSR).',
          },
        ]}
      />
      <p>
        React — from <code>@luwio/bootstrap/react</code>:
      </p>
      <ApiTable
        rows={[
          {
            sig: '<Bootstrap loader fallback? error?>{cfg => …}</Bootstrap>',
            desc: 'Fetches before it renders: shows fallback, then children(config) once, providing config via context.',
          },
          {
            sig: 'useBootstrapConfig()',
            desc: 'Read the config loaded by the nearest <Bootstrap>. Throws if used outside one.',
          },
          {
            sig: 'useConfigUpdate(loader, { intervalMs? })',
            desc: 'Headless update nudge: watches the loader and returns { available, version, reload }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
