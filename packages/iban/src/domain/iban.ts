import { Country, type ICountry } from '@luwio/country'
import { IBAN_LENGTHS } from '../data'
import type { IIban } from '../types'

const FORMAT = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/

/** ISO 13616 MOD-97-10 over an arbitrarily long string (letters A–Z → 10–35), computed streaming. */
function mod97(input: string): number {
  let remainder = ''
  for (const ch of input) {
    const code = ch.charCodeAt(0)
    remainder += code >= 65 && code <= 90 ? String(code - 55) : ch
    if (remainder.length > 9) remainder = String(Number(remainder) % 97)
  }
  return Number(remainder) % 97
}

/**
 * A validated IBAN, e.g. `Iban.parse('BE68 5390 0754 7034')`. One global algorithm (ISO 13616)
 * plus a per-country length registry validates every IBAN country. Build with {@link Iban.parse}
 * (throws on anything invalid, so an instance is always valid).
 */
export class Iban implements IIban {
  public readonly value: string
  public readonly countryCode: string
  public readonly checkDigits: string
  public readonly bban: string

  private constructor(compact: string) {
    const countryCode = compact.slice(0, 2)
    const expected = IBAN_LENGTHS[countryCode]
    if (!FORMAT.test(compact) || expected === undefined || compact.length !== expected) {
      throw new Error(`Invalid IBAN: ${compact}`)
    }
    if (mod97(`${compact.slice(4)}${compact.slice(0, 4)}`) !== 1) {
      throw new Error(`Invalid IBAN: ${compact}`)
    }
    this.value = compact
    this.countryCode = countryCode
    this.checkDigits = compact.slice(2, 4)
    this.bban = compact.slice(4)
  }

  /** Parse & validate an IBAN (spaces and case are ignored). Throws on an invalid IBAN. */
  public static parse(value: string): Iban {
    return new Iban(value.replace(/\s+/g, '').toUpperCase())
  }

  /** Whether `value` is a valid IBAN (non-throwing companion to {@link Iban.parse}). */
  public static isValid(value: string): boolean {
    try {
      Iban.parse(value)
      return true
    } catch {
      return false
    }
  }

  /** The ISO 3166-1 alpha-2 codes with a defined IBAN format. */
  public static supportedCountries(): string[] {
    return Object.keys(IBAN_LENGTHS)
  }

  /** The country this IBAN belongs to, as a `@luwio/country` {@link ICountry}. */
  public country(): ICountry {
    return Country.new({ code: this.countryCode })
  }

  /** Print (paper) format — grouped in blocks of four, e.g. `"BE68 5390 0754 7034"`. */
  public format(): string {
    return this.value.replace(/(.{4})/g, '$1 ').trim()
  }
}
