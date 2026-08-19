import { type ILanguages, Language, Languages } from '@luwio/language'
import { countryRows } from '../data'
import {
  CountryCodeFormat,
  type IContinent,
  type ICountries,
  type ICountry,
  type ICountryRow,
} from '../types'
import { toMachineName } from '../utils/to-machine-name'
import { CONTINENT_MAP, Continent } from './continent'
import { Countries } from './countries'

const FORMAT_TO_FIELD: Record<CountryCodeFormat, keyof ICountryRow> = {
  [CountryCodeFormat.ALPHA2]: 'iso_3166_1_alpha2',
  [CountryCodeFormat.ALPHA3]: 'iso_3166_1_alpha3',
  [CountryCodeFormat.NUMERIC]: 'iso_3166_1_numeric',
}

export class Country implements ICountry {
  public readonly name: string
  public readonly name_local: string
  public readonly machine_name: string
  public readonly code: string
  public readonly alpha2: string
  public readonly alpha3: string
  public readonly numeric: string
  public readonly capital: string
  public readonly region: string
  public readonly direct_dialing_code: string
  public readonly currency_code: string
  public readonly currency_symbol: string
  public readonly flag: string
  public readonly timezones: string[]

  private readonly row: ICountryRow

  private constructor(value: string, format: CountryCodeFormat) {
    const field = FORMAT_TO_FIELD[format]
    const needle = value.toLowerCase()

    const row = countryRows.find((r) => {
      const raw = String(r[field]).toLowerCase()
      // Numeric codes are conventionally 3 digits — match '56' and '056' alike.
      return format === CountryCodeFormat.NUMERIC
        ? raw.padStart(3, '0') === needle.padStart(3, '0')
        : raw === needle
    })
    if (!row) {
      throw new Error(`Unknown country: ${value}`)
    }

    this.row = row
    this.name = row.name
    this.name_local = row.name_local
    this.machine_name = toMachineName(row.name)
    this.alpha2 = row.iso_3166_1_alpha2
    this.code = row.iso_3166_1_alpha2
    this.alpha3 = row.iso_3166_1_alpha3
    this.numeric = String(row.iso_3166_1_numeric).padStart(3, '0')
    this.capital = row.capital
    this.region = row.region
    this.direct_dialing_code = row.direct_dialing_code
    this.currency_code = row.currency_code
    this.currency_symbol = row.currency_symbol
    this.flag = row.flag
    this.timezones = row.timezones
  }

  /** Look up by ISO 3166-1 alpha-2 code, e.g. `Country.new({ code: 'BE' })`. */
  public static new(value: { code: string }): Country {
    return new Country(value.code, CountryCodeFormat.ALPHA2)
  }

  /** Look up by code in an explicit format (defaults to alpha-2). */
  public static from(value: { code: string; format?: CountryCodeFormat }): Country {
    return new Country(value.code, value.format ?? CountryCodeFormat.ALPHA2)
  }

  /** The languages spoken in this country, resolved via `@luwio/language`. */
  public languages(): ILanguages {
    let languages: ILanguages = Languages.empty()
    for (const code of this.row.language_codes) {
      languages = languages.add(Language.new({ code }))
    }
    return languages
  }

  /** The countries this one shares a land border with. */
  public borders(): ICountries {
    let borders: ICountries = Countries.empty()
    for (const b of this.row.borders) {
      borders = borders.add(Country.from({ code: b }))
    }
    return borders
  }

  /** The continent this country belongs to. */
  public continent(): IContinent {
    const match = Object.entries(CONTINENT_MAP).find(([, name]) => name === this.row.continent)
    if (!match) {
      throw new Error(`Unknown continent for country: ${this.alpha2}`)
    }
    return Continent.new({ code: match[0] })
  }
}
