import { getDataset } from '../dataset/registry'
import {
  CountryCodeFormat,
  type ICountries,
  type ICountry,
  type IDatasetCountry,
  type ILanguages,
  type ILocale,
} from '../types'
import { toMachineName } from '../utils/to-machine-name'
import { Countries } from './countries'
import { Language } from './language'
import { Languages } from './languages'
import { Locale } from './locale'

const FORMAT_TO_FIELD: Record<CountryCodeFormat, keyof IDatasetCountry> = {
  [CountryCodeFormat.ALPHA2]: 'iso_3166_1_alpha2',
  [CountryCodeFormat.ALPHA3]: 'iso_3166_1_alpha3',
  [CountryCodeFormat.NUMERIC]: 'iso_3166_1_numeric',
}

export class Country implements ICountry {
  public readonly name: string
  public readonly machine_name: string
  public readonly code: string
  public readonly alpha2: string
  public readonly alpha3: string
  public readonly numeric: string
  public readonly direct_dialing_code: string

  private constructor(value: string, format: CountryCodeFormat) {
    const field = FORMAT_TO_FIELD[format]
    const entries = getDataset()

    const entry = entries.find(
      (d) => String(d.country[field]).toLowerCase() === value.toLowerCase(),
    )
    if (!entry) {
      throw new Error(`Unknown country: ${value}`)
    }

    const c = entry.country
    this.name = c.name
    this.machine_name = toMachineName(c.name)
    this.alpha2 = c.iso_3166_1_alpha2
    this.code = c.iso_3166_1_alpha2
    this.alpha3 = c.iso_3166_1_alpha3
    this.numeric = String(c.iso_3166_1_numeric).padStart(3, '0')
    this.direct_dialing_code = c.direct_dialing_code
  }

  /** Look up by ISO 3166-1 alpha-2 code. */
  public static new(value: { code: string }): Country {
    return new Country(value.code, CountryCodeFormat.ALPHA2)
  }

  /** Look up by code in an explicit format (defaults to alpha-2). */
  public static from(value: { code: string; format?: CountryCodeFormat }): Country {
    return new Country(value.code, value.format ?? CountryCodeFormat.ALPHA2)
  }

  public languages(): ILanguages {
    const entries = getDataset()
    const entry = entries.find(
      (d) => d.country.iso_3166_1_alpha2.toLowerCase() === this.alpha2.toLowerCase(),
    )

    let languages: ILanguages = Languages.empty()
    if (!entry) return languages

    for (const l of entry.country.languages.filter((l) => l.iso_639_1 !== '')) {
      languages = languages.add(Language.new({ code: l.iso_639_1 }))
    }

    return languages
  }

  public borders(): ICountries {
    const entries = getDataset()
    const entry = entries.find(
      (d) => d.country.iso_3166_1_alpha2.toLowerCase() === this.alpha2.toLowerCase(),
    )

    let borders: ICountries = Countries.empty()
    if (!entry) return borders

    for (const b of entry.country.borders) {
      borders = borders.add(Country.from({ code: b }))
    }

    return borders
  }

  public toLocale(value: { language: string }): ILocale {
    return Locale.new({ language: value.language, country: this.alpha2 })
  }
}
