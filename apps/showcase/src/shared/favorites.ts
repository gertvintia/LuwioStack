import { useLocalStorage } from '@luwio/storage'

/**
 * Saved locales, persisted with `@luwio/storage` — the list survives reloads and stays in sync
 * across browser tabs, with no extra wiring. Shared across feature slices.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>('luwio:showcase:favorites', [])

  const has = (code: string) => favorites.includes(code)

  const toggle = (code: string) =>
    setFavorites((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))

  const remove = (code: string) => setFavorites((prev) => prev.filter((c) => c !== code))

  return { favorites, has, toggle, remove }
}
