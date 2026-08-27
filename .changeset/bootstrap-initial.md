---
"@luwio/bootstrap": minor
---

Initial release of `@luwio/bootstrap` — config-based bootstrap for React apps. A generic,
locale-agnostic module for the fetch → cache → revalidate loop an app runs before it can build its
router / i18n / etc. from backend-owned config.

- `createConfigLoader({ fetch, cache?, map? })` — `load()` (boot), `revalidate()`, and `watch()`
  (stale-while-revalidate). Generic over the raw body and the mapped shape.
- `httpConfig(url)` — a ready-made ETag-aware conditional `GET` (`If-None-Match` → cheap `304`),
  plus `sessionStorageCache` / `localStorageCache` / `memoryCache`.
- `@luwio/bootstrap/react` — a `<Bootstrap>` gate that fetches before it renders,
  `useBootstrapConfig()`, and `useConfigUpdate()` for a "new config published — reload" nudge.

The root entry is React-free (React is an optional peer); the showcase and the `@luwio/cli` scaffold
now use it for their runtime locale config.
