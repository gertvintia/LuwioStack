import type { ILocale } from '@luwio/locale'
import { Locale as LocaleProvider } from '@luwio/locale/react'
import type { AnyRoute, AnyRouter } from '@tanstack/react-router'
import {
  createRootRoute,
  createRoute as createTanstackRoute,
  createRouter as createTanstackRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import type { RouteRegistry } from './registry'
import type { RouteBuilder } from './route-builder'
import { setRouterMeta } from './router-meta'

/** Configuration for {@link createRouter}. */
export interface RouterConfig {
  /** The locales to mount. Each becomes a `/{locale.code}` sub-tree. */
  locales: ILocale[]
  /** Where `/` redirects to, and the locale used for the {@link RouterConfig.unprefixedDefault} tree. */
  defaultLocale: ILocale
  /** Also mount the default locale without a `/{locale}` prefix (so `/about` resolves as well). */
  unprefixedDefault?: boolean
  /** Drop these route ids and all of their descendants. Everything else is mounted. */
  exclude?: string[]
  /** Only mount a URL-bearing route in the locales it was explicitly aliased for. */
  strict?: boolean
  /** Extra options forwarded to TanStack's `createRouter` (`context`, `defaultPreload`, …). */
  router?: Record<string, unknown>
}

// TanStack's createRoute/createRouter are heavily generic; a locale-parameterised tree is built at
// runtime, so we forward plain objects through a single, well-contained cast boundary here.
type RouteInput = Record<string, unknown>
const buildRoute = createTanstackRoute as unknown as (options: RouteInput) => AnyRoute
const buildRouter = createTanstackRouter as unknown as (options: RouteInput) => AnyRouter

const toPath = (slug: string): string => (slug === '' ? '/' : `/${slug}`)

/**
 * Expand a {@link RouteRegistry} into a TanStack router: one localized sub-tree per configured
 * locale, with translated URL segments resolved from each route's aliases.
 *
 * Every TanStack option on a route (`loader`, `beforeLoad`, `component`, …) is forwarded
 * untouched. Before a route's own `beforeLoad` runs, `{ routeId, locale }` is injected into the
 * route context, so loaders and guards can read the active {@link ILocale}.
 *
 * @example
 * const router = createRouter(routeRegistry, {
 *   locales: ['en-BE', 'nl-BE'].map((l) => Locale.new({ languageOrLocale: l })),
 *   defaultLocale: Locale.new({ languageOrLocale: 'en-BE' }),
 * })
 */
export function createRouter(registry: RouteRegistry, config: RouterConfig): AnyRouter {
  const builders = selectBuilders(registry.all(), config)
  const byParent = groupByParent(builders)

  const root = createRootRoute({ component: () => <Outlet /> })

  // A locale sub-tree. `prefixed` gets a `/{code}` path segment; the unprefixed default gets a
  // PATHLESS layout (an `id`, not a `path`) so its children mount at their bare paths directly under
  // root — a `path: '/'` layout would be treated as an index and never nest `/home` under it.
  const mountLocale = (
    locale: ILocale,
    mount: { path: string } | { pathless: string },
  ): AnyRoute => {
    const layout = buildRoute({
      getParentRoute: () => root,
      ...('path' in mount ? { path: mount.path } : { id: mount.pathless }),
      beforeLoad: () => ({ locale }),
      component: () => (
        <LocaleProvider locale={locale}>
          <Outlet />
        </LocaleProvider>
      ),
    })

    const build = (parentId: string | undefined, parent: AnyRoute): AnyRoute[] =>
      (byParent.get(parentId) ?? [])
        // layout routes always mount; strict mode only gates URL-bearing routes.
        .filter((b) => b.layout || !config.strict || b.hasAlias(locale))
        .map((b) => {
          const head = withHead(b, locale)
          const route = buildRoute({
            ...b.options,
            getParentRoute: () => parent,
            ...(b.layout ? { id: b.id } : { path: toPath(b.slugFor(locale)) }),
            beforeLoad: withContext(b, locale),
            ...(head ? { head } : {}),
          })
          const children = build(b.id, route)
          return children.length ? route.addChildren(children) : route
        })

    return layout.addChildren(build(undefined, layout))
  }

  const trees: AnyRoute[] = config.locales.map((l) => mountLocale(l, { path: `/${l.code}` }))

  if (config.unprefixedDefault) {
    // Also serve the default locale without a prefix: `/home` alongside `/{default}/home`.
    trees.push(mountLocale(config.defaultLocale, { pathless: '__luwio_unprefixed__' }))
  } else {
    trees.push(
      buildRoute({
        getParentRoute: () => root,
        path: '/',
        beforeLoad: () => {
          throw redirect({ to: `/${config.defaultLocale.code}` })
        },
      }),
    )
  }

  const routeTree = root.addChildren(trees)
  const router = buildRouter({ routeTree, ...config.router })
  // Carry the registry + config (and which ids survived exclude) so useRouter() can resolve route
  // ids to localized hrefs and answer availability checks.
  setRouterMeta(router, { registry, config, mounted: new Set(builders.map((b) => b.id)) })
  return router
}

/** Group builders by their parent id for tree assembly. */
function groupByParent(builders: readonly RouteBuilder[]): Map<string | undefined, RouteBuilder[]> {
  const byParent = new Map<string | undefined, RouteBuilder[]>()
  for (const b of builders) {
    const list = byParent.get(b.parent) ?? []
    list.push(b)
    byParent.set(b.parent, list)
  }
  return byParent
}

/**
 * Resolve the set of builders to mount. Every route is mounted by default; `exclude` drops a route
 * and all of its descendants.
 */
function selectBuilders(all: readonly RouteBuilder[], config: RouterConfig): RouteBuilder[] {
  const childrenOf = new Map<string | undefined, string[]>()
  for (const b of all) {
    const list = childrenOf.get(b.parent) ?? []
    list.push(b.id)
    childrenOf.set(b.parent, list)
  }

  const descendants = (id: string): string[] => {
    const out: string[] = []
    const seen = new Set<string>([id])
    const stack = [id]
    while (stack.length > 0) {
      const next = stack.pop()
      if (next === undefined) break
      for (const child of childrenOf.get(next) ?? []) {
        if (seen.has(child)) continue // guard against a circular parent chain
        seen.add(child)
        out.push(child)
        stack.push(child)
      }
    }
    return out
  }

  const keep = new Set(all.map((b) => b.id))
  for (const id of config.exclude ?? []) {
    keep.delete(id)
    for (const d of descendants(id)) keep.delete(d)
  }

  const kept = all.filter((b) => keep.has(b.id))
  for (const b of kept) {
    if (b.parent !== undefined && !keep.has(b.parent)) {
      throw new Error(`Route "${b.id}" has parent "${b.parent}", which is not in the built set.`)
    }
  }
  return kept
}

/**
 * Wrap a route's `beforeLoad` so `{ routeId, locale }` is available in context — both to the
 * route's own `beforeLoad` and, merged with its return value, to every descendant.
 */
function withContext(builder: RouteBuilder, locale: ILocale) {
  const user = builder.options.beforeLoad as ((ctx: Record<string, unknown>) => unknown) | undefined
  return async (ctx: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const base = { routeId: builder.id, locale }
    const parentContext = (ctx.context as Record<string, unknown> | undefined) ?? {}
    const merged = { ...ctx, context: { ...parentContext, ...base } }
    const extra = user ? ((await user(merged)) as Record<string, unknown> | undefined) : undefined
    return { ...base, ...extra }
  }
}

/**
 * Wrap a route's `head` so its ctx exposes `context` at the top level (alongside TanStack's `match`,
 * `matches`, `params`, `loaderData`) — letting `head` read `context.locale` exactly like
 * `beforeLoad`/`loader`, rather than digging into `match.context`. Returns `undefined` when the
 * route defines no `head`.
 */
function withHead(builder: RouteBuilder, locale: ILocale) {
  const user = builder.options.head as ((ctx: Record<string, unknown>) => unknown) | undefined
  if (!user) return undefined
  return (ctx: Record<string, unknown>) => {
    const match = ctx.match as { context?: Record<string, unknown> } | undefined
    const context = { routeId: builder.id, locale, ...(match?.context ?? {}) }
    return user({ ...ctx, context })
  }
}
