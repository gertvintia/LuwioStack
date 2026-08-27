import { Country, type ICountry } from '@luwio/country'
import type {
  PhoneNumberFormat as GoogleFormatEnum,
  PhoneNumber as GooglePhoneNumber,
  PhoneNumberType as GoogleTypeEnum,
} from 'google-libphonenumber'
// google-libphonenumber is CommonJS and exposes no static ESM named exports, so a named
// `import { … }` breaks in real Node ESM. Import the default (the whole module) and destructure the
// runtime values; the enum/class *types* come from the `import type` above.
import googleLibphonenumber from 'google-libphonenumber'
import { type IPhone, type PhoneFormat, PhoneNumberType } from '../types'

const {
  PhoneNumberFormat: GoogleFormat,
  PhoneNumberType: GoogleType,
  PhoneNumberUtil,
} = googleLibphonenumber

const util = PhoneNumberUtil.getInstance()

const TYPE_MAP: Partial<Record<GoogleTypeEnum, PhoneNumberType>> = {
  [GoogleType.FIXED_LINE]: PhoneNumberType.FIXED_LINE,
  [GoogleType.MOBILE]: PhoneNumberType.MOBILE,
  [GoogleType.FIXED_LINE_OR_MOBILE]: PhoneNumberType.FIXED_LINE_OR_MOBILE,
  [GoogleType.TOLL_FREE]: PhoneNumberType.TOLL_FREE,
  [GoogleType.PREMIUM_RATE]: PhoneNumberType.PREMIUM_RATE,
  [GoogleType.SHARED_COST]: PhoneNumberType.SHARED_COST,
  [GoogleType.VOIP]: PhoneNumberType.VOIP,
  [GoogleType.PERSONAL_NUMBER]: PhoneNumberType.PERSONAL_NUMBER,
  [GoogleType.PAGER]: PhoneNumberType.PAGER,
  [GoogleType.UAN]: PhoneNumberType.UAN,
  [GoogleType.VOICEMAIL]: PhoneNumberType.VOICEMAIL,
}

const FORMAT_MAP: Record<PhoneFormat, GoogleFormatEnum> = {
  E164: GoogleFormat.E164,
  INTERNATIONAL: GoogleFormat.INTERNATIONAL,
  NATIONAL: GoogleFormat.NATIONAL,
  RFC3966: GoogleFormat.RFC3966,
}

/**
 * A parsed, validated phone number, backed by `google-libphonenumber`.
 *
 * Build one with {@link Phone.parse} — it throws on anything that isn't a valid number, so an
 * instance is always valid. Read `nationalNumber`, `countryCode` (ISO region), `dialCode`, `type`
 * and {@link Phone.country} (a `@luwio/country` Country), or {@link Phone.format} to E.164 /
 * international / national / RFC3966.
 */
export class Phone implements IPhone {
  /** The ISO 3166-1 alpha-2 region the number belongs to — e.g. `"BE"`. */
  public readonly countryCode: string
  /** The country calling (dial) code — e.g. `32` for `+32`. */
  public readonly dialCode: number
  /** The national (subscriber) number, without the dial code — e.g. `470123456`. */
  public readonly nationalNumber: number

  private constructor(private readonly phone: GooglePhoneNumber) {
    if (!util.isValidNumber(phone)) {
      throw new Error('Invalid phone number')
    }

    const region = util.getRegionCodeForNumber(phone)
    if (!region) {
      throw new Error('Invalid region code')
    }

    const dialCode = phone.getCountryCode()
    if (dialCode === undefined) {
      throw new Error('Invalid dial code')
    }

    const nationalNumber = phone.getNationalNumber()
    if (nationalNumber === undefined) {
      throw new Error('Invalid national number')
    }

    this.countryCode = region
    this.dialCode = dialCode
    this.nationalNumber = nationalNumber
  }

  /**
   * Parse a phone number. E.164 input (`"+32470123456"`) needs no country; a national-format string
   * (`"0470 12 34 56"`) needs the {@link ICountry} it belongs to. Throws on an invalid or
   * unparseable number.
   *
   * @example
   * Phone.parse('+32470123456')
   * Phone.parse('0470 12 34 56', Country.new({ code: 'BE' }))
   */
  public static parse(phone: string, country?: ICountry): Phone {
    let parsed: GooglePhoneNumber
    try {
      parsed = util.parse(phone, country?.code)
    } catch (cause) {
      throw new Error(`Invalid phone number: ${phone}`, { cause })
    }
    return new Phone(parsed)
  }

  /** Whether `phone` parses to a valid number (non-throwing companion to {@link Phone.parse}). */
  public static isValid(phone: string, country?: ICountry): boolean {
    try {
      return util.isValidNumber(util.parse(phone, country?.code))
    } catch {
      return false
    }
  }

  /** The line type, e.g. `MOBILE` / `FIXED_LINE`. */
  public get type(): PhoneNumberType {
    return TYPE_MAP[util.getNumberType(this.phone)] ?? PhoneNumberType.UNKNOWN
  }

  /** The country this number belongs to, as a `@luwio/country` {@link ICountry}. */
  public country(): ICountry {
    return Country.new({ code: this.countryCode })
  }

  /** Format the number; defaults to E.164 (e.g. `"+32470123456"`). */
  public format(format: PhoneFormat = 'E164'): string {
    return util.format(this.phone, FORMAT_MAP[format])
  }
}
