// @luwio/bootstrap — config-based bootstrap for any React app (React-free core).
//
// A backend often owns an app's startup config (which locales to mount, feature flags, a default…).
// The app has to fetch that before it can build its router/i18n/etc. This package packages the
// fetch + cache + revalidate loop so you don't hand-roll it:
//
//   const loader = createConfigLoader({ fetch: httpConfig('/api/config'), cache: sessionStorageCache('app:config') })
//   const config = await loader.load()   // in your entry, before mounting
//
// The endpoint is assumed to be backend-cached (effectively static) with an ETag, so a refresh is
// cheap when nothing changed. `loader.watch()` adds stale-while-revalidate for long-lived tabs.
// React bindings — a <Bootstrap> gate + hooks — live at `@luwio/bootstrap/react`.
export { localStorageCache, memoryCache, sessionStorageCache } from './cache'
export { type HttpConfigOptions, httpConfig } from './http'
export { createConfigLoader } from './loader'
export type {
  ConfigCache,
  ConfigFetcher,
  ConfigLoader,
  ConfigLoaderOptions,
  FetchResult,
  RevalidateResult,
  VersionedConfig,
  WatchOptions,
} from './types'
