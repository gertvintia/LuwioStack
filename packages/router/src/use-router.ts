import { type ILocale, Locale } from '@luwio/locale'
import { useRouterState, useRouter as useTanstackRouter } from '@tanstack/react-router'
import type { RouterConfig } from './create-router'
import type { RouteRegistry } from './registry'
import type { RouteBuilder } from './route-builder'
import { getRouterMeta } from './router-meta'

/** A full {@link ILocale}, or a locale code like `'nl-BE'`. */
export type LocaleInput = ILocale | string
/** Path params — fill `$param` segments and the splat (`$` → `params['*']`). */
export type PathParams = Record<string, string>
/** Query string params — `null`/`undefined` values are dropped. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>

/**
 * **Opt-in** route typing. Augment this interface (module augmentation) to map each route `id` to
 * its `params` and/or `search` shape; `href`, `path`, `absolute` and `navigate` then check the id,
 * require the right `params`, type `query`, and reject unknown ids. Leave it empty — the default —
 * and everything falls back to a loose `string` id + {@link PathParams} / {@link QueryParams}, so no
 * augmentation is required.
 *
 * @example
 * declare module '@luwio/router' {
 *   interface RouteRegister {
 *     about: {} // no params
 *     'blog.post': { params: { postId: string }; search: { page?: number } }
 *   }
 * }
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty — consumers augment it.
export interface RouteRegister {}

/** Every registered route id — or `string` while {@link RouteRegister} is left unaugmented. */
export type RouteId = [keyof RouteRegister] extends [never] ? string : keyof RouteRegister

/** The `params` shape declared for an id in {@link RouteRegister}; loose {@link PathParams} otherwise. */
export type ParamsFor<Id extends RouteId> = Id extends keyof RouteRegister
  ? RouteRegister[Id] extends { params: infer P }
    ? P
    : PathParams
  : PathParams

/** The `search` shape declared for an id in {@link RouteRegister}; loose {@link QueryParams} otherwise. */
export type SearchFor<Id extends RouteId> = Id extends keyof RouteRegister
  ? RouteRegister[Id] extends { search: infer S }
    ? S
    : QueryParams
  : QueryParams

// `{ params }` — required when the id declares required params, optional otherwise (including the
// unaugmented loose case, where `{}` is assignable to `PathParams`). The bare `{}` is deliberate
// here: `{} extends T` is precisely the "does T have no required keys?" test.
type ParamsArg<Id extends RouteId> =
  // biome-ignore lint/complexity/noBannedTypes: `{} extends T` tests for no required keys
  {} extends ParamsFor<Id> ? { params?: ParamsFor<Id> } : { params: ParamsFor<Id> }

/** Params for {@link IRouter.href}. */
export type HrefParams<Id extends RouteId = RouteId> = {
  /** A registered route id (e.g. `'about'`, `'blog.post'`). */
  id: Id
  /** Target locale. Defaults to the active locale. */
  locale?: LocaleInput
  query?: SearchFor<Id>
  hash?: string
} & ParamsArg<Id>

/** Params for {@link IRouter.absolute}. */
export type AbsoluteHrefParams<Id extends RouteId = RouteId> = HrefParams<Id> & {
  /** Origin to prepend. Defaults to `window.location.origin`. */
  baseUrl?: string
}

/** Params for {@link IRouter.path}. */
export type PathParamsInput<Id extends RouteId = RouteId> = {
  id: Id
  locale?: LocaleInput
} & ParamsArg<Id>

/** Params for {@link IRouter.navigate}. */
export type NavigateParams<Id extends RouteId = RouteId> = {
  /** Target route id. */
  to: Id
  from?: string
  query?: SearchFor<Id>
  hash?: string
  /** Omit to stay in the active locale; set to navigate to that locale's path. */
  locale?: LocaleInput
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean
  state?: Record<string, unknown>
  /** `'_blank'` opens the resolved absolute URL in a new tab. */
  target?: '_self' | '_blank'
} & ParamsArg<Id>

/** A locale-aware router, returned by {@link useRouter}. */
export interface IRouter {
  /** The active locale. */
  locale: ILocale
  /** The active route's id — `undefined` before the first match resolves. */
  routeId: string | undefined
  /** Every locale this router was configured with. */
  locales: ILocale[]
  /**
   * Whether a route id is mounted in this router — i.e. registered and not dropped by
   * `config.exclude`. Pass a locale to also require the route be available in that locale (it and
   * its non-layout ancestors aliased there). Returns `false` for unknown ids rather than throwing.
   */
  has(id: string, locale?: LocaleInput): boolean
  /**
   * The locales a route id is available in — those it (and its non-layout ancestors) are aliased
   * for. Empty if the route was excluded. Use it to build a language switcher that only offers valid
   * locales, or hreflang alternates.
   */
  availableLocales(id: RouteId): ILocale[]
  /** Navigate to a route id (optionally in another locale). */
  navigate<Id extends RouteId>(params: NavigateParams<Id>): Promise<void>
  /** Re-run the active route's loaders. */
  reload(): Promise<void>
  /** Navigate back in history. */
  goBack(): Promise<void>
  /** Whether there is history to go back to. */
  canGoBack(): boolean
  /** The localized pathname for a route id (no query/hash). */
  path<Id extends RouteId>(params: PathParamsInput<Id>): string
  /** A root-relative href: pathname + query + hash. */
  href<Id extends RouteId>(params: HrefParams<Id>): string
  /** An absolute URL: origin + href. */
  absolute<Id extends RouteId>(params: AbsoluteHrefParams<Id>): string
}

// The runtime is locale-parameterised and id-addressed, so the impl works in loose `string` terms;
// this shape checks that impl, and useRouter() casts it up to the generic {@link IRouter} surface.
interface LooseRouter {
  locale: ILocale
  routeId: string | undefined
  locales: ILocale[]
  has(id: string, locale?: LocaleInput): boolean
  availableLocales(id: string): ILocale[]
  navigate(params: {
    to: string
    from?: string
    params?: PathParams
    query?: QueryParams
    hash?: string
    locale?: LocaleInput
    replace?: boolean
    state?: Record<string, unknown>
    target?: '_self' | '_blank'
  }): Promise<void>
  reload(): Promise<void>
  goBack(): Promise<void>
  canGoBack(): boolean
  path(params: { id: string; locale?: LocaleInput; params?: PathParams }): string
  href(params: {
    id: string
    locale?: LocaleInput
    params?: PathParams
    query?: QueryParams
    hash?: string
  }): string
  absolute(params: {
    id: string
    locale?: LocaleInput
    params?: PathParams
    query?: QueryParams
    hash?: string
    baseUrl?: string
  }): string
}

// Fill one segment from params. A named `$param` is required — missing it throws rather than
// silently dropping the segment (which would yield a plausible but wrong URL). The splat `$` may
// legitimately be empty (it then matches the route itself), so it falls back to ''.
const fillSegment = (seg: string, params: PathParams, id: string): string => {
  if (seg === '$') return params['*'] ?? ''
  if (!seg.startsWith('$')) return seg
  const name = seg.slice(1)
  const value = params[name]
  if (value == null) {
    throw new Error(`useRouter: route "${id}" requires path param "${name}".`)
  }
  return value
}

/**
 * root→self URL segments for a route id in a locale (layout routes contribute nothing).
 *
 * @throws If the parent chain is circular.
 */
function segmentsFor(registry: RouteRegistry, id: string, locale: ILocale): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (let b = registry.get(id); b; b = b.parent ? registry.get(b.parent) : undefined) {
    if (seen.has(b.id)) {
      throw new Error(`useRouter: route "${id}" has a circular parent chain (at "${b.id}").`)
    }
    seen.add(b.id)
    if (!b.layout) out.unshift(b.slugFor(locale))
  }
  return out
}

/**
 * Resolve a route id + locale to its localized pathname. Pure and exported for testing.
 *
 * @throws If the id is not registered.
 */
export function routePath(
  registry: RouteRegistry,
  config: RouterConfig,
  id: string,
  locale: ILocale,
  params: PathParams = {},
): string {
  if (!registry.get(id)) {
    throw new Error(`useRouter: unknown route id "${id}".`)
  }
  const body = segmentsFor(registry, id, locale)
    .map((s) => fillSegment(s, params, id))
    .filter(Boolean)
    .join('/')
  const unprefixed = config.unprefixedDefault && locale.code === config.defaultLocale.code
  const prefix = unprefixed ? '' : `/${locale.code}`
  return `${prefix}/${body}`.replace(/\/{2,}/g, '/').replace(/(.)\/$/, '$1') || '/'
}

/**
 * The locales a route id is available in: every configured locale for which the route and all of its
 * non-layout ancestors have an explicit alias. Pure and exported for testing.
 *
 * @throws If the id is not registered.
 */
export function availableLocales(
  registry: RouteRegistry,
  config: RouterConfig,
  id: string,
): ILocale[] {
  if (!registry.get(id)) {
    throw new Error(`useRouter: unknown route id "${id}".`)
  }
  const chain: RouteBuilder[] = []
  const seen = new Set<string>()
  for (let b = registry.get(id); b; b = b.parent ? registry.get(b.parent) : undefined) {
    if (seen.has(b.id)) {
      throw new Error(`useRouter: route "${id}" has a circular parent chain (at "${b.id}").`)
    }
    seen.add(b.id)
    chain.push(b)
  }
  return config.locales.filter((loc) => chain.every((b) => b.layout || b.hasAlias(loc)))
}

// Drop `null`/`undefined` entries but keep the original value types — TanStack owns search
// serialization for navigate(), so numbers/booleans must survive for a typed `validateSearch`.
const definedEntries = (query: QueryParams): [string, string | number | boolean][] =>
  Object.entries(query).filter(([, v]) => v != null) as [string, string | number | boolean][]

const cleanSearch = (query: QueryParams): Record<string, string | number | boolean> =>
  Object.fromEntries(definedEntries(query))

const suffix = (query?: QueryParams, hash?: string): string => {
  const qs = query
    ? new URLSearchParams(definedEntries(query).map(([k, v]) => [k, String(v)])).toString()
    : ''
  return `${qs ? `?${qs}` : ''}${hash ? `#${hash.replace(/^#/, '')}` : ''}`
}

/**
 * A locale-aware router hook for routers built with {@link createRouter}.
 *
 * Generates hrefs and navigates by **route id + locale**, resolving translated URL segments from the
 * registry. Switching locale simply navigates to that locale's real path.
 *
 * @throws If used outside a router created by {@link createRouter}.
 *
 * @example
 * const { router } = useRouter()
 * router.href({ id: 'about', locale: 'nl-BE' }) // '/nl-BE/over-ons'
 * await router.navigate({ to: 'about', locale: 'fr-BE' })
 */
export function useRouter(): { router: IRouter } {
  const tanstack = useTanstackRouter()
  const meta = getRouterMeta(tanstack)
  if (!meta) {
    throw new Error('useRouter must be used inside a router created by createRouter().')
  }
  const { registry, config, mounted } = meta

  const leaf = useRouterState({
    select: (s) => s.matches.at(-1)?.context as { locale?: ILocale; routeId?: string } | undefined,
  })
  const active = leaf?.locale ?? config.defaultLocale
  const activeId = leaf?.routeId

  const toLocale = (l?: LocaleInput): ILocale =>
    l == null
      ? active
      : typeof l !== 'string'
        ? l
        : (config.locales.find((x) => x.code === l) ?? Locale.new({ languageOrLocale: l }))

  const path: LooseRouter['path'] = ({ id, locale, params }) =>
    routePath(registry, config, id, toLocale(locale), params)

  const href: LooseRouter['href'] = ({ id, locale, params, query, hash }) =>
    path({ id, locale, params }) + suffix(query, hash)

  const absolute: LooseRouter['absolute'] = ({ baseUrl, ...rest }) =>
    (baseUrl ?? window.location.origin) + href(rest)

  const router: LooseRouter = {
    locale: active,
    routeId: activeId,
    locales: config.locales,
    has: (id, locale) => {
      if (!mounted.has(id)) return false
      if (locale == null) return true
      const code = toLocale(locale).code
      return availableLocales(registry, config, id).some((l) => l.code === code)
    },
    availableLocales: (id) => (mounted.has(id) ? availableLocales(registry, config, id) : []),
    path,
    href,
    absolute,
    reload: () => tanstack.invalidate(),
    goBack: async () => {
      tanstack.history.back()
    },
    canGoBack: () =>
      tanstack.history.canGoBack?.() ??
      (typeof window !== 'undefined' && window.history.length > 1),
    navigate: async ({ to, from, params, query, hash, locale, replace, state, target }) => {
      if (target === '_blank') {
        window.open(absolute({ id: to, locale, params, query, hash }), '_blank')
        return
      }
      await tanstack.navigate({
        to: path({ id: to, locale, params }),
        search: query ? cleanSearch(query) : undefined,
        hash,
        replace,
        state,
        from,
      } as never)
    },
  }

  // Bridge the loose runtime impl to the generic public surface (see LooseRouter's note).
  return { router: router as unknown as IRouter }
}
