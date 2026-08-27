import type { ConfigCache, VersionedConfig } from './types'

// Web Storage-backed cache. Every read/write is guarded: storage can throw (private mode, disabled
// cookies) or be absent (SSR), and a failure should degrade to "always fetch", never crash boot.
function webStorageCache<T>(key: string, getStore: () => Storage | undefined): ConfigCache<T> {
  return {
    read() {
      try {
        const raw = getStore()?.getItem(key)
        return raw ? (JSON.parse(raw) as VersionedConfig<T>) : null
      } catch {
        return null
      }
    },
    write(value) {
      try {
        getStore()?.setItem(key, JSON.stringify(value))
      } catch {
        // Storage unavailable — skip caching for this session.
      }
    },
  }
}

const win = (): (Window & typeof globalThis) | undefined =>
  typeof window === 'undefined' ? undefined : window

/**
 * Cache the config in `sessionStorage` (per tab; survives a refresh, not a new tab). The natural
 * analog of the browser's HTTP cache for a `no-cache` resource — a good default.
 */
export function sessionStorageCache<T>(key: string): ConfigCache<T> {
  return webStorageCache(key, () => win()?.sessionStorage)
}

/** Cache the config in `localStorage` (persists across tabs and restarts). */
export function localStorageCache<T>(key: string): ConfigCache<T> {
  return webStorageCache(key, () => win()?.localStorage)
}

/** In-memory cache — for tests or SSR, where Web Storage isn't available or wanted. */
export function memoryCache<T>(): ConfigCache<T> {
  let value: VersionedConfig<T> | null = null
  return {
    read: () => value,
    write: (next) => {
      value = next
    },
  }
}
