// Name catalogs shipped in each data package's `translations/` dir (in the package, but excluded
// from its published `dist` via `files: ["dist"]`). The docs imports them so implementors can
// download a ready `machine_name → name` catalog and drop it into their own project.
//
// Keys are already normalized `machine_name`s (generated with the package's own `toMachineName`), so
// a downloaded file works directly with `t(country.machine_name)` / `t(language.machine_name)` /
// `t(currency.machine_name)`.
import countriesEn from '../../../../packages/country/translations/countries.en.json'
import countriesNl from '../../../../packages/country/translations/countries.nl.json'
import currenciesEn from '../../../../packages/currency/translations/currencies.en.json'
import languagesEn from '../../../../packages/language/translations/languages.en.json'

type Catalog = Record<string, string>

/** Locale code → country-name catalog (machine_name → name). `en` always present. */
export const COUNTRY_CATALOGS: Record<string, Catalog> = { en: countriesEn, nl: countriesNl }

/** Locale code → language-name catalog (machine_name → name). `en` always present. */
export const LANGUAGE_CATALOGS: Record<string, Catalog> = { en: languagesEn }

/** Locale code → currency-name catalog (machine_name → name). `en` always present. */
export const CURRENCY_CATALOGS: Record<string, Catalog> = { en: currenciesEn }
