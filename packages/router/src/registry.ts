import { RouteBuilder } from './route-builder'

/**
 * Collects {@link RouteBuilder}s. Routes usually land here via {@link registerModules} (driven by
 * the `@luwio/router/vite` plugin or a glob), then the registry is handed to `createRouter`, which
 * expands it into a real TanStack route tree.
 *
 * Most apps use the shared {@link routeRegistry} singleton. Construct your own `RouteRegistry` when
 * you need an isolated set — tests, or several routers in one app.
 */
export class RouteRegistry {
  readonly #routes: RouteBuilder[] = []

  /**
   * Register a route. A low-level primitive — route files normally just `export` their route and
   * let {@link registerModules} add it.
   *
   * @throws If a route with the same id was already registered.
   */
  add(route: RouteBuilder): this {
    if (this.#routes.some((r) => r.id === route.id)) {
      throw new Error(`A route with id "${route.id}" is already registered.`)
    }
    this.#routes.push(route)
    return this
  }

  /** All registered routes, in registration order. */
  all(): readonly RouteBuilder[] {
    return this.#routes
  }

  /** Look up a registered route by id. */
  get(id: string): RouteBuilder | undefined {
    return this.#routes.find((r) => r.id === id)
  }

  /** Remove every registered route. Mainly useful in tests. */
  clear(): void {
    this.#routes.length = 0
  }
}

/** The shared registry used by most apps. */
export const routeRegistry = new RouteRegistry()

/**
 * Register every {@link RouteBuilder} exported by the given modules — so route files just
 * `export` their route and never call `add()` themselves.
 *
 * Accepts what a bundler hands you: the record from `import.meta.glob(..., { eager: true })`, or an
 * array of module namespaces (what the `@luwio/router/vite` plugin passes). Any export that is a
 * `RouteBuilder` — default or named — is registered; everything else is ignored.
 *
 * @example
 * // No plugin? One line in your app:
 * registerModules(import.meta.glob('./routes/**\/*.route.tsx', { eager: true }))
 */
export function registerModules(
  modules: Record<string, unknown> | readonly unknown[],
  registry: RouteRegistry = routeRegistry,
): RouteRegistry {
  const namespaces = Array.isArray(modules) ? modules : Object.values(modules)
  for (const namespace of namespaces) {
    if (!namespace || typeof namespace !== 'object') continue
    for (const value of Object.values(namespace as Record<string, unknown>)) {
      if (value instanceof RouteBuilder) registry.add(value)
    }
  }
  return registry
}
