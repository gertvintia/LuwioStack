import { describe, expect, it } from 'vitest'
import { Currencies, Currency, toMachineName } from './index'

describe('Currency', () => {
  it('looks up by ISO 4217 code and exposes the core fields', () => {
    const eur = Currency.new({ code: 'EUR' })
    expect(eur.code).toBe('EUR')
    expect(eur.name).toBe('Euro')
    expect(eur.symbol).toBe('€')
    expect(eur.minor_units).toBe(2)
    expect(eur.machine_name).toBe('euro')
  })

  it('exposes minor units per currency', () => {
    expect(Currency.new({ code: 'JPY' }).minor_units).toBe(0)
    expect(Currency.new({ code: 'BHD' }).minor_units).toBe(3)
  })

  it('is case-insensitive on the code', () => {
    expect(Currency.new({ code: 'usd' }).code).toBe('USD')
    expect(Currency.new({ code: 'usd' }).name).toBe('US Dollar')
  })

  it('throws on an unknown currency', () => {
    expect(() => Currency.new({ code: 'ZZZ' })).toThrow(/Unknown currency/)
  })
})

describe('Currencies', () => {
  it('de-duplicates by code', () => {
    const set = Currencies.empty()
      .add(Currency.new({ code: 'EUR' }))
      .add(Currency.new({ code: 'USD' }))
      .add(Currency.new({ code: 'EUR' }))
    expect(set.size).toBe(2)
    expect(set.toArray().map((c) => c.code)).toEqual(['EUR', 'USD'])
  })

  it('removes by identity', () => {
    const set = Currencies.empty().add(Currency.new({ code: 'EUR' }))
    expect(set.remove(Currency.new({ code: 'EUR' })).size).toBe(0)
  })

  it('enumerates the whole dataset with all()', () => {
    const all = Currencies.all().toArray()
    expect(all.length).toBeGreaterThan(150)
    expect(all.find((c) => c.code === 'EUR')?.name).toBe('Euro')
  })
})

describe('toMachineName', () => {
  it('slugifies the currency name', () => {
    expect(toMachineName('US Dollar')).toBe('us_dollar')
  })
})
