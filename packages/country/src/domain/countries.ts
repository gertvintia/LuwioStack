import { countryRows } from '../data'
import { CountryCodeFormat, type ICountries, type ICountry } from '../types'
import { Country } from './country'

function codeFor(country: ICountry, by: CountryCodeFormat): string {
  switch (by) {
    case CountryCodeFormat.ALPHA2:
      return country.alpha2
    case CountryCodeFormat.ALPHA3:
      return country.alpha3
    case CountryCodeFormat.NUMERIC:
      return country.numeric
  }
}

/** An immutable collection of {@link ICountry}, de-duplicated by alpha-3 code. */
export class Countries implements ICountries {
  private readonly values: ICountry[]

  private constructor(values: ICountry[]) {
    this.values = values
  }

  public static new(value: { countries: ICountry[] }): Countries {
    return new Countries(value.countries)
  }

  public static empty(): Countries {
    return new Countries([])
  }

  /** Every country in the bundled ISO 3166 dataset, in source order. */
  public static all(): Countries {
    return new Countries(countryRows.map((row) => Country.new({ code: row.iso_3166_1_alpha2 })))
  }

  public static fromAlpha2(value: { alpha2: string[] }): Countries {
    return new Countries(value.alpha2.map((c) => Country.from({ code: c })))
  }

  public static fromAlpha3(value: { alpha3: string[] }): Countries {
    return new Countries(
      value.alpha3.map((c) => Country.from({ code: c, format: CountryCodeFormat.ALPHA3 })),
    )
  }

  public static fromNumeric(value: { numeric: string[] }): Countries {
    return new Countries(
      value.numeric.map((c) => Country.from({ code: c, format: CountryCodeFormat.NUMERIC })),
    )
  }

  public static benelux(): Countries {
    return Countries.fromAlpha2({ alpha2: ['BE', 'NL', 'LU'] })
  }

  add(country: ICountry): ICountries {
    const exists = this.values.some(
      (item) => item.alpha3.toLowerCase() === country.alpha3.toLowerCase(),
    )
    if (exists) return this
    return new Countries([...this.values, country])
  }

  remove(country: ICountry): ICountries {
    return new Countries(
      this.values.filter((item) => item.alpha3.toLowerCase() !== country.alpha3.toLowerCase()),
    )
  }

  removeBy(by: CountryCodeFormat, identifiers: string[] | string): ICountries {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers]
    let result: ICountries = this
    for (const country of this.lookUpsBy(by, ids).toArray()) {
      result = result.remove(country)
    }
    return result
  }

  lookUpsBy(by: CountryCodeFormat, identifiers: string[]): ICountries {
    const wanted = new Set(identifiers.map((id) => id.toLowerCase()))
    let result: ICountries = Countries.empty()
    for (const country of this.values) {
      if (wanted.has(codeFor(country, by).toLowerCase())) {
        result = result.add(country)
      }
    }
    return result
  }

  lookUpBy(by: CountryCodeFormat, identifier: string): ICountry | undefined {
    return this.values.find(
      (country) => codeFor(country, by).toLowerCase() === identifier.toLowerCase(),
    )
  }

  toArray(): ICountry[] {
    return this.values
  }

  get size(): number {
    return this.values.length
  }
}
