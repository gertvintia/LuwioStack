import { describe, expect, it } from 'vitest'
import { add, formatMoney, money } from './index'

describe('@luwio/money', () => {
  it('rejects non-integer minor units', () => {
    expect(() => money(19.99, 'EUR')).toThrow(/integer/)
  })

  it('adds same-currency amounts', () => {
    expect(add(money(1999, 'EUR'), money(1, 'EUR'))).toEqual({ cents: 2000, currency: 'EUR' })
  })

  it('refuses to add mixed currencies', () => {
    expect(() => add(money(100, 'EUR'), money(100, 'USD'))).toThrow(/cannot add/)
  })

  it('formats currency for a locale', () => {
    expect(formatMoney(money(1999, 'USD'), 'en-US')).toBe('$19.99')
  })
})
