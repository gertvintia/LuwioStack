// @luwio/bootstrap/react — React bindings for config-based bootstrap.
//
// Two ways to use it, both on top of a `createConfigLoader` from the root entry:
//   • <Bootstrap loader fallback>{config => …}</Bootstrap> — a gate that fetches before it renders,
//     ideal when startup needs the config synchronously (e.g. building a router from it).
//   • useConfigUpdate(loader) — a headless hook for the "new config published, reload?" nudge, for
//     apps that bootstrap imperatively in their entry file and just want the update signal.
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ConfigLoader, WatchOptions } from './types'

const MISSING = Symbol('luwio.bootstrap.missing')
const ConfigContext = createContext<unknown>(MISSING)
ConfigContext.displayName = 'LuwioBootstrapConfig'

export interface BootstrapProps<T> {
  /** The loader whose `load()` provides the config. */
  loader: ConfigLoader<T>
  /** Shown while the first fetch is in flight. Default: nothing. */
  fallback?: ReactNode
  /** Rendered if the fetch rejects. Receives the error and a `retry` to try again. */
  error?: (error: unknown, retry: () => void) => ReactNode
  /** Rendered once with the loaded config — build your router / app here. */
  children: (config: T) => ReactNode
}

type GateState<T> =
  | { phase: 'loading' }
  | { phase: 'ready'; config: T }
  | { phase: 'error'; error: unknown }

/**
 * A bootstrap gate: fetches the config once, shows `fallback` until it resolves, then renders
 * `children(config)` with the config also provided via context (`useBootstrapConfig`). `children`
 * runs a single time per successful load, so it is safe to build singletons (a router) inside it.
 */
export function Bootstrap<T>({ loader, fallback = null, error, children }: BootstrapProps<T>) {
  const [state, setState] = useState<GateState<T>>({ phase: 'loading' })
  const startedRef = useRef(false)
  const childrenRef = useRef(children)
  childrenRef.current = children

  const run = useCallback(() => {
    setState({ phase: 'loading' })
    loader.load().then(
      (config) => setState({ phase: 'ready', config }),
      (err) => setState({ phase: 'error', error: err }),
    )
  }, [loader])

  useEffect(() => {
    // Guard against StrictMode's double-invoke (and any remount) so we fetch exactly once.
    if (startedRef.current) return
    startedRef.current = true
    run()
  }, [run])

  const config = state.phase === 'ready' ? state.config : null
  // Compute the app tree once, when the config first resolves — stable across later re-renders.
  const tree = useMemo(() => (config === null ? null : childrenRef.current(config)), [config])

  if (state.phase === 'loading') return <>{fallback}</>
  if (state.phase === 'error') return <>{error?.(state.error, run) ?? null}</>
  return <ConfigContext.Provider value={state.config}>{tree}</ConfigContext.Provider>
}

/** Read the config loaded by the nearest `<Bootstrap>`. Throws if used outside one. */
export function useBootstrapConfig<T>(): T {
  const value = useContext(ConfigContext)
  if (value === MISSING) {
    throw new Error('useBootstrapConfig must be used inside <Bootstrap>')
  }
  return value as T
}

export interface ConfigUpdate {
  /** True once the backend has published a config newer than the one this app booted with. */
  available: boolean
  /** The newly published version, or `null` until one is seen. */
  version: string | null
  /** Reload the page to apply the new config (re-runs boot). */
  reload: () => void
}

/**
 * Watch for a newer published config (stale-while-revalidate) and expose it as a reload nudge.
 * Self-contained: give it the loader and render your own banner from `{ available, reload }`.
 */
export function useConfigUpdate<T>(loader: ConfigLoader<T>, options?: WatchOptions): ConfigUpdate {
  const [update, setUpdate] = useState<{ available: boolean; version: string | null }>({
    available: false,
    version: null,
  })

  const intervalMs = options?.intervalMs
  useEffect(() => {
    return loader.watch(({ version }) => setUpdate({ available: true, version }), { intervalMs })
  }, [loader, intervalMs])

  const reload = useCallback(() => {
    if (typeof window !== 'undefined') window.location.reload()
  }, [])

  return { available: update.available, version: update.version, reload }
}
