---
"@luwio/router": minor
---

Add a locale-aware `head` option to `createRoute`, and document every route option.

- `createRoute({ head })` is now a typed, first-class option for document-head tags (title, meta,
  links, styles, scripts). `@luwio/router` wraps `head` so its ctx exposes `context` — read
  `context.locale` exactly like in `beforeLoad`/`loader` — for localized titles and meta without
  reaching into `match.context`: `head: ({ context }) => ({ meta: [{ title: t(context.locale, …) }] })`.
- Re-export `HeadContent` and `Scripts` from `@luwio/router` (vendored from TanStack) so head tags
  can be rendered without importing `@tanstack/react-router`.
- New exported types `RouteHead` and `RouteHeadCtx`.
- `RouteConfig` now surfaces and documents every common route option (`beforeLoad`, `loader`,
  `loaderDeps`, `validateSearch`, `head`, the component family, `staleTime`/`gcTime`, `shouldReload`,
  `caseSensitive`, …) with JSDoc; any other TanStack option is still forwarded untouched.
