---
"@luwio/router": minor
---

Fix `unprefixedDefault` so the unprefixed default-locale routes actually resolve.

Previously the unprefixed tree was mounted under a `path: '/'` layout, which TanStack treats as an
index — so a segmented route like `/home` never nested and 404'd (only `/{default}/home` worked),
and an index route (empty-string alias) crashed with "Duplicate routes found with id: /". The
unprefixed default is now mounted under a **pathless** layout, so:

- Both `/home` and `/{default}/home` resolve; non-default locales stay prefixed.
- On an unprefixed route the active locale is the default locale (`useRouter().router.locale`,
  `useRouteLocale()`, and `context.locale`).
- URL generation and navigation strip the prefix for the default locale (`href`/`navigate` →
  `/home`, not `/{default}/home`).
- Index (empty-alias) default routes no longer crash under `unprefixedDefault`.
