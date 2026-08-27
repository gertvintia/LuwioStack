import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { Phone, PhoneNumberType } from './index'

describe('Phone', () => {
  it('parses an E.164 number and exposes the core fields', () => {
    const p = Phone.parse('+32470123456')
    expect(p.countryCode).toBe('BE')
    expect(p.dialCode).toBe(32)
    expect(p.nationalNumber).toBe(470123456)
    expect(p.type).toBe(PhoneNumberType.MOBILE)
  })

  it('parses a national-format number given a country', () => {
    const p = Phone.parse('0470 12 34 56', Country.new({ code: 'BE' }))
    expect(p.countryCode).toBe('BE')
    expect(p.format()).toBe('+32470123456')
  })

  it('exposes the country as a @luwio/country Country', () => {
    const p = Phone.parse('+32470123456')
    expect(p.country().name).toBe('Belgium')
    expect(p.country().currency_code).toBe('EUR')
  })

  it('formats in the requested style (E.164 by default)', () => {
    const p = Phone.parse('+32470123456')
    expect(p.format()).toBe('+32470123456')
    expect(p.format('NATIONAL')).toBe('0470 12 34 56')
    expect(p.format('INTERNATIONAL')).toBe('+32 470 12 34 56')
    expect(p.format('RFC3966')).toBe('tel:+32-470-12-34-56')
  })

  it('classifies the line type', () => {
    expect(Phone.parse('+81312345678').type).toBe(PhoneNumberType.FIXED_LINE)
    expect(Phone.parse('+18002530000').type).toBe(PhoneNumberType.TOLL_FREE)
    expect(Phone.parse('+16502530000').type).toBe(PhoneNumberType.FIXED_LINE_OR_MOBILE)
  })

  it('throws on an unparseable or invalid number', () => {
    expect(() => Phone.parse('not a phone')).toThrow(/Invalid phone number/)
    expect(() => Phone.parse('+3212')).toThrow(/Invalid phone number/)
  })

  it('isValid is a non-throwing check', () => {
    expect(Phone.isValid('+32470123456')).toBe(true)
    expect(Phone.isValid('0470 12 34 56', Country.new({ code: 'BE' }))).toBe(true)
    expect(Phone.isValid('not a phone')).toBe(false)
    expect(Phone.isValid('+3212')).toBe(false)
  })
})
