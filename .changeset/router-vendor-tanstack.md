---
"@luwio/router": minor
---

Vendor `@tanstack/react-router` into the bundle. It's no longer a peer dependency — consumers
install only `@luwio/router` (+ `@luwio/locale`) and never import `@tanstack/react-router` directly.

- The package now re-exports the structural bindings apps need: `RouterProvider`, `Outlet`,
  `redirect`, `notFound`. Import these from `@luwio/router`.
- `useRouter().router` gains `routeId` — the active route's id (previously only reachable via
  TanStack's `useMatches`).
- No `<Link>` is exposed by design: generate URLs with `href` / `path` / `absolute` and route in-app
  with `navigate`. Render a plain `<a href={router.href(...)}>` and call `router.navigate` on click.

Trade-off: the published bundle is larger (TanStack Router is included) and its version is pinned to
what `@luwio/router` ships.
