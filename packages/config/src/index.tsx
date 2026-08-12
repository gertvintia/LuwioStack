import { createContext, createElement, type ReactNode, useContext, useMemo } from 'react'

/**
 * Creates a typed runtime-config provider + hook pair.
 *
 * @param defaults Base configuration. Its shape defines the type of the whole config.
 */
export function createConfig<T extends Record<string, unknown>>(defaults: T) {
  const Context = createContext<T>(defaults)
  Context.displayName = 'LuwioConfig'

  function ConfigProvider({
    value,
    children,
  }: {
    /** Partial overrides merged (shallowly) over the defaults. */
    value?: Partial<T>
    children: ReactNode
  }) {
    const merged = useMemo<T>(() => ({ ...defaults, ...value }), [value])
    return createElement(Context.Provider, { value: merged }, children)
  }
  ConfigProvider.displayName = 'LuwioConfigProvider'

  /** Read the whole config object. */
  function useConfig(): T {
    return useContext(Context)
  }

  /** Read a single config value by key. */
  function useConfigValue<K extends keyof T>(key: K): T[K] {
    return useContext(Context)[key]
  }

  return { ConfigProvider, useConfig, useConfigValue, Context } as const
}
