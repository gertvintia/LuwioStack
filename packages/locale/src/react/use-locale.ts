import { useContext } from 'react'
import type { ILocale } from '../types'
import { LocaleContext } from './locale-context'

export interface UseLocaleResult {
  /**
   * The active locale — the same object `Locale.new()` returns. Use it exactly like a
   * `Locale.new(...)` result: `locale.code`, `locale.language()`, `locale.country()`,
   * `locale.continent()`, `locale.toIntlLocale()`.
   */
  locale: ILocale
}

/**
 * Read the active locale from context. `locale` is a full `Locale` (see {@link UseLocaleResult}).
 *
 * The provider memoizes the locale on its `code`, so `locale`'s identity is stable until the locale
 * changes — safe to use directly in dependency arrays.
 */
export function useLocale(): UseLocaleResult {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a <Locale> provider')
  }
  return { locale: context }
}
