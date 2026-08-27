// Domain (React-free) re-exported from the packages @luwio/locale composes, plus the pure `Locale`
// factory. React bindings (`<Locale>`, `useLocale`, and the composed providers/hooks) live at
// `@luwio/locale/react`.
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
export { Locale } from './locale'
export type { ILocale, LocaleOverrides } from './types'
export { matchLocalePattern } from './utils/match-locale-pattern'
export { normalizeLocale } from './utils/normalize-locale'
