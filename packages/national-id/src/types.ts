import type { ICountry } from '@luwio/country'

export type Sex = 'male' | 'female'

/**
 * Scheme-specific parsed data, discriminated by `countryCode`. Only the fields a country's number
 * actually encodes appear on its variant — there are no fields that are silently `null` for half
 * the countries. Narrow before reading extras:
 *
 * ```ts
 * if (id.details.countryCode === 'BE') id.details.isBis // typed
 * ```
 *
 * Countries whose scheme carries no personal data (DE, ES, GB, NL, PT) have only `countryCode`.
 *
 * A field is nullable only when a *valid* number can itself leave it unspecified — never as a
 * "we didn't compute it" placeholder. That happens only for Belgium: `birthDate` is `null` when the
 * number encodes an unknown birth date (`00/00`), and `sex` is `null` for a BIS number registered
 * with sex unknown (the "+40" month form). FR and IT always encode sex, so it's non-null there.
 */
export type NationalIdDetails =
  | { countryCode: 'BE'; birthDate: Date | null; sex: Sex | null; isBis: boolean }
  | { countryCode: 'FR'; sex: Sex }
  | { countryCode: 'IT'; sex: Sex }
  | { countryCode: 'DE' }
  | { countryCode: 'ES' }
  | { countryCode: 'GB' }
  | { countryCode: 'NL' }
  | { countryCode: 'PT' }

export interface INationalId {
  /** Normalized identifier (separators stripped, uppercased), e.g. `"85073003328"`. */
  value: string
  /** ISO 3166-1 alpha-2 country code, e.g. `"BE"`. */
  countryCode: string
  /** Scheme-specific parsed data — see {@link NationalIdDetails}. */
  details: NationalIdDetails
  /** The country this ID belongs to, as a `@luwio/country` {@link ICountry}. */
  country(): ICountry
}

/** A per-country validator/parser, registered by ISO code. Add a country by adding one of these. */
export interface NationalIdSpec {
  /** Validate the (pre-normalized) value; return its scheme-specific details, or `null` if invalid. */
  parse(value: string): NationalIdDetails | null
}

/** Thrown when no spec is registered for a country — distinct from an *invalid* value. */
export class UnsupportedCountryError extends Error {
  public readonly countryCode: string
  constructor(countryCode: string) {
    super(`National ID is not supported for country: ${countryCode}`)
    this.name = 'UnsupportedCountryError'
    this.countryCode = countryCode
  }
}
