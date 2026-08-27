---
"@luwio/router": minor
---

Simplify route selection to exclude-only, and add an availability check.

- Removed the `include` whitelist from `createRouter`'s config. Every registered route is now
  mounted by default; `exclude` (drop a route and all of its descendants) is the only route filter.
- Added `router.has(id, locale?)` on `useRouter()`: `true` only when the id is mounted (survived
  `exclude`); pass a locale to also require the route be available there. Returns `false` for
  unknown ids instead of throwing — use it to guard links to routes that a build may have dropped.
- `router.availableLocales(id)` now returns `[]` for an excluded route.
