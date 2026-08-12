import type { ReactNode } from 'react'

// @luwio/router — typed routing primitives for React.
// Skeleton: the surface is intentionally small and will grow.

export interface RouteDefinition<Params = Record<string, string>> {
  /** Path pattern, e.g. `/users/:id`. */
  path: string
  /** Render the matched route. */
  render: (params: Params) => ReactNode
}

/**
 * Identity helper that preserves the literal types of your route list while
 * constraining each entry to a {@link RouteDefinition}.
 */
export function defineRoutes<const T extends readonly RouteDefinition[]>(routes: T): T {
  return routes
}

export const version = '0.0.0'
