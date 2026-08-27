import type { ICountry } from '@luwio/country'

/** The line type of a phone number, mirroring libphonenumber's `PhoneNumberType`. */
export enum PhoneNumberType {
  FIXED_LINE = 'FIXED_LINE',
  MOBILE = 'MOBILE',
  FIXED_LINE_OR_MOBILE = 'FIXED_LINE_OR_MOBILE',
  TOLL_FREE = 'TOLL_FREE',
  PREMIUM_RATE = 'PREMIUM_RATE',
  SHARED_COST = 'SHARED_COST',
  VOIP = 'VOIP',
  PERSONAL_NUMBER = 'PERSONAL_NUMBER',
  PAGER = 'PAGER',
  UAN = 'UAN',
  VOICEMAIL = 'VOICEMAIL',
  UNKNOWN = 'UNKNOWN',
}

/** Output formats for {@link IPhone.format}, mapped to libphonenumber's `PhoneNumberFormat`. */
export type PhoneFormat = 'E164' | 'INTERNATIONAL' | 'NATIONAL' | 'RFC3966'

export interface IPhone {
  /** The national (subscriber) number, without the dial code — e.g. `470123456`. */
  nationalNumber: number
  /** The ISO 3166-1 alpha-2 region the number belongs to — e.g. `"BE"`. */
  countryCode: string
  /** The country calling (dial) code — e.g. `32` for `+32`. */
  dialCode: number
  /** The line type, e.g. `MOBILE` / `FIXED_LINE`. */
  type: PhoneNumberType
  /** The country this number belongs to, as a `@luwio/country` {@link ICountry}. */
  country(): ICountry
  /** Format the number; defaults to E.164 (e.g. `"+32470123456"`). */
  format(format?: PhoneFormat): string
}
