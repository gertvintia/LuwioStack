import { createConfig } from '@luwio/config'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'overrides', label: 'Environment overrides' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { createConfig } from '@luwio/config'

// Defaults define the type of the entire config.
export const { ConfigProvider, useConfig, useConfigValue } = createConfig({
  apiUrl: 'https://api.example.com',
  debug: false,
})

function App() {
  return (
    <ConfigProvider value={{ debug: import.meta.env.DEV }}>
      <Dashboard />
    </ConfigProvider>
  )
}

function Dashboard() {
  const apiUrl = useConfigValue('apiUrl') // string, inferred
  const { debug } = useConfig()
  // ...
}`

const OVERRIDE_CODE = `const { ConfigProvider, useConfig } = createConfig({
  apiUrl: 'https://api.example.com',
  debug: false,
})

function Panel() {
  const { apiUrl, debug } = useConfig()
  return (
    <div>
      <div>apiUrl: <code>{apiUrl}</code></div>
      <div>debug: <strong>{String(debug)}</strong></div>
    </div>
  )
}

function Demo() {
  // Overrides are shallow-merged over the defaults — a provider only
  // specifies what changes for its environment.
  const [env, setEnv] = useState('production')
  const overrides =
    env === 'staging' ? { apiUrl: 'https://staging.example.com', debug: true } : {}
  return (
    <ConfigProvider value={overrides}>
      <select value={env} onChange={(e) => setEnv(e.target.value)}>
        <option value="production">production</option>
        <option value="staging">staging</option>
      </select>
      <Panel />
    </ConfigProvider>
  )
}

render(<Demo />)`

export function ConfigPage() {
  return (
    <DocsLayout slug="config" sections={SECTIONS}>
      <DocHero slug="config" />

      <p>
        <code>@luwio/config</code> gives you typed runtime configuration. Define your config shape
        once as defaults and get a fully-typed <code>ConfigProvider</code> plus hooks — no
        strings-as-keys guesswork, no separate type declaration to keep in sync.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/config" />
      <p>React 18+ is a peer dependency.</p>

      <h2 id="usage">Usage</h2>
      <p>
        <code>createConfig</code> returns a provider and two hooks bound to your config's exact
        type. The defaults you pass define that type — there is nothing else to declare.
      </p>
      <CodeBlock code={USAGE_CODE} />
      <Callout>
        Call <code>createConfig</code> once in a module and export the result, so every consumer
        shares the same typed context.
      </Callout>

      <h2 id="overrides">Environment overrides</h2>
      <p>
        Values passed to <code>{'<ConfigProvider value={…}>'}</code> are shallow-merged over the
        defaults. A provider only needs to specify what differs — ideal for per-environment values.
        Switch environments below and watch the config update.
      </p>
      <LiveExample code={OVERRIDE_CODE} scope={{ useState, createConfig }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'createConfig(defaults)',
            desc: 'Returns { ConfigProvider, useConfig, useConfigValue, Context }, typed by defaults.',
          },
          {
            sig: 'ConfigProvider',
            desc: 'Provides config; value is a partial override of defaults.',
          },
          { sig: 'useConfig()', desc: 'Read the whole, fully-typed config object.' },
          {
            sig: 'useConfigValue(key)',
            desc: 'Read a single value by key, with its inferred type.',
          },
        ]}
      />
    </DocsLayout>
  )
}
