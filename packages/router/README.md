# @luwio/router

Locale-aware routing for [TanStack Router](https://tanstack.com/router). Define **one route per
file**, give each a **translated URL segment per locale**, register it, and expand the whole
registry into a real TanStack route tree — one localized sub-tree per locale.

Part of [LuwioStack](https://github.com/) — standalone, but pairs with `@luwio/locale`.

```
/en-BE/about        /nl-BE/over-ons        /fr-BE/pour-nous
```

> **Runnable example:** [`apps/showcase`](../../apps/showcase) — a small localized app that uses
> this router (localized routes, a layout route, a locale switcher) alongside the other `@luwio`
> packages. `pnpm --filter @luwio/showcase dev`.

## Why

TanStack's file-based routing keys each path to a filename, so `about.tsx` can only ever produce
the segment `about`. Real multilingual sites need `/nl-BE/over-ons`, `/fr-BE/pour-nous`, … This
package keeps every TanStack feature (`loader`, `beforeLoad`, `validateSearch`, layout routes, …)
and adds locale-translated segments on top, driven by config at runtime.

## Install

```bash
npm install @luwio/router @luwio/locale
```

`react` (18+) is the only peer dependency. **`@tanstack/react-router` is bundled in** — you don't
install or import it directly. This package vendors it and surfaces only the structural bindings you
need — `RouterProvider`, `Outlet`, `redirect`, `notFound` — re-exported from `@luwio/router` itself:

```tsx
import { RouterProvider, Outlet, redirect, notFound } from '@luwio/router'
```

Everything else is URL generation (`useRouter().router.href` / `path` / `absolute`) and imperative
navigation (`.navigate`). There is no `<Link>`; render links as `<a href={router.href(...)}>` and,
for in-app navigation on click, call `router.navigate(...)` from an `onClick`.

## Usage

Define a route and **export** it — `createRoute` takes every TanStack option plus an `id`; add a
slug per locale with `.alias`. No manual registration: the file just exports the route, and the
tooling (below) collects it — the same shape as TanStack's `export const Route = …`.

```tsx
// routes/about.route.tsx
import { createRoute } from '@luwio/router'
import { Locale } from '@luwio/locale'
import { About } from './About'

export default createRoute({
  id: 'about',
  beforeLoad: ({ context }) => ({ crumb: 'About' }), // context.locale is the active ILocale
  loader: ({ context }) => fetchTeam(context.locale.country_code),
  component: About,
})
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), 'about')
  .alias(Locale.new({ languageOrLocale: 'nl-BE' }), 'over-ons')
  .alias(Locale.new({ languageOrLocale: 'fr-BE' }), 'pour-nous')
```

**The index route.** Alias a route to the **empty string** to mount it at the locale root
(`/en-BE`) rather than a named segment. Without any alias, a route falls back to the last dotted
segment of its `id` (so `home` would land at `/en-BE/home`) — the empty alias is what makes it the
index:

```tsx
export default createRoute({ id: 'home', component: Home })
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), '') // → /en-BE
  .alias(Locale.new({ languageOrLocale: 'nl-BE' }), '') // → /nl-BE
```

Expand the registry into a router once, at boot:

```tsx
// router.ts
import 'virtual:@luwio/router/routes' // every *.route file is now registered (Vite plugin, below)
import { createRouter, routeRegistry } from '@luwio/router'
import { Locale } from '@luwio/locale'

export const router = createRouter(routeRegistry, {
  locales: ['en-BE', 'nl-BE', 'fr-BE'].map((l) => Locale.new({ languageOrLocale: l })),
  defaultLocale: Locale.new({ languageOrLocale: 'en-BE' }),
})
```

```tsx
import { RouterProvider } from '@luwio/router' // re-exported; no @tanstack/react-router install

<RouterProvider router={router} />
```

### Auto-registration

Route files only `export` their routes — something has to import those files and collect the
exports into the registry. Two ways:

**Recommended — the Vite plugin.** Add it once; it scans your routes directory and registers every
exported route through a virtual module, so app code stays free of globs. This is how TanStack
Router's own plugin works.

```ts
// vite.config.ts
import { luwioRouter } from '@luwio/router/vite'

export default defineConfig({
  plugins: [luwioRouter()], // defaults to scanning src/routes/**/*.route.{ts,tsx}
})
```

```ts
// src/vite-env.d.ts — types for the virtual module
/// <reference types="@luwio/router/vite-client" />
```

Then `import 'virtual:@luwio/router/routes'` once (shown above). Adding or removing a route file
reloads automatically. Options: `routesDir`, `suffix`, `virtualId`.

**Or a plain glob** with `registerModules`, if you'd rather not add a plugin:

```ts
import { registerModules } from '@luwio/router'

registerModules(import.meta.glob('./routes/**/*.route.tsx', { eager: true }))
```

Either way: without one of these, the registry comes up empty — the files are never collected.

### The locale in context

Before each route's own `beforeLoad` runs, `createRouter` injects `{ routeId, locale }` into the
route context, where `locale` is the full [`ILocale`](../locale) — so `loader` and `beforeLoad`
can read `context.locale.language()`, `.country()`, `.country_code`, etc. The locale layout also
wraps the tree in `@luwio/locale`'s provider, so `useLocale()` works in every component.

## Route options

`createRoute(config)` takes this package's own three keys plus TanStack Router's route options. The
common ones are typed and documented below (with `params`/`search`/`locale` wired in); **any other
TanStack route option is accepted and forwarded untouched**.

| Option | Type | What it does |
| ------ | ---- | ------------ |
| `id` \* | `string` | Stable, unique id. Wires `parent` and identifies the route for navigation. |
| `parent` | `string` | Parent route id. Omit for a top-level route. |
| `layout` | `boolean` | Pathless route — contributes no URL segment but wraps its children (guards, shells). Takes no aliases. |
| `beforeLoad` | `(ctx) => unknown` | Runs before load; its return **merges into context** for this route + descendants. `ctx.context.locale` is the active locale. |
| `loader` | `(ctx) => unknown` | Loads data before render (`useRouteLoaderData()`). |
| `loaderDeps` | `({ search }) => object` | The `search` slice the loader depends on, so it re-runs when those change. |
| `validateSearch` | `(search) => T` | Parse/validate the query string into typed `search`. |
| `head` | `(ctx) => RouteHead` | Document-head tags — title, meta, links. `ctx.context.locale` is the active locale. See below. |
| `component` | component | The page (or a layout shell around `<Outlet />`). |
| `pendingComponent` | component | Shown while the loader is pending. |
| `errorComponent` | component | Shown when the route (or a child) throws. |
| `notFoundComponent` | component | Shown when `notFound()` is thrown beneath it. |
| `staleTime` / `gcTime` | `number` (ms) | Loader-data freshness / cache lifetime. |
| `shouldReload` | `boolean \| (ctx) => boolean` | Whether the loader re-runs on navigation. |
| `caseSensitive` | `boolean` | Case-sensitive path matching. |
| `wrapInSuspense` | `boolean` | Wrap the component in `<Suspense>`. |
| _…anything else_ | | Forwarded to TanStack's `createRoute` untouched. |

\* required. `path` and `getParentRoute` are **not** accepted — the URL segment comes from
`.alias(locale, slug)` per locale, and the parent from `parent`. Type `params` / `search` with the
generics: `createRoute<{ postId: string }, { page: number }>({ … })`.

### Document head (title, meta, links)

Give a route a `head`, then render the merged tags with `<HeadContent />` — re-exported from
`@luwio/router` (no TanStack import). Its ctx's `context.locale` is the active locale — the same
idiom as `beforeLoad`/`loader` — so titles and meta localize:

```tsx
import { createRoute } from '@luwio/router'

export default createRoute({
  id: 'about',
  head: ({ context, loaderData }) => ({
    meta: [
      { title: t(context.locale, 'about.title') },
      { name: 'description', content: t(context.locale, 'about.desc') },
      { property: 'og:locale', content: context.locale.code },
    ],
    links: [{ rel: 'canonical', href: `https://example.com/${context.locale.code}/about` }],
  }),
})
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), 'about')
```

Mount `<HeadContent />` once, in your root or app-shell layout's head:

```tsx
import { HeadContent, Outlet } from '@luwio/router'

const AppShell = () => (
  <>
    <HeadContent /> {/* writes the merged title/meta/link tags */}
    <Outlet />
  </>
)
```

TanStack merges head across the matched routes: the **deepest** route wins for `title` and for each
`meta` `name`/`property`; `links`, `styles` and head `scripts` concatenate. Use `<Scripts />` (also
re-exported) for body scripts under SSR.

## Loading states & skeletons

Two patterns, both driven by the route's `loader` — the layout and shell stay mounted throughout, so
either one renders *inside* your chrome.

**1. A route skeleton — `pendingComponent`.** Navigation awaits the `loader`; if it runs longer than
`pendingMs`, the skeleton takes the route's `<Outlet />` slot. `pendingMinMs` keeps it visible long
enough not to flicker. The skeleton can read `useRouteLocale()`, so even the loading state is
localized.

```tsx
createRoute({
  id: 'explore',
  loader: ({ context }) => fetchThings(context.locale.country_code),
  component: Explore,
  pendingComponent: ExploreSkeleton, // shown once the loader passes pendingMs
  pendingMs: 200,                    // start sooner than the ~1s default
  pendingMinMs: 300,                 // ...and stay ≥300ms, so it can't flash
})
```

Router-wide defaults go through the `router` passthrough:
`createRouter(reg, { …, router: { defaultPendingComponent, defaultPendingMs: 200 } })`.

**2. Render through, defer the slow part.** Return a **promise** from the loader instead of awaiting
it — the component renders immediately and only the deferred piece shows a fallback. Consume it with
`<Await>` (re-exported here) or React 19's `use()`:

```tsx
createRoute({
  id: 'post',
  loader: ({ params, context }) => ({
    post: fetchPost(context.locale, params.id), // fast — awaited
    comments: fetchComments(params.id),         // slow — return the PROMISE, don't await
  }),
  component: Post,
})
```

```tsx
import { Await, useRouteLoaderData } from '@luwio/router'

function Post() {
  const { post, comments } = useRouteLoaderData()
  return (
    <>
      <Article post={post} />
      <Await promise={comments} fallback={<CommentsSkeleton />}>
        {(list) => <Comments items={list} />}
      </Await>
    </>
  )
}
```

`Await`, `useAwaited` and `defer` are re-exported from `@luwio/router` — no `@tanstack/react-router`
import. To skip skeletons entirely, preload on intent:
`createRouter(reg, { …, router: { defaultPreload: 'intent' } })`.

## Advanced — layout routes

Set `layout: true` to create a **pathless** route: it contributes no URL segment, but still wraps
its children. Use it for auth guards (`beforeLoad`) and shared UI shells (`component`). Layout
routes take no aliases.

```tsx
// routes/auth.route.tsx — pathless guard, invisible in the URL
export default createRoute({
  id: 'auth',
  layout: true,
  beforeLoad: ({ context, location }) => {
    const session = getSession()
    if (!session) {
      throw redirect({ to: `/${context.locale.code}/login`, search: { redirect: location.href } })
    }
    return { session } // flows into every child's context
  },
})
```

```tsx
// routes/app.route.tsx — pathless layout, shared chrome
export default createRoute({
  id: 'app',
  parent: 'auth', // sits inside the guard
  layout: true,
  component: AppShell, // renders sidebar/nav around <Outlet />
})
```

```tsx
// routes/account.route.tsx — real page under auth + layout
export default createRoute({
  id: 'account',
  parent: 'app',
  loader: ({ context }) => fetchAccount(context.session, context.locale.country_code),
  component: Account,
})
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), 'account')
  .alias(Locale.new({ languageOrLocale: 'fr-BE' }), 'compte')
```

Resulting tree — `auth` and `app` never appear in the URL, but run on every request beneath them:

```
/en-BE
  └─ auth   [pathless]  session guard        → context.session
       └─ app   [pathless]  AppShell (chrome)
            └─ account       /account         → context.locale + context.session
```

| Locale  | URL              |
| ------- | ---------------- |
| `en-BE` | `/en-BE/account` |
| `fr-BE` | `/fr-BE/compte`  |

## Config-driven availability

`createRouter`'s config decides what actually mounts, so one build can serve different route/locale
sets per deployment, market, or feature flag:

```ts
createRouter(routeRegistry, {
  locales: [/* … */],
  defaultLocale,
  unprefixedDefault: true, // also mount the default locale without a /{locale} prefix
  exclude: ['blog'],       // drop a route and all its descendants
  strict: true,            // only mount a URL-bearing route where an alias exists
})
```

**Every route is mounted by default** — `exclude` is the only route filter: it drops the listed ids
together with all of their descendants. So one build can serve different route sets per deployment,
market, or feature flag just by changing `exclude`.

### Is a route available?

Because `exclude` (and per-locale aliases) can leave a route unavailable, ask the router before you
link to it — `router.has(id)` is `true` only when the id is mounted (survived `exclude`), and
`router.has(id, locale)` also requires it be available in that locale:

```ts
const { router } = useRouter()

router.has('blog')                 // false — excluded from this build
router.has('about')                // true
router.has('about', 'nl-BE')       // true only if aliased for nl-BE
router.availableLocales('about')   // the locales it resolves in ([] if excluded)
```

### Prefixing the default locale

By default every locale — including the default — is mounted under its `/{locale}` prefix, and `/`
redirects to the default locale's tree. Set `unprefixedDefault: true` to **also** serve the default
locale without a prefix, so both resolve:

```
nl-BE is the default:
  /home        ✓   (unprefixed — the canonical URL for the default locale)
  /nl-BE/home  ✓   (prefixed — still resolves)
  /fr-BE/home  ✓   (non-default locales are always prefixed)
```

On an unprefixed route the active locale is the default locale — `useRouter().router.locale`,
`useRouteLocale()`, and `context.locale` all report it. And URL generation **strips the prefix** for
the default locale: `router.href({ id: 'home' })` returns `/home`, not `/nl-BE/home` — so `navigate`
and every generated link stay unprefixed while you're in the default locale.

## API

| Export                              | Description                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `createRoute(config)`               | Define a route; returns a chainable `RouteBuilder`. `config.id` is required. Export it. See [Route options](#route-options). |
| `RouteBuilder`                      | `.alias(locale, slug)`, `.slugFor(locale)`, `.hasAlias(locale)`.                        |
| `registerModules(modules, reg?)`    | Register exported routes from a glob record or module array. Defaults to `routeRegistry`.|
| `routeRegistry`                     | The shared `RouteRegistry` singleton.                                                   |
| `RouteRegistry`                     | Registry class — `.all()`, `.get()`, `.clear()`, low-level `.add()`. For isolated sets. |
| `createRouter(registry, config)`    | Expand a registry into a TanStack `Router`.                                             |
| `useRouter()`                       | `{ router }` — `href`/`path`/`absolute`/`navigate`, plus `locale`, `routeId`, `locales`, `has`, `availableLocales`. |
| `RouterProvider` / `Outlet`         | Re-exported from the bundled TanStack Router. Mount the tree / render children.          |
| `HeadContent` / `Scripts`           | Re-exported from the bundled TanStack Router. Render a route's `head()` tags / body scripts. |
| `Await` / `useAwaited` / `defer`    | Re-exported from the bundled TanStack Router. Stream deferred loader data (skeletons).   |
| `redirect` / `notFound`             | Re-exported from the bundled TanStack Router. Throw from `beforeLoad` / `loader`.        |
| `luwioRouter(options?)`             | The Vite plugin, from `@luwio/router/vite`.                                             |
| `RouteConfig` / `RouterConfig`      | Config types. `createRoute<TParams, TSearch>` types the handler `ctx`.                   |
| `RouteRegister`                     | Augment to map `id` → `{ params?; search? }` for typed `href` / `navigate` (see below).  |

## Type safety

Because the tree is assembled at runtime, TanStack can't infer literal `to` strings from a static
route tree. This package recovers the type safety that matters most in two opt-in layers:

**1. Typed handler context (no setup).** `createRoute` is generic over a route's `params` / `search`,
so `beforeLoad` and `loader` get typed callbacks — and `context.locale` is always typed:

```tsx
createRoute<{ postId: string }, { page: number }>({
  id: 'blog.post',
  loader: ({ params, search, context }) => {
    fetchPost(params.postId, search.page)   // params.postId: string, search.page: number
    return context.locale.country_code       // context.locale: ILocale — always typed
  },
})
```

**2. Typed ids + params for `href` / `navigate` (augment once).** Augment `RouteRegister` to map each
id to its `params` / `search`. `href`, `path`, `absolute` and `navigate` then check the id, require
the right `params`, type `query`, and reject unknown ids — while unaugmented apps keep the loose
`string` id behavior:

```ts
declare module '@luwio/router' {
  interface RouteRegister {
    about: {}
    'blog.post': { params: { postId: string }; search: { page?: number } }
  }
}

router.href({ id: 'blog.post', params: { postId: '42' } }) // ✓
router.href({ id: 'blog.post' })                           // ✗ params required
router.navigate({ to: 'aboot' })                           // ✗ unknown route id
```

This package deliberately renders no link component: it only **generates URLs** (`href` / `path` /
`absolute`) and **navigates imperatively** (`navigate`). Render a plain anchor with the generated
href, and route in-app on click:

```tsx
const { router } = useRouter()

<a
  href={router.href({ id: 'about' })}
  onClick={(e) => {
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      router.navigate({ to: 'about' }) // in-app nav; modified clicks fall through to the href
    }
  }}
>
  About
</a>
```
