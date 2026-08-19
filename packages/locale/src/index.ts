// Re-exported domain from the packages @luwio/locale composes — so `@luwio/locale` stays a
// one-stop import, while each is also installable on its own.
export {
  CONTINENT_MAP,
  Continent,
  Countries,
  Country,
  CountryCodeFormat,
  type IContinent,
  type ICountries,
  type ICountry,
  toMachineName,
} from '@luwio/country'
export {
  type ILanguage,
  type ILanguages,
  Language,
  LanguageCodeFormat,
  Languages,
} from '@luwio/language'

// React bindings. `Locale` also carries the static factories `Locale.new` (construct),
// `Locale.resolve` (resolve against a supported set) and `Locale.system` (the detected locale).
export { LocaleContext } from './react/locale-context'
export { Locale, type LocaleProps } from './react/locale-provider'
export { type CurrentLocale, type UseLocaleResult, useLocale } from './react/use-locale'
// Types
export type { ILocale, LocaleOverrides } from './types'
// Utilities
export { matchLocalePattern } from './utils/match-locale-pattern'
export { normalizeLocale } from './utils/normalize-locale'
