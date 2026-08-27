// @luwio/router — a locale-aware route registry for TanStack Router.
//
// Define one route per file with createRoute(), give it a translated URL segment per locale with
// .alias(), register it, then expand the whole registry into a TanStack router with createRouter().

// @tanstack/react-router is vendored into this package's bundle (see tsdown.config.ts). Apps never
// install or import it directly — these are the only structural bindings we surface: mount the tree
// with <RouterProvider router={createRouter(...)} />, render children with <Outlet />, render a
// route's head() tags with <HeadContent /> (and <Scripts /> for SSR), throw redirect()/notFound()
// from a route's beforeLoad/loader, and stream deferred loader data with <Await> / useAwaited /
// defer(). Everything else is URL generation and imperative navigation via useRouter().
export {
  Await,
  defer,
  HeadContent,
  notFound,
  Outlet,
  RouterProvider,
  redirect,
  Scripts,
  useAwaited,
} from '@tanstack/react-router'
export { createRouter, type RouterConfig } from './create-router'
export { RouteRegistry, registerModules, routeRegistry } from './registry'
export {
  createRoute,
  RouteBuilder,
  type RouteConfig,
  type RouteContext,
  type RouteHandlerCtx,
  type RouteHead,
  type RouteHeadCtx,
  type RouteOptions,
} from './route-builder'
export {
  useRouteContext,
  useRouteLoaderData,
  useRouteLocale,
  useRouteParams,
  useRouteQuery,
} from './route-hooks'
export {
  type AbsoluteHrefParams,
  availableLocales,
  type HrefParams,
  type IRouter,
  type LocaleInput,
  type NavigateParams,
  type ParamsFor,
  type PathParams,
  type PathParamsInput,
  type QueryParams,
  type RouteId,
  type RouteRegister,
  routePath,
  type SearchFor,
  useRouter,
} from './use-router'
