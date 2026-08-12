import { useContext } from 'react'
import type { ICountry, ILanguage, ILocale } from '../types'
import { LocaleContext } from './locale-context'

export interface UseLocaleResult {
  locale: ILocale
  language: ILanguage
  language_code: string
  country: ICountry
  country_code: string
}

/** Read the active locale (and its resolved language/country) from context. */
export function useLocale(): UseLocaleResult {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }

  return {
    locale: context,
    language_code: context.language_code,
    country_code: context.country_code,
    language: context.language(),
    country: context.country(),
  }
}
