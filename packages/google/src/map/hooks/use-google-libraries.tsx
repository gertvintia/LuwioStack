import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import type { GoogleQueryEntry } from '../cache'
import { ensureGoogleLibrary, retryGoogleLibrary, subscribeGoogleLibrary } from '../cache'
import type { GoogleMapsLibraryApi } from '../types'

const EMPTY_ENTRIES: readonly GoogleQueryEntry[] = []

/**
 * Raw, reactive per-library entries (aligned index-for-index with the sorted name list) — the
 * shared primitive behind the public `useGoogleLibraries` below and `useSuspenseGoogleMaps`, which
 * needs each entry's `suspender` to throw on, not just the public-facing status/value/error.
 *
 * A single `useSyncExternalStore` (not one per library — the list length isn't fixed, so that
 * would break the rules of hooks) whose `subscribe`/`getSnapshot` loop over the plain array
 * internally instead. Only subscribes/imports once `ready` (the base script must already be
 * loaded — `google.maps.importLibrary` doesn't exist before that).
 */
export function useGoogleLibraryEntries(
  names: string[],
  ready: boolean,
): { names: string[]; entries: readonly GoogleQueryEntry[] } {
  // Consumers almost always pass a fresh array literal (`libraries: ["places"]`) inline on every
  // render, so this keys off content, not array identity, to avoid resubscribing needlessly.
  const sortedNames = [...names].sort()
  const namesKey = sortedNames.join(',')

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by namesKey/ready, not array identity
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!ready) return () => {}
      const unsubscribes = sortedNames.map((name) => subscribeGoogleLibrary(name, onStoreChange))
      return () => {
        for (const unsubscribe of unsubscribes) unsubscribe()
      }
    },
    [namesKey, ready],
  )

  // Caches the last snapshot per hook instance so useSyncExternalStore's Object.is check only
  // sees a new array reference when a requested library's own entry actually changed — same
  // reasoning as cache.ts replacing (not mutating) entries on every transition.
  const cacheRef = useRef<{
    names: string[]
    entries: GoogleQueryEntry[]
  } | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by namesKey/ready, not array identity
  const getSnapshot = useCallback((): readonly GoogleQueryEntry[] => {
    if (!ready) return EMPTY_ENTRIES
    const freshEntries = sortedNames.map((name) => ensureGoogleLibrary(name))
    const cached = cacheRef.current
    if (
      cached &&
      cached.names.length === sortedNames.length &&
      cached.names.every((name, i) => name === sortedNames[i]) &&
      cached.entries.every((entry, i) => entry === freshEntries[i])
    ) {
      return cached.entries
    }
    cacheRef.current = { names: sortedNames, entries: freshEntries }
    return freshEntries
  }, [namesKey, ready])

  const entries = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_ENTRIES)
  return { names: sortedNames, entries }
}

/**
 * Internal entry type — extends the public `GoogleMapsLibraryApi` with the raw namespace
 * value so `useGoogleMaps` can populate the loaded namespace without exposing `value`
 * on the public interface.
 */
export interface GoogleMapsRawLibraryEntry extends GoogleMapsLibraryApi {
  value: unknown
}

/**
 * Builds one independently-tracked entry per requested library name via
 * `google.maps.importLibrary`. Only starts importing once the base script itself is `"success"`;
 * before that, and with no libraries requested, the result is empty.
 */
export function useGoogleLibraries(
  names: string[],
  ready: boolean,
): Record<string, GoogleMapsRawLibraryEntry> {
  const { names: sortedNames, entries } = useGoogleLibraryEntries(names, ready)
  const namesKey = sortedNames.join(',')

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by namesKey, not array identity
  return useMemo(() => {
    const result: Record<string, GoogleMapsRawLibraryEntry> = {}
    sortedNames.forEach((name, i) => {
      const entry = entries[i]
      if (!entry) return
      result[name] = {
        status: entry.status,
        isPending: entry.status === 'pending',
        isLoading: entry.status === 'pending',
        isSuccess: entry.status === 'success',
        isError: entry.status === 'error',
        value: entry.status === 'success' ? entry.data : undefined,
        error: entry.status === 'error' ? (entry.data as Error) : undefined,
        retry: () => retryGoogleLibrary(name),
      }
    })
    return result
  }, [namesKey, entries])
}
