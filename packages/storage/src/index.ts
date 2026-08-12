import { useCallback, useMemo, useSyncExternalStore } from 'react'

export interface StorageSerializer<T> {
  parse: (raw: string) => T
  stringify: (value: T) => string
}

export interface UseStorageOptions<T> {
  /** Custom (de)serialization. Defaults to JSON. */
  serializer?: StorageSerializer<T>
}

const jsonSerializer: StorageSerializer<unknown> = {
  parse: (raw) => JSON.parse(raw),
  stringify: (value) => JSON.stringify(value),
}

function getStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    // Access can throw in sandboxed iframes / privacy modes.
    return null
  }
}

/**
 * Creates a React hook bound to a specific Web Storage area. Values stay in sync
 * across every hook using the same key — and, for localStorage, across browser tabs.
 */
export function createStorageHook(kind: 'local' | 'session') {
  return function useStorage<T>(
    key: string,
    initialValue: T,
    options: UseStorageOptions<T> = {},
  ): readonly [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const serializer = (options.serializer ?? jsonSerializer) as StorageSerializer<T>

    const subscribe = useCallback(
      (onChange: () => void) => {
        if (typeof window === 'undefined') return () => {}
        const handler = (event: StorageEvent) => {
          if (event.key === null || event.key === key) onChange()
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
      },
      [key],
    )

    const getSnapshot = useCallback((): string | null => {
      return getStorage(kind)?.getItem(key) ?? null
    }, [key])

    const raw = useSyncExternalStore(subscribe, getSnapshot, () => null)

    const value = useMemo<T>(() => {
      if (raw === null) return initialValue
      try {
        return serializer.parse(raw)
      } catch {
        return initialValue
      }
    }, [raw, serializer, initialValue])

    const setValue = useCallback(
      (next: T | ((prev: T) => T)) => {
        const storage = getStorage(kind)
        if (!storage) return
        const current = ((): T => {
          const existing = storage.getItem(key)
          if (existing === null) return initialValue
          try {
            return serializer.parse(existing)
          } catch {
            return initialValue
          }
        })()
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
        storage.setItem(key, serializer.stringify(resolved))
        // `storage` events don't fire in the same document — notify local subscribers.
        window.dispatchEvent(new StorageEvent('storage', { key }))
      },
      [key, initialValue, serializer],
    )

    const remove = useCallback(() => {
      const storage = getStorage(kind)
      if (!storage) return
      storage.removeItem(key)
      window.dispatchEvent(new StorageEvent('storage', { key }))
    }, [key])

    return [value, setValue, remove] as const
  }
}

/** Reactive `localStorage`, synced across tabs. */
export const useLocalStorage = createStorageHook('local')

/** Reactive `sessionStorage`, scoped to the current tab. */
export const useSessionStorage = createStorageHook('session')
