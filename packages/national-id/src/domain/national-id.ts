import { Country, type ICountry } from '@luwio/country'
import { registry } from '../registry'
import { type INationalId, type NationalIdDetails, UnsupportedCountryError } from '../types'

/**
 * A validated national identification number (e.g. a Belgian Rijksregisternummer, a Dutch BSN,
 * a French NIR). Build one with {@link NationalId.parse}; an instance is always valid.
 *
 * Support is a per-country registry — {@link NationalId.supportedCountries} lists what's covered.
 * Parsing an unsupported country throws {@link UnsupportedCountryError} (distinct from an invalid
 * value), so "not implemented yet" never reads as "invalid".
 *
 * The React-free domain lives here (`@luwio/national-id`); `<NationalId>` / `useNationalId` are at
 * `@luwio/national-id/react`.
 */
export class NationalId implements INationalId {
  readonly value: string
  readonly countryCode: string
  /** Scheme-specific parsed data — narrow on `details.countryCode` to read a country's extras. */
  readonly details: NationalIdDetails

  private constructor(value: string, details: NationalIdDetails) {
    this.value = value
    this.countryCode = details.countryCode
    this.details = details
  }

  /**
   * Parse & validate `value` for `country`. Separators (spaces, dots, dashes, slashes) and case are
   * ignored. Throws {@link UnsupportedCountryError} if the country has no spec, or a plain `Error`
   * if the value is invalid for that country.
   */
  static parse(value: string, country: ICountry): NationalId {
    const spec = registry.get(country.code)
    if (!spec) throw new UnsupportedCountryError(country.code)
    const normalized = value.replace(/[\s.\-/]/g, '').toUpperCase()
    const details = spec.parse(normalized)
    if (!details) throw new Error(`Invalid national ID for ${country.code}: ${value}`)
    return new NationalId(normalized, details)
  }

  /**
   * Non-throwing validity check for a supported country. Throws {@link UnsupportedCountryError} if
   * the country isn't supported — gate with {@link NationalId.isSupported} first.
   */
  static isValid(value: string, country: ICountry): boolean {
    if (!registry.has(country.code)) throw new UnsupportedCountryError(country.code)
    try {
      NationalId.parse(value, country)
      return true
    } catch {
      return false
    }
  }

  /** Whether a validator is registered for `country`. */
  static isSupported(country: ICountry): boolean {
    return registry.has(country.code)
  }

  /** ISO 3166-1 alpha-2 codes with a registered validator. */
  static supportedCountries(): string[] {
    return [...registry.keys()]
  }

  /** The country this ID belongs to, as a `@luwio/country` Country. */
  country(): ICountry {
    return Country.new({ code: this.countryCode })
  }
}
