import { readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'

/** Options for the {@link luwioRouter} Vite plugin. */
export interface LuwioRouterPluginOptions {
  /** Directory scanned for route files, relative to the Vite root. Default: `'src/routes'`. */
  routesDir?: string
  /** Filename suffix that marks a route module (before the extension). Default: `'.route'`. */
  suffix?: string
  /** The virtual module id imported once to load every route. Default: `'virtual:@luwio/router/routes'`. */
  virtualId?: string
}

const DEFAULT_ROUTES_DIR = 'src/routes'
const DEFAULT_SUFFIX = '.route'
const DEFAULT_VIRTUAL_ID = 'virtual:@luwio/router/routes'

/**
 * Vite plugin that auto-discovers route files so they self-register — no glob in your app code.
 *
 * Scans `routesDir` for `*.route.{ts,tsx,js,jsx}` files and exposes a virtual module that collects
 * each one's exported route(s) via `registerModules`. Import it once, before you call `createRouter`:
 *
 * ```ts
 * // vite.config.ts
 * import { luwioRouter } from '@luwio/router/vite'
 * export default defineConfig({ plugins: [luwioRouter()] })
 * ```
 *
 * ```ts
 * // router.ts
 * import 'virtual:@luwio/router/routes' // every *.route file is now registered
 * import { createRouter, routeRegistry } from '@luwio/router'
 * ```
 *
 * Adding, removing, or editing a route file triggers a full reload so the registry is rebuilt
 * cleanly (its `add()` throws on duplicates, so stale entries must not linger). Keep route files
 * thin — put components in their own modules — so day-to-day component edits keep fast HMR.
 */
export function luwioRouter(options: LuwioRouterPluginOptions = {}): Plugin {
  const routesDir = options.routesDir ?? DEFAULT_ROUTES_DIR
  const suffix = options.suffix ?? DEFAULT_SUFFIX
  const virtualId = options.virtualId ?? DEFAULT_VIRTUAL_ID
  const resolvedId = `\0${virtualId}`
  const fileRe = new RegExp(`${suffix.replace(/\./g, '\\.')}\\.[jt]sx?$`)

  let root = process.cwd()
  const absRoutesDir = (): string => resolve(root, routesDir)

  const findRouteFiles = (): string[] => {
    try {
      const entries = readdirSync(absRoutesDir(), { recursive: true }) as string[]
      return entries
        .filter((rel) => fileRe.test(rel))
        .map((rel) => join(absRoutesDir(), rel))
        .sort()
    } catch {
      return [] // routes dir doesn't exist yet
    }
  }

  const isRouteFile = (file: string): boolean =>
    fileRe.test(file) && resolve(file).startsWith(absRoutesDir() + sep)

  return {
    name: '@luwio/router',
    enforce: 'pre',

    configResolved(config) {
      root = config.root
    },

    resolveId(id) {
      if (id === virtualId) return resolvedId
    },

    load(id) {
      if (id !== resolvedId) return
      // Root-relative, forward-slashed specifiers (e.g. '/src/routes/about.route.tsx') — the same
      // form source files use, so Vite resolves them the same way in dev and build, every OS.
      const specs = findRouteFiles().map((file) => `/${relative(root, file).replace(/\\/g, '/')}`)
      const imports = specs.map((spec, i) => `import * as m${i} from ${JSON.stringify(spec)}`)
      const names = specs.map((_, i) => `m${i}`).join(', ')
      // Collect each file's exported route(s) — route files just `export`, never call add().
      return `import { registerModules } from '@luwio/router'\n${imports.join('\n')}\nregisterModules([${names}])\n`
    },

    configureServer(server) {
      const reload = (file: string) => {
        if (!isRouteFile(file)) return
        const mod = server.moduleGraph.getModuleById(resolvedId)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
      server.watcher.on('change', reload)
    },
  }
}
