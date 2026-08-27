import type { ILocale } from '@luwio/locale'
import {
  useLoaderData,
  useParams,
  useRouterState,
  useSearch,
  useRouteContext as useTanstackRouteContext,
  useRouter as useTanstackRouter,
} from '@tanstack/react-router'
import { getRouterMeta } from './router-meta'

// Thin, locale-aware wrappers around TanStack's per-route hooks. Each defaults to the CURRENT route
// (TanStack's `strict: false`), so a page component reads its own data with no `from` boilerplate.
// To target another route type-safely, use TanStack's hooks directly with a `from` id.

/**
 * The active locale, read straight from the router state (the `{ routeId, locale }` injected into
 * context by `createRouter`). Unlike `@luwio/locale`'s `useLocale`, this does not require the
 * `<Locale>` provider — so it also works in a `notFoundComponent` above it.
 *
 * @throws If used outside a router created by {@link createRouter}.
 */
export function useRouteLocale(): { locale: ILocale; language: string; region: string } {
  const tanstack = useTanstackRouter()
  const fallback = getRouterMeta(tanstack)?.config.defaultLocale
  const locale =
    useRouterState({
      select: (s) => (s.matches.at(-1)?.context as { locale?: ILocale } | undefined)?.locale,
    }) ?? fallback
  if (!locale) {
    throw new Error('useRouteLocale must be used inside a router created by createRouter().')
  }
  return { locale, language: locale.language_code, region: locale.country_code }
}

/** The current route's path params (wraps TanStack `useParams`). */
export function useRouteParams<T = Record<string, string>>(): T {
  return useParams({ strict: false }) as unknown as T
}

/** The current route's query/search params (wraps TanStack `useSearch`). */
export function useRouteQuery<T = Record<string, unknown>>(): T {
  return useSearch({ strict: false }) as unknown as T
}

/** The current route's loader data (wraps TanStack `useLoaderData`). */
export function useRouteLoaderData<T = unknown>(): T {
  return useLoaderData({ strict: false }) as unknown as T
}

/**
 * The current route's context — includes the `{ routeId, locale }` injected by `createRouter`
 * (wraps TanStack `useRouteContext`).
 */
export function useRouteContext<T = unknown>(): T {
  return useTanstackRouteContext({ strict: false }) as unknown as T
}
