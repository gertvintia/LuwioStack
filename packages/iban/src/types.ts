import type { ICountry } from '@luwio/country'

export interface IIban {
  /** Canonical compact form (no spaces, uppercase), e.g. `"BE68539007547034"`. */
  value: string
  /** ISO 3166-1 alpha-2 country code, e.g. `"BE"`. */
  countryCode: string
  /** The two check digits, e.g. `"68"`. */
  checkDigits: string
  /** The Basic Bank Account Number — everything after the check digits. */
  bban: string
  /** The country this IBAN belongs to, as a `@luwio/country` {@link ICountry}. */
  country(): ICountry
  /** Print (paper) format — grouped in blocks of four, e.g. `"BE68 5390 0754 7034"`. */
  format(): string
}
