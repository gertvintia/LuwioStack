// The Vite plugin (luwioRouter) generates this virtual module: it imports every *.route.tsx under
// src/ (each feature owns its own) and registers their exported routes. Importing it here populates
// routeRegistry at load time — the route SET is static; only the locale set is dynamic (see below).
import 'virtual:@luwio/router/routes'

import { createRouter, routeRegistry } from '@luwio/router'
import type { LocaleConfig } from './locale-config'

// The locales + default come from an API, so the router can't be built at module load — it's
// assembled once the config arrives, during bootstrap (see main.tsx). The registry is already full;
// createRouter just decides which locales to expand it into.
export function createAppRouter({ locales, defaultLocale }: LocaleConfig) {
  return createRouter(routeRegistry, {
    locales,
    defaultLocale,
    // Demo the unprefixed default: the default locale is served both at `/…` and `/<code>/…`, while
    // the others stay prefixed. Links in the default locale come out unprefixed (`/`, `/explore`).
    unprefixedDefault: true,
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>
