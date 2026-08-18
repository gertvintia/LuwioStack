// @luwio/phone — parse and format phone numbers.
// Skeleton: a small, dependency-free core. Full per-country validation and formatting
// (à la libphonenumber) is on the roadmap.

export interface PhoneNumber {
  /** International dialing code including the leading `+`, e.g. `'+32'`. */
  readonly countryCode: string
  /** The national (subscriber) number, digits only. */
  readonly nationalNumber: string
  /** The full number in E.164 form, e.g. `'+3247...'`. */
  readonly e164: string
}

export type PhoneFormat = 'e164' | 'international' | 'national'

const DIGITS = /\d+/g

/**
 * Parse a phone number into its parts. Pass `defaultCountryCode` (e.g. `'+32'`) to interpret
 * numbers written without an international prefix.
 */
export function parsePhone(input: string, defaultCountryCode = ''): PhoneNumber {
  const trimmed = input.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = (trimmed.match(DIGITS) ?? []).join('')
  if (digits === '') {
    throw new Error('@luwio/phone: no digits in input')
  }

  if (hasPlus) {
    // Skeleton heuristic: treat the first 1–3 digits as the country code.
    const cc = digits.slice(0, digits.length > 10 ? 2 : 1)
    const national = digits.slice(cc.length)
    return { countryCode: `+${cc}`, nationalNumber: national, e164: `+${digits}` }
  }

  const cc = defaultCountryCode.replace(/\D/g, '')
  const national = digits.replace(/^0+/, '')
  return {
    countryCode: cc ? `+${cc}` : '',
    nationalNumber: national,
    e164: cc ? `+${cc}${national}` : national,
  }
}

/** Format a parsed phone number. */
export function formatPhone(phone: PhoneNumber, format: PhoneFormat = 'international'): string {
  switch (format) {
    case 'e164':
      return phone.e164
    case 'national':
      return phone.nationalNumber
    default:
      return phone.countryCode
        ? `${phone.countryCode} ${phone.nationalNumber}`
        : phone.nationalNumber
  }
}
