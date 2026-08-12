import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'serialization', label: 'Custom serialization' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { useLocalStorage } from '@luwio/storage'

function Counter() {
  const [count, setCount, reset] = useLocalStorage('count', 0)

  return (
    <div>
      <button onClick={() => setCount((n) => n + 1)}>{count}</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}`

const SERIALIZE_CODE = `// Values are JSON-serialized by default. Provide a custom serializer
// for anything JSON can't round-trip, like Date.
const [seen, setSeen] = useLocalStorage('lastSeen', new Date(), {
  serializer: {
    parse: (raw) => new Date(raw),
    stringify: (value) => value.toISOString(),
  },
})`

export function StoragePage() {
  return (
    <DocsLayout slug="storage" sections={SECTIONS}>
      <DocHero slug="storage" />

      <p>
        <code>@luwio/storage</code> is a pair of hooks over the Web Storage API. Values stay in sync
        across every component using the same key — and, for <code>localStorage</code>, across
        browser tabs. Built on <code>useSyncExternalStore</code>, so reads are always consistent.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/storage" />
      <p>React 18+ is a peer dependency.</p>

      <h2 id="usage">Usage</h2>
      <p>
        The hook returns a <code>[value, setValue, remove]</code> tuple. <code>setValue</code>{' '}
        accepts a value or an updater function, just like <code>useState</code>.{' '}
        <code>useSessionStorage</code> has the same signature but is scoped to the current tab.
      </p>
      <CodeBlock code={USAGE_CODE} />
      <Callout>
        SSR-safe: with no <code>window</code>, hooks return the initial value and writes are no-ops,
        so components render on the server without guards.
      </Callout>

      <h2 id="serialization">Custom serialization</h2>
      <p>
        Values are JSON-encoded by default. Pass a <code>serializer</code> to persist types JSON
        can't represent directly.
      </p>
      <CodeBlock code={SERIALIZE_CODE} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'useLocalStorage(key, initial, opts?)',
            desc: 'Reactive localStorage, synced across tabs. Returns [value, setValue, remove].',
          },
          {
            sig: 'useSessionStorage(key, initial, opts?)',
            desc: 'Same API, scoped to the current tab.',
          },
          {
            sig: "createStorageHook('local' | 'session')",
            desc: 'Build your own hook bound to a storage area.',
          },
        ]}
      />
    </DocsLayout>
  )
}
