import type { AnyRouter } from '@tanstack/react-router'
import type { RouterConfig } from './create-router'
import type { RouteRegistry } from './registry'

/** The locale metadata a router was built with — needed by {@link useRouter} to compute hrefs. */
export interface RouterMeta {
  registry: RouteRegistry
  config: RouterConfig
  /** The ids actually mounted — the registry minus anything dropped by `config.exclude`. */
  mounted: ReadonlySet<string>
}

// Keyed by the router instance so a built router carries its own registry + config without any public
// API change. A WeakMap lets the metadata be garbage-collected alongside the router.
const store = new WeakMap<AnyRouter, RouterMeta>()

/** Stamp the locale metadata onto a router. Called by {@link createRouter}. */
export function setRouterMeta(router: AnyRouter, meta: RouterMeta): void {
  store.set(router, meta)
}

/** Read the locale metadata off a router, if it was built by {@link createRouter}. */
export function getRouterMeta(router: AnyRouter): RouterMeta | undefined {
  return store.get(router)
}
