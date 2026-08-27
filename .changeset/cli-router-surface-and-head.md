---
"@luwio/cli": patch
---

Update the scaffolded app for the current `@luwio/router` surface, and localize the document title.

- The generated app no longer depends on or imports `@tanstack/react-router` directly (it's vendored
  into `@luwio/router`): `RouterProvider`, `Outlet` and `HeadContent` now come from `@luwio/router`,
  and the nav link is a plain `<a href={router.href(...)}>` that routes via `router.navigate`.
  (Previously the app pulled a second TanStack copy, breaking the router context.)
- The home route defines a `head` that sets a translated `<title>` (`translations.t('home.title')`),
  rendered by `<HeadContent />` in the shell.
