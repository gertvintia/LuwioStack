import type { IContinent, ICountry } from '@luwio/country'
import type { ILanguage, ILanguages } from '@luwio/language'

export interface ILocale {
  locale: string
  /** The BCP-47 tag, e.g. `'nl-BE'`. Alias of {@link ILocale.locale}, for symmetry with the `code` on `ICountry`/`ILanguage`/`IContinent`. */
  code: string
  language_code: string
  country_code: string
  language(): ILanguage
  languages(): ILanguages
  country(): ICountry
  continent(): IContinent
  toIntlLocale(): Intl.Locale
}

/** Override map for {@link resolveLocale}. The `*` catch-all key is required. */
export type LocaleOverrides = { '*': string } & Record<string, string>
