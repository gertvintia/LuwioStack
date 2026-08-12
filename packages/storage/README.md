# @luwio/storage

Reactive `localStorage` / `sessionStorage` hooks for React. Values stay in sync across
every component using the same key — and, for `localStorage`, across browser tabs.

Part of [Luwio](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

## Install

```bash
npm install @luwio/storage
```

React 18+ is a peer dependency.

## Usage

```tsx
import { useLocalStorage } from '@luwio/storage'

function Counter() {
  const [count, setCount, reset] = useLocalStorage('count', 0)

  return (
    <div>
      <button onClick={() => setCount((n) => n + 1)}>{count}</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}
```

`useSessionStorage` has the same signature but is scoped to the current tab.

### Custom serialization

```tsx
const [date, setDate] = useLocalStorage('lastSeen', new Date(), {
  serializer: {
    parse: (raw) => new Date(raw),
    stringify: (value) => value.toISOString(),
  },
})
```

## API

- `useLocalStorage<T>(key, initialValue, options?)` → `[value, setValue, remove]`
- `useSessionStorage<T>(key, initialValue, options?)` → `[value, setValue, remove]`
- `createStorageHook('local' | 'session')` — build your own bound hook

`setValue` accepts a value or an updater `(prev) => next`. SSR-safe: with no `window`,
hooks return `initialValue` and writes are no-ops.
