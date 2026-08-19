import { useContext } from 'react'
import type { ICountry, ILanguage, ILanguages, ILocale } from '../types'
import { LocaleContext } from './locale-context'

/** The active locale and everything resolved from it. */
export interface CurrentLocale {
  /** The BCP-47 locale, e.g. `{ code: 'nl-BE' }`. */
  locale: { readonly code: string }
  /** The language — `language.code` is `'nl'`, `language.name` is `'Dutch'`. */
  language: ILanguage
  /** The country — `country.code` is `'BE'`, `country.name` is `'Belgium'`. */
  country: ICountry
  /** Every language spoken in the country, plus the active one. */
  languages: ILanguages
  /** The native `Intl.Locale`. */
  intl: Intl.Locale
}

export interface UseLocaleResult {
  /** The active locale and everything resolved from it. */
  current: CurrentLocale
}

// Resolve once per locale instance. The provider memoizes the ILocale, so its identity is stable
// until the locale changes — keying a WeakMap on it gives `current` a stable identity and computes
// the (dataset-backed) language/region/languages lookups only once, not on every render.
const cache = new WeakMap<ILocale, CurrentLocale>()

function toCurrent(locale: ILocale): CurrentLocale {
  const cached = cache.get(locale)
  if (cached) return cached
  const current: CurrentLocale = {
    locale: { code: locale.locale },
    language: locale.language(),
    country: locale.country(),
    languages: locale.languages(),
    intl: locale.toIntlLocale(),
  }
  cache.set(locale, current)
  return current
}

/** Read the active locale (and its resolved language/region) from context. */
export function useLocale(): UseLocaleResult {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a <Locale> provider')
  }
  return { current: toCurrent(context) }
}
