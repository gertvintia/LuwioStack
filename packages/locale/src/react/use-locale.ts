import { useContext } from 'react'
import type { ICountry, ILanguage, ILanguages } from '../types'
import { LocaleContext } from './locale-context'

/** The active locale and everything resolved from it. */
export interface CurrentLocale {
  /** The full locale string, e.g. `"nl-BE"`. */
  locale: string
  /** ISO 639-1 language code, e.g. `"nl"`. */
  language_code: string
  /** ISO 3166-1 alpha-2 country code, e.g. `"BE"`. */
  country_code: string
  /** The resolved language. */
  language: ILanguage
  /** The resolved country. */
  country: ICountry
  /** Every language spoken in the country, plus the active one. */
  languages: ILanguages
  /** The native `Intl.Locale`. */
  toIntlLocale(): Intl.Locale
}

export interface UseLocaleResult {
  /** The active locale and everything resolved from it. */
  current: CurrentLocale
}

/** Read the active locale (and its resolved language/country) from context. */
export function useLocale(): UseLocaleResult {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a <Locale> provider')
  }

  return {
    current: {
      locale: context.locale,
      language_code: context.language_code,
      country_code: context.country_code,
      language: context.language(),
      country: context.country(),
      languages: context.languages(),
      toIntlLocale: () => context.toIntlLocale(),
    },
  }
}
