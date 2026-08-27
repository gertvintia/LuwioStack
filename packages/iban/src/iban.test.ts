import { describe, expect, it } from 'vitest'
import { Iban } from './index'

describe('Iban', () => {
  it('parses a valid IBAN and exposes the parts', () => {
    const iban = Iban.parse('BE68 5390 0754 7034')
    expect(iban.value).toBe('BE68539007547034')
    expect(iban.countryCode).toBe('BE')
    expect(iban.checkDigits).toBe('68')
    expect(iban.bban).toBe('539007547034')
  })

  it('ignores spaces and case', () => {
    expect(Iban.parse('be68539007547034').value).toBe('BE68539007547034')
  })

  it('exposes the country as a @luwio/country Country', () => {
    expect(Iban.parse('BE68539007547034').country().name).toBe('Belgium')
    expect(Iban.parse('DE89370400440532013000').country().name).toBe('Germany')
  })

  it('formats in print groups of four', () => {
    expect(Iban.parse('BE68539007547034').format()).toBe('BE68 5390 0754 7034')
    expect(Iban.parse('GB82WEST12345698765432').format()).toBe('GB82 WEST 1234 5698 7654 32')
  })

  it('validates the checksum, length and country', () => {
    expect(Iban.isValid('NL91ABNA0417164300')).toBe(true) // valid
    expect(Iban.isValid('FR7630006000011234567890189')).toBe(true)
    expect(Iban.isValid('BE68539007547035')).toBe(false) // bad check digit
    expect(Iban.isValid('BE6853900754703')).toBe(false) // wrong length
    expect(Iban.isValid('ZZ68539007547034')).toBe(false) // unknown country
    expect(Iban.isValid('not an iban')).toBe(false)
  })

  it('throws on an invalid IBAN', () => {
    expect(() => Iban.parse('BE68539007547035')).toThrow(/Invalid IBAN/)
  })

  it('lists the supported IBAN countries', () => {
    const codes = Iban.supportedCountries()
    expect(codes.length).toBeGreaterThan(75)
    expect(codes).toContain('BE')
    expect(codes).toContain('DE')
  })
})
