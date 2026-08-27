---
"@luwio/router": minor
---

Rename `CreateRouter` → `createRouter` for consistency with the rest of the API (`createRoute`,
`registerModules`). The old PascalCase name existed only to avoid a clash with TanStack's
`createRouter`; now that TanStack is vendored and not consumer-importable, the clash is moot.
Update call sites: `createRouter(routeRegistry, { … })`.
