# @luwio/config

Typed runtime configuration for React. Define your config shape once and get a fully-typed
`ConfigProvider` + hooks — no strings-as-keys guesswork.

Part of [Luwio](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

## Install

```bash
npm install @luwio/config
```

React 18+ is a peer dependency.

## Usage

```tsx
import { createConfig } from '@luwio/config'

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
}
```

Overrides passed to `<ConfigProvider value={...}>` are shallow-merged over the defaults,
so a provider only needs to specify what changes (e.g. per-environment values).

## API

- `createConfig(defaults)` → `{ ConfigProvider, useConfig, useConfigValue, Context }`
- `useConfig()` → the whole, fully-typed config object
- `useConfigValue(key)` → a single value by key
