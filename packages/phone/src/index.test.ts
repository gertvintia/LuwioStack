import { describe, expect, it } from 'vitest'
import { formatPhone, parsePhone } from './index'

describe('@luwio/phone', () => {
  it('parses an international number', () => {
    const p = parsePhone('+32 470 12 34 56')
    expect(p.countryCode).toBe('+32')
    expect(p.e164).toBe('+3247012 34 56'.replace(/\s/g, ''))
    expect(p.e164).toBe('+32470123456')
  })

  it('applies a default country code to a local number', () => {
    const p = parsePhone('0470 12 34 56', '+32')
    expect(p.countryCode).toBe('+32')
    expect(p.e164).toBe('+32470123456')
  })

  it('formats in each style', () => {
    const p = parsePhone('0470123456', '+32')
    expect(formatPhone(p, 'e164')).toBe('+32470123456')
    expect(formatPhone(p, 'national')).toBe('470123456')
    expect(formatPhone(p, 'international')).toBe('+32 470123456')
  })

  it('throws on input without digits', () => {
    expect(() => parsePhone('abc')).toThrow()
  })
})
