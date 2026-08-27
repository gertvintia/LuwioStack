# showcase

A Luwio app — locale-aware routing (`@luwio/router` + `@luwio/locale`) with runtime translations
(`@luwio/translations`), scaffolded by `@luwio/cli` in a **vertical-slice** layout.

## Develop

```bash
pnpm install
pnpm dev
```

## Structure

Code is grouped by **feature**, not by technical layer:

```
src/
├─ main.tsx                     # entry — async bootstrap (fetch config → build router → mount)
├─ app/                         # cross-cutting wiring
│  ├─ router.ts                 # createAppRouter(config) — assembled at runtime, not at load
│  ├─ locale-config.ts          # the runtime config loader (locales + default), via @luwio/bootstrap
│  ├─ translations.ts           # createTranslations() + merges every feature's messages.ts
│  ├─ translations.route.tsx    # loads + activates the catalog (layout)
│  ├─ shell.route.tsx           # shared chrome (layout)
│  └─ Shell.tsx
└─ features/
   ├─ home/                     # one folder per slice — route + component + strings together
   │  ├─ home.route.tsx
   │  ├─ Home.tsx
   │  └─ messages.ts
   └─ account/                  # auth slice — a route guarded by its parent (see below)
```

## Runtime config (locales from an API)

The locale set and default aren't hard-coded — they come from a runtime config loader
(`app/locale-config.ts`, built with [`@luwio/bootstrap`](../../packages/bootstrap)), a stand-in for a
backend endpoint. `createRouter` is synchronous and needs the locales up front, so the app bootstraps
in `main.tsx`:

```tsx
const root = createRoot(container)
root.render(<div className="boot" />) // splash while we fetch

localeConfig.load().then((config) => {
  const router = createAppRouter(config) // createRouter(routeRegistry, { locales, defaultLocale, … })
  root.render(
    <StrictMode>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </StrictMode>,
  )
})
```

`locale-config.ts` is thin: it calls `createConfigLoader` from `@luwio/bootstrap`, points it at a mock
`fetch` (swap for `httpConfig('/api/config')` in production), caches in `sessionStorage`, and `map`s
the locale *codes* the API sends into hydrated `Locale` objects. Only the locale **set** is dynamic —
the route *registry* is still populated statically at import time (the `virtual:@luwio/router/routes`
import in `router.ts`). Fetching outside React keeps it a single request and avoids StrictMode's
double-invoke.

### Caching, and what a refresh does

Caching and revalidation come from `@luwio/bootstrap`. The endpoint is treated as **backend-cached** —
effectively static — with an **ETag**: the loader keeps the last config it saw (in `sessionStorage`,
the analog of the browser's HTTP cache) and sends it back via `If-None-Match`, so an unchanged config
is a cheap `304` (reuse what you have) and only a real publish ships a `200`. Watch the `[bootstrap]`
lines in the console to see which you got.

- **A browser refresh** re-runs boot, which re-requests the config — so a refresh reliably picks up a
  newly published config, while staying cheap (a `304`) when nothing changed. In a real app this is
  just `Cache-Control: no-cache` + `ETag` on the response; the browser does the revalidation for you.
- **An already-open tab** won't notice a publish on its own (nothing pushes to it). So
  `ConfigUpdateBanner` uses `useConfigUpdate(localeConfig)` — a **stale-while-revalidate** check on
  window focus / an interval — and when the published ETag no longer matches the mounted one it raises
  a **"new configuration available — Reload"** nudge rather than reloading under you. Config is only
  re-applied on reload.

Try it in dev — "publish" a change from the console, then either refresh or focus the tab:

```js
__publishConfig(['en-IE', 'de-DE'], 'de-DE') // dev-only helper, stripped from production builds
```

## Auth: a route guarded by its parent

The `account` slice shows the [layout-route guard pattern](../../packages/router/README.md#advanced--layout-routes)
— a **pathless parent route handles auth** for everything beneath it:

```
shell  (layout — chrome)
├─ signin    → /sign-in   public login page ("Sign in with GitHub")
└─ auth  (layout — guard, no session → redirect to signin)
   └─ account → /account  protected; reads context.session from the guard
```

- `account/auth.route.tsx` — `layout: true`, `parent: 'shell'`. Its `beforeLoad` reads the session
  (synchronously, via `shared/session.ts` — it runs before React) and, if there's none, throws
  `redirect()` to the sign-in page, remembering the intended URL in `?redirect=`.
- `account/signin.route.tsx` — the public page. GitHub OAuth is **simulated** (a client-only demo
  can't hold a client secret); the point is the routing, not the token exchange.
- `account/account.route.tsx` — `parent: 'auth'`, so it never runs the guard itself; the session the
  parent returned flows in as `context.session`.

The top-bar chrome reflects the state: `Shell.tsx` reads `useSession()` and shows the GitHub avatar
(→ account) when signed in, or a **Sign in** pill (→ the public page) otherwise — flipping the
instant you sign in or out.

## Add a feature

Create `src/features/<name>/` with:

- `<name>.route.tsx` — `createRoute({ id, parent: 'shell', component }).alias(locale, 'slug')`
- the component,
- `messages.ts` — `export const messages = { en: {…}, nl: {…} }`.

The Vite plugin (`luwioRouter({ routesDir: 'src' })`) discovers the route, and the translations layer
picks up `messages.ts` via `import.meta.glob` — no central files to edit.
