import type { ILanguages } from '@luwio/language'

export interface IContinent {
  name: string
  /** Machine-readable identifier, stable across translations. */
  machine_name: string
  /** Two-letter continent code, e.g. `"EU"`. */
  code: string
  countries(): ICountries
}

export interface ICountry {
  name: string
  /** The country name in its own language(s), e.g. `"België / Belgique"`. */
  name_local: string
  /** Machine-readable identifier, stable across translations. */
  machine_name: string
  /** Primary code — ISO 3166-1 alpha-2, e.g. `"BE"`. Alias of {@link ICountry.alpha2}. */
  code: string
  /** ISO 3166-1 alpha-2 code. */
  alpha2: string
  /** ISO 3166-1 alpha-3 code. */
  alpha3: string
  /** ISO 3166-1 numeric code (zero-padded to 3 digits). */
  numeric: string
  /** Capital city. */
  capital: string
  /** UN geoscheme sub-region, e.g. `"Western Europe"`. */
  region: string
  /** International dialing prefix, e.g. `"+32"`. */
  dialing_code: string
  /** ISO 4217 currency code, e.g. `"EUR"`. Symbol + formatting live in `@luwio/money`. */
  currency_code: string
  /** IANA/UTC-offset timezones, e.g. `["UTC+01:00"]`. */
  timezones: string[]
  languages(): ILanguages
  borders(): ICountries
  continent(): IContinent
}

export enum CountryCodeFormat {
  ALPHA2 = 'alpha2',
  ALPHA3 = 'alpha3',
  NUMERIC = 'numeric',
}

export interface ICountries {
  readonly size: number
  add(country: ICountry): ICountries
  remove(country: ICountry): ICountries
  removeBy(by: CountryCodeFormat, identifiers: string[] | string): ICountries
  lookUpsBy(by: CountryCodeFormat, identifiers: string[]): ICountries
  lookUpBy(by: CountryCodeFormat, identifiers: string): ICountry | undefined
  toArray(): ICountry[]
}

/** A row in the bundled ISO 3166 dataset. Internal shape — the public model is {@link ICountry}. */
export interface ICountryRow {
  name: string
  name_local: string
  iso_3166_1_alpha2: string
  iso_3166_1_alpha3: string
  iso_3166_1_numeric: number
  continent: string
  region: string
  capital: string
  dialing_code: string
  currency_code: string
  timezones: string[]
  borders: string[]
  /** ISO 639-1 codes of the languages spoken here — resolved to `Language` objects on demand. */
  language_codes: string[]
}
