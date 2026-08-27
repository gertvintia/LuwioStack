import type { ILocale } from '@luwio/locale'

/**
 * The route context that {@link createRouter} injects before every route's own `beforeLoad`: it
 * always carries `{ routeId, locale }`, plus whatever ancestors returned from their `beforeLoad`.
 */
export interface RouteContext {
  /** This route's id. */
  routeId: string
  /** The active locale for the sub-tree this route was mounted in. */
  locale: ILocale
  /** Anything an ancestor's `beforeLoad` merged into context (typed as `unknown`). */
  [key: string]: unknown
}

/**
 * The context object passed to a route's `beforeLoad` / `loader`. Type its `params` and `search`
 * via {@link createRoute}'s generics; `context.locale` is always available. Other TanStack ctx
 * fields (`location`, `cause`, `abortController`, …) remain reachable as `unknown`.
 */
export interface RouteHandlerCtx<
  TParams = Record<string, string>,
  TSearch = Record<string, unknown>,
> {
  context: RouteContext
  params: TParams
  search: TSearch
  [key: string]: unknown
}

/**
 * The document-head tags a route contributes, rendered by `<HeadContent />` (re-exported from
 * `@luwio/router`). TanStack merges tags across the matched routes: for `title` and for each
 * `meta` `name`/`property`, the **deepest** route wins; `links`, `styles` and head `scripts` are
 * concatenated.
 */
export interface RouteHead {
  /**
   * `<title>` and `<meta>` tags. `{ title: '…' }` sets the document title; `{ name, content }` and
   * `{ property, content }` set `<meta>`; `{ 'script:ld+json': {…} }` emits a JSON-LD script.
   */
  meta?: Array<Record<string, unknown>>
  /** `<link>` tags — canonical, `alternate`/hreflang, preload, and so on. */
  links?: Array<Record<string, unknown>>
  /** `<script>` tags placed in the head. */
  scripts?: Array<Record<string, unknown>>
  /** `<style>` tags. */
  styles?: Array<Record<string, unknown>>
}

/**
 * The context passed to a route's {@link RouteConfig.head | head}. It mirrors TanStack's head ctx
 * (`match`, `matches`, `params`, `loaderData`) and — because `@luwio/router` wraps `head` — adds
 * `context` at the top level, so `context.locale` reads exactly like it does in `beforeLoad` and
 * `loader` (TanStack's raw head ctx exposes it only as `match.context`).
 */
export interface RouteHeadCtx<TParams = Record<string, string>> {
  /** Route context — always carries `{ routeId, locale }`, plus anything `beforeLoad` merged in. */
  context: RouteContext
  params: TParams
  loaderData: unknown
  /** The current route match — its `context` is the same {@link RouteContext}. */
  match: { context: RouteContext; params: TParams; loaderData: unknown; [key: string]: unknown }
  matches: ReadonlyArray<unknown>
  [key: string]: unknown
}

/**
 * The configuration passed to {@link createRoute}. It accepts this package's own three keys
 * ({@link RouteConfig.id | id}, {@link RouteConfig.parent | parent}, {@link RouteConfig.layout | layout})
 * plus TanStack Router's route options, which are forwarded verbatim when the tree is built. The
 * common options are surfaced below with types and docs; the index signature keeps every other
 * TanStack option available too.
 *
 * The generics type the `params` / `search` seen by `beforeLoad`, `loader` and `head` (and
 * `validateSearch`'s return) — `createRoute<{ postId: string }>({ … })`. They default to loose
 * records, so untyped usage keeps working; `context.locale` (and `head`'s `locale`) is always typed.
 *
 * `path` and `getParentRoute` are intentionally NOT accepted: the URL segment is derived per locale
 * from {@link RouteBuilder.alias}, and the parent is wired from {@link RouteConfig.parent | parent}.
 */
export interface RouteConfig<TParams = Record<string, string>, TSearch = Record<string, unknown>> {
  // ── @luwio/router options ──────────────────────────────────────────────
  /** Stable, unique id. Wires {@link RouteConfig.parent} and identifies the route for navigation. */
  id: string
  /** Parent route id. Omit for a top-level route (mounted directly under the locale layout). */
  parent?: string
  /**
   * Marks a **pathless** route: it contributes no URL segment. Use it for an auth guard
   * (`beforeLoad`) or a shared layout (`component` wrapping an `<Outlet />`). Layout routes
   * take no aliases.
   */
  layout?: boolean

  // ── Data & lifecycle (TanStack) ────────────────────────────────────────
  /**
   * Runs before this route (and its children) load. Its return value is **merged into the route
   * context** for this route and every descendant. Receives a typed ctx whose `context.locale` is
   * the active locale. Use it for auth guards (`throw redirect(...)`) and to derive context.
   */
  beforeLoad?: (ctx: RouteHandlerCtx<TParams, TSearch>) => unknown
  /**
   * Loads this route's data before its component renders. The return is the route's loader data
   * (read with `useRouteLoaderData()`). Receives a typed ctx; `context.locale` is available.
   */
  loader?: (ctx: RouteHandlerCtx<TParams, TSearch>) => unknown
  /**
   * Selects the slice of `search` the {@link RouteConfig.loader | loader} depends on, so the loader
   * re-runs only when those values change.
   */
  loaderDeps?: (opts: { search: TSearch }) => Record<string, unknown>
  /** Parse and validate the query string into the typed `search` this route exposes. */
  validateSearch?: (search: Record<string, unknown>) => TSearch
  /**
   * Document-head tags for this route (title, meta, links, …), rendered by `<HeadContent />`. Its
   * ctx's `context.locale` is the active locale — same idiom as `beforeLoad`/`loader` — so titles
   * and descriptions can be localized. Merged with the other matched routes — see {@link RouteHead}.
   */
  head?: (ctx: RouteHeadCtx<TParams>) => RouteHead

  // ── UI (TanStack) ──────────────────────────────────────────────────────
  /** The route's component — the page (or layout shell wrapping `<Outlet />`). */
  // biome-ignore lint/suspicious/noExplicitAny: forwarded to TanStack, which owns the real types
  component?: any
  /** Shown while this route's loader is pending. */
  // biome-ignore lint/suspicious/noExplicitAny: forwarded to TanStack, which owns the real types
  pendingComponent?: any
  /** Shown when this route (or a child) throws during load or render. */
  // biome-ignore lint/suspicious/noExplicitAny: forwarded to TanStack, which owns the real types
  errorComponent?: any
  /** Shown when `notFound()` is thrown beneath this route. */
  // biome-ignore lint/suspicious/noExplicitAny: forwarded to TanStack, which owns the real types
  notFoundComponent?: any

  // ── Behaviour (TanStack) ───────────────────────────────────────────────
  /** Milliseconds the loader data stays fresh; within it, navigation reuses the cache instead of re-loading. */
  staleTime?: number
  /** Milliseconds cached loader data is kept after the route is no longer active before being garbage-collected. */
  gcTime?: number
  /** Whether the loader re-runs on navigation — a boolean or a predicate over the match. */
  shouldReload?: boolean | ((ctx: RouteHandlerCtx<TParams, TSearch>) => boolean)
  /** Match this route's path case-sensitively (default: false). */
  caseSensitive?: boolean
  /** Wrap the component in a `<Suspense>` boundary (default: true for lazy components). */
  wrapInSuspense?: boolean

  /** Any other TanStack Router route option — forwarded to `createRoute` untouched. */
  [option: string]: unknown
}

/** The forwarded TanStack options — {@link RouteConfig} without this package's own keys. */
export type RouteOptions = Omit<RouteConfig, 'id' | 'parent' | 'layout'>

/**
 * A deferred route definition. Created by {@link createRoute}, it collects the TanStack options
 * plus a per-locale alias map. The real TanStack routes are only created later, once
 * `createRouter` knows which locales to build.
 */
export class RouteBuilder {
  readonly id: string
  readonly parent: string | undefined
  readonly layout: boolean
  readonly options: RouteOptions
  readonly #aliases = new Map<string, string>()

  // Accepts any generic instantiation of RouteConfig — the builder erases the param/search types
  // (they only guide createRoute's callbacks); the runtime just forwards options.
  // biome-ignore lint/suspicious/noExplicitAny: variance-neutral so every RouteConfig<…> is accepted
  constructor(config: RouteConfig<any, any>) {
    const { id, parent, layout = false, ...options } = config
    this.id = id
    this.parent = parent
    this.layout = layout
    this.options = options
  }

  /**
   * Register the localized URL segment for one locale.
   *
   * @example
   * route.alias(Locale.new({ languageOrLocale: 'nl-BE' }), 'over-ons')
   *
   * @throws If the route is a layout route (it has no URL), or if the locale is already aliased.
   */
  alias(locale: ILocale, slug: string): this {
    if (this.layout) {
      throw new Error(
        `Route "${this.id}" is a layout route and has no URL, so alias() is not allowed.`,
      )
    }
    if (this.#aliases.has(locale.code)) {
      throw new Error(`Route "${this.id}" already has an alias for "${locale.code}".`)
    }
    this.#aliases.set(locale.code, slug)
    return this
  }

  /** Whether an explicit alias exists for the given locale. */
  hasAlias(locale: ILocale): boolean {
    return this.#aliases.has(locale.code)
  }

  /**
   * The URL segment for a locale: the alias if one is set, otherwise the last dotted segment of
   * the id as a fallback (e.g. `'blog.post'` → `'post'`).
   */
  slugFor(locale: ILocale): string {
    return this.#aliases.get(locale.code) ?? this.id.split('.').pop() ?? this.id
  }
}

/**
 * Define a locale-aware route. Returns a {@link RouteBuilder}; call {@link RouteBuilder.alias} to
 * give it a localized URL segment per locale, then register it with a {@link RouteRegistry}.
 *
 * Optionally type the `params` / `search` the route's `beforeLoad` and `loader` receive:
 * `createRoute<{ postId: string }>({ … })`.
 *
 * @example
 * const route = createRoute({ id: 'about', component: About })
 * route.alias(Locale.new({ languageOrLocale: 'en-BE' }), 'about')
 * route.alias(Locale.new({ languageOrLocale: 'nl-BE' }), 'over-ons')
 */
export function createRoute<TParams = Record<string, string>, TSearch = Record<string, unknown>>(
  config: RouteConfig<TParams, TSearch>,
): RouteBuilder {
  if (!config.id) {
    throw new Error('createRoute requires an "id".')
  }
  return new RouteBuilder(config)
}
