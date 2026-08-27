import { useContext } from 'react'
import type { ILanguage } from '../types'
import { LanguageContext } from './language-context'

export interface UseLanguageResult {
  /**
   * The active language — the same object `Language.new()` returns. Use it exactly like a
   * `Language.new(...)` result: `language.code`, `language.name`, `language.alpha3`.
   */
  language: ILanguage
}

/**
 * Read the active language from context. `language` is a full `Language` (see
 * {@link UseLanguageResult}).
 *
 * Works inside a `<LanguageProvider>`, or inside `<LocaleProvider>` (which provides the locale's
 * language under the hood). The provider memoizes on `code`, so `language`'s identity is stable —
 * safe to use directly in dependency arrays.
 */
export function useLanguage(): UseLanguageResult {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a <Language> (or <Locale>) provider')
  }
  return { language: context }
}
