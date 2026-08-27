# @luwio/bootstrap

Config-based bootstrap for React apps. A backend often owns an app's startup config — which locales
to mount, feature flags, a theme, a default. The app must fetch that **before** it can build its
router / i18n / whatever. This package packages the fetch → cache → revalidate loop so you don't
hand-roll it, and works in any React app (it knows nothing about locales or the rest of Luwio).

```bash
npm install @luwio/bootstrap
```

## The idea

Treat the config endpoint as **backend-cached** — effectively static, with an `ETag`. The client
sends `If-None-Match`, so an unchanged config is a cheap `304` and only a real publish ships a `200`.
A browser refresh then reliably picks up new config while staying cheap; long-lived tabs get
stale-while-revalidate. See the two entry points below.

## Core (`@luwio/bootstrap`) — React-free

```ts
import { createConfigLoader, httpConfig, sessionStorageCache } from '@luwio/bootstrap'

interface AppConfig {
  locales: string[]
  default: string
}

export const configLoader = createConfigLoader<AppConfig>({
  fetch: httpConfig('/api/config'),              // conditional GET (sends If-None-Match, reads ETag)
  cache: sessionStorageCache('my-app:config'),   // survives a refresh, like the browser's HTTP cache
})
```

- **`load()`** — fetch (or revalidate) and return the config; call it in your entry before mounting.
- **`revalidate()`** — re-check without touching the running app; `{ changed, version }`.
- **`watch(onChange)`** — stale-while-revalidate; fires once when a newer version is published.

`map` transforms the raw JSON into what your app consumes (only the raw body is cached):

```ts
createConfigLoader<AppConfigJson, AppConfig>({ fetch, cache, map: (json) => hydrate(json) })
```

Swap the pieces freely: `httpConfig(url, { init, fetchImpl })` or your own `fetch` for a mock;
`sessionStorageCache` / `localStorageCache` / `memoryCache`, or your own `{ read, write }`.

## React (`@luwio/bootstrap/react`)

A gate that fetches before it renders — ideal when startup needs the config synchronously:

```tsx
import { Bootstrap } from '@luwio/bootstrap/react'
import { configLoader } from './config'

<Bootstrap loader={configLoader} fallback={<Splash />}>
  {(config) => <App config={config} />}
</Bootstrap>
```

`children` runs once per load, so building a singleton (a router) inside it is safe.
`useBootstrapConfig<T>()` reads the loaded config anywhere below the gate.

Or bootstrap imperatively in your entry and use just the update nudge:

```tsx
import { useConfigUpdate } from '@luwio/bootstrap/react'

function UpdateBanner() {
  const { available, reload } = useConfigUpdate(configLoader)
  if (!available) return null
  return <button onClick={reload}>New configuration available — Reload</button>
}
```

## In a Luwio app

Luwio apps use this to load their locale set from the backend, then build the router from it. The
scaffold (`@luwio/cli`) wires a small `locale-config.ts` — a `createConfigLoader` whose `map`
hydrates locale codes into `Locale` objects — and boots from it in `main.tsx`. See the
[showcase](../../apps/showcase).
