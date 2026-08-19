import { useContext } from 'react'
import type { ILocale } from '../types'
import { LocaleContext } from './locale-context'

/** The active locale. */
export interface CurrentLocale {
  /**
   * The active locale — the same object `Locale.new()` returns. Use it exactly like a
   * `Locale.new(...)` result: `current.locale.code`, `current.locale.language()`,
   * `current.locale.country()`, `current.locale.continent()`, `current.locale.toIntlLocale()`.
   */
  locale: ILocale
}

export interface UseLocaleResult {
  /** The active locale. */
  current: CurrentLocale
}

// Wrap once per locale instance. The provider memoizes the ILocale, so its identity is stable
// until the locale changes — keying a WeakMap on it gives `current` a stable identity across
// renders (so it's safe in dependency arrays) without re-allocating on every render.
const cache = new WeakMap<ILocale, CurrentLocale>()

function toCurrent(locale: ILocale): CurrentLocale {
  const cached = cache.get(locale)
  if (cached) return cached
  const current: CurrentLocale = { locale }
  cache.set(locale, current)
  return current
}

/** Read the active locale from context. `current.locale` is a full `Locale` (see {@link CurrentLocale}). */
export function useLocale(): UseLocaleResult {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a <Locale> provider')
  }
  return { current: toCurrent(context) }
}
