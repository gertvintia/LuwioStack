// Types & enums

// Dataset — bring your own data or extend the built-in
export {
  builtinDataSource,
  configureDataset,
  defineDataSource,
  getDataset,
  resetDataset,
} from './dataset'
// Domain entities
export { CONTINENT_MAP, Continent } from './domain/continent'
export { Countries } from './domain/countries'
export { Country } from './domain/country'
export { Language } from './domain/language'
export { Languages } from './domain/languages'
export { Locale } from './domain/locale'
export { SystemLocale } from './domain/system-locale'
// React bindings
export { LocaleContext } from './react/locale-context'
export { LocaleProvider, type LocaleProviderProps } from './react/locale-provider'
export { type UseLocaleResult, useLocale } from './react/use-locale'
export * from './types'
// Utilities
export { createLocale } from './utils/create-locale'
export { matchLocalePattern } from './utils/match-locale-pattern'
export { normalizeLocale } from './utils/normalize-locale'
export { resolveLocale } from './utils/resolve-locale'
export { resolvePolicy } from './utils/resolve-policy'
export { toMachineName } from './utils/to-machine-name'
