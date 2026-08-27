import type { ConfigLoader, ConfigLoaderOptions, VersionedConfig, WatchOptions } from './types'
import { startWatch } from './watch'

/**
 * Creates a config loader: a small state machine around a fetch + a cache that gives you the three
 * things a config-based bootstrap needs — an initial `load()`, background `revalidate()`, and a
 * `watch()` for stale-while-revalidate.
 *
 * It is deliberately generic: `fetch` decides *where* config comes from (HTTP, a mock, anything),
 * `cache` decides *how* it survives reloads, and `map` decides the *shape* the app consumes. None of
 * it knows about locales or any particular app.
 *
 * @typeParam Raw - the JSON-serializable body as fetched and cached.
 * @typeParam Out - what `load()` returns after `map` (defaults to `Raw`).
 */
export function createConfigLoader<Raw, Out = Raw>(
  options: ConfigLoaderOptions<Raw, Out>,
): ConfigLoader<Out> {
  const { fetch, cache, debug } = options
  const map = options.map ?? ((raw: Raw) => raw as unknown as Out)

  // The version `load()` last applied. A revalidation that returns a different version means a new
  // config is published; the app is still running the applied one until it reloads.
  let appliedVersion: string | null = null

  const log = (message: string) => {
    if (debug) console.info(`[bootstrap] ${message}`)
  }

  // A conditional request against the cache: reuse the cached body on `unchanged`, store it on `fresh`.
  async function request(): Promise<VersionedConfig<Raw>> {
    const cached = cache?.read() ?? null
    const result = await fetch(cached?.version ?? null)

    if (result.status === 'unchanged') {
      if (!cached) {
        // We sent no version, so the source should never answer "unchanged" — treat as a bug/misconfig.
        throw new Error('config fetch returned "unchanged" with nothing cached to reuse')
      }
      log(`revalidated — reusing ${cached.version}`)
      return cached
    }

    const fresh: VersionedConfig<Raw> = { version: result.version, data: result.data }
    cache?.write(fresh)
    log(`fetched ${fresh.version}`)
    return fresh
  }

  async function load(): Promise<Out> {
    const { version, data } = await request()
    appliedVersion = version
    return map(data)
  }

  async function revalidate() {
    const { version } = await request()
    return { changed: version !== appliedVersion, version }
  }

  function watch(onChange: (info: { version: string }) => void, watchOptions?: WatchOptions) {
    return startWatch(revalidate, onChange, watchOptions)
  }

  return { load, revalidate, watch }
}
