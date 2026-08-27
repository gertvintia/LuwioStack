import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { NationalId } from './domain/national-id'
import { UnsupportedCountryError } from './types'

const BE = Country.new({ code: 'BE' })
const NL = Country.new({ code: 'NL' })
const FR = Country.new({ code: 'FR' })
const DE = Country.new({ code: 'DE' })
const ES = Country.new({ code: 'ES' })
const IT = Country.new({ code: 'IT' })
const PT = Country.new({ code: 'PT' })
const GB = Country.new({ code: 'GB' })
const US = Country.new({ code: 'US' })

describe('NationalId — Belgium (Rijksregisternummer)', () => {
  it('parses a valid RRN, exposing birth date and sex', () => {
    const id = NationalId.parse('85.07.30-033.28', BE)
    expect(id.value).toBe('85073003328')
    expect(id.countryCode).toBe('BE')
    expect(id.country().name).toBe('Belgium')
    if (id.details.countryCode !== 'BE') throw new Error('expected BE details')
    expect(id.details.isBis).toBe(false)
    expect(id.details.sex).toBe('male') // sequence 033 is odd
    expect(id.details.birthDate?.toISOString().slice(0, 10)).toBe('1985-07-30')
  })

  it('handles the 2000+ century variant', () => {
    const id = NationalId.parse('01051000274', BE)
    if (id.details.countryCode !== 'BE') throw new Error('expected BE details')
    expect(id.details.birthDate?.getUTCFullYear()).toBe(2001)
    expect(id.details.sex).toBe('female') // sequence 002 is even
  })

  it('accepts and flags a BIS number (month + 20, sex known)', () => {
    const id = NationalId.parse('90210100166', BE)
    if (id.details.countryCode !== 'BE') throw new Error('expected BE details')
    expect(id.details.isBis).toBe(true)
    expect(id.details.sex).toBe('male') // sequence 001, +20 → sex known
    expect(id.details.birthDate?.toISOString().slice(0, 10)).toBe('1990-01-01') // month 21 → January
  })

  it('leaves sex null for a BIS "+40" number (sex unknown at registration)', () => {
    const id = NationalId.parse('90431500587', BE)
    if (id.details.countryCode !== 'BE') throw new Error('expected BE details')
    expect(id.details.isBis).toBe(true)
    expect(id.details.sex).toBeNull() // +40 month form → sex unknown
    expect(id.details.birthDate?.toISOString().slice(0, 10)).toBe('1990-03-15')
  })

  it('leaves birthDate null when the number encodes an unknown birth date (00/00)', () => {
    const id = NationalId.parse('90000000146', BE)
    if (id.details.countryCode !== 'BE') throw new Error('expected BE details')
    expect(id.details.birthDate).toBeNull()
    expect(id.details.sex).toBe('male') // sequence parity is still meaningful
  })

  it('rejects a wrong check digit and a non-11-digit value', () => {
    expect(() => NationalId.parse('85073003329', BE)).toThrow(/Invalid national ID/)
    expect(() => NationalId.parse('123', BE)).toThrow(/Invalid national ID/)
    expect(NationalId.isValid('85073003328', BE)).toBe(true)
    expect(NationalId.isValid('85073003329', BE)).toBe(false)
  })
})

describe('NationalId — Netherlands (BSN)', () => {
  it('validates via the 11-test', () => {
    expect(NationalId.isValid('111222333', NL)).toBe(true)
    expect(NationalId.isValid('123456782', NL)).toBe(true)
    expect(NationalId.isValid('123456789', NL)).toBe(false) // fails 11-test
    expect(NationalId.isValid('000000000', NL)).toBe(false)
  })

  it('has no scheme-specific details, and pads 8-digit numbers', () => {
    const id = NationalId.parse('111 222 333', NL)
    expect(id.value).toBe('111222333')
    expect(id.details).toEqual({ countryCode: 'NL' })
    expect(NationalId.isValid('12345672', NL)).toBe(true) // 8 digits, padded to 012345672
  })
})

describe('NationalId — France (NIR)', () => {
  it('validates the key and reads sex', () => {
    const id = NationalId.parse('1 84 12 76 451 089 46', FR)
    expect(id.value).toBe('184127645108946')
    if (id.details.countryCode !== 'FR') throw new Error('expected FR details')
    expect(id.details.sex).toBe('male') // leading 1
    expect(NationalId.isValid('184127645108947', FR)).toBe(false) // wrong key
  })

  it('handles Corsica departments (2A/2B), where 2A → 19 for the checksum', () => {
    const id = NationalId.parse('2 55 08 2A 075 010 89', FR)
    expect(id.value).toBe('255082A07501089')
    if (id.details.countryCode !== 'FR') throw new Error('expected FR details')
    expect(id.details.sex).toBe('female') // leading 2
    expect(NationalId.isValid('255082A07501088', FR)).toBe(false) // wrong key
  })
})

describe('NationalId — Germany (Steuer-ID)', () => {
  it('validates the MOD 11,10 check and the repeated-digit rule', () => {
    expect(NationalId.isValid('11234567890', DE)).toBe(true)
    expect(NationalId.isValid('36529974107', DE)).toBe(true)
    expect(NationalId.isValid('11234567891', DE)).toBe(false) // wrong check digit
    expect(NationalId.isValid('12345678901', DE)).toBe(false) // no repeated digit
    expect(NationalId.isValid('01234567890', DE)).toBe(false) // leading zero
    expect(NationalId.parse('11234567890', DE).details).toEqual({ countryCode: 'DE' })
  })
})

describe('NationalId — Spain (DNI / NIE)', () => {
  it('validates the mod-23 control letter for DNI and NIE', () => {
    expect(NationalId.isValid('12345678Z', ES)).toBe(true) // DNI
    expect(NationalId.isValid('12345678-Z', ES)).toBe(true) // separators ignored
    expect(NationalId.isValid('12345678A', ES)).toBe(false) // wrong letter
    expect(NationalId.isValid('X1234567L', ES)).toBe(true) // NIE
    expect(NationalId.isValid('Z1234567R', ES)).toBe(true) // NIE (Z → 2)
    expect(NationalId.isValid('X1234567A', ES)).toBe(false) // wrong letter
    expect(NationalId.parse('12345678Z', ES).details).toEqual({ countryCode: 'ES' })
  })
})

describe('NationalId — Italy (Codice Fiscale)', () => {
  it('validates the control character and reads sex', () => {
    const id = NationalId.parse('RSSMRA85T10A562S', IT)
    expect(id.value).toBe('RSSMRA85T10A562S')
    if (id.details.countryCode !== 'IT') throw new Error('expected IT details')
    expect(id.details.sex).toBe('male') // day 10
    expect(NationalId.isValid('RSSMRA85T10A562X', IT)).toBe(false) // wrong control char
    expect(NationalId.isValid('RSSMRA85T50A562', IT)).toBe(false) // too short
    expect(NationalId.isValid('RSSMRA85T99A562U', IT)).toBe(false) // control char ok, but day 99 invalid
  })
})

describe('NationalId — Portugal (NIF)', () => {
  it('validates the mod-11 check digit', () => {
    expect(NationalId.isValid('501442600', PT)).toBe(true)
    expect(NationalId.isValid('213456788', PT)).toBe(true)
    expect(NationalId.isValid('501442601', PT)).toBe(false) // wrong check digit
    expect(NationalId.isValid('12345678', PT)).toBe(false) // too short
  })
})

describe('NationalId — United Kingdom (National Insurance number)', () => {
  it('validates the format and disallowed prefixes', () => {
    expect(NationalId.isValid('AB123456C', GB)).toBe(true)
    expect(NationalId.isValid('AB 12 34 56 C', GB)).toBe(true) // spaces ignored
    expect(NationalId.isValid('BG123456A', GB)).toBe(false) // disallowed prefix
    expect(NationalId.isValid('QQ123456C', GB)).toBe(false) // Q not allowed as first letter
    expect(NationalId.isValid('AB123456E', GB)).toBe(false) // suffix must be A-D
  })
})

describe('NationalId — registry', () => {
  it('lists supported countries and reports support', () => {
    expect(NationalId.supportedCountries().sort()).toEqual([
      'BE',
      'DE',
      'ES',
      'FR',
      'GB',
      'IT',
      'NL',
      'PT',
    ])
    expect(NationalId.isSupported(BE)).toBe(true)
    expect(NationalId.isSupported(US)).toBe(false)
  })

  it('throws UnsupportedCountryError for an unregistered country', () => {
    expect(() => NationalId.parse('123', US)).toThrow(UnsupportedCountryError)
    expect(() => NationalId.isValid('123', US)).toThrow(UnsupportedCountryError)
    try {
      NationalId.parse('123', US)
    } catch (err) {
      expect((err as UnsupportedCountryError).countryCode).toBe('US')
    }
  })
})
