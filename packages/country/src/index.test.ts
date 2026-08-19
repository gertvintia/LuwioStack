import { describe, expect, it } from 'vitest'
import {
  CONTINENT_MAP,
  Continent,
  Countries,
  Country,
  CountryCodeFormat,
  toMachineName,
} from './index'

describe('Country', () => {
  it('looks up by ISO 3166-1 alpha-2 and exposes the core fields', () => {
    const be = Country.new({ code: 'BE' })
    expect(be.name).toBe('Belgium')
    expect(be.code).toBe('BE')
    expect(be.alpha2).toBe('BE')
    expect(be.alpha3).toBe('BEL')
    expect(be.numeric).toBe('056')
    expect(be.direct_dialing_code).toBe('+32')
    expect(be.currency_code).toBe('EUR')
    expect(be.currency_symbol).toBe('€')
    expect(be.flag).toBe('🇧🇪')
    expect(be.capital).toBe('Brussels')
  })

  it('looks up by alpha-3 and numeric', () => {
    expect(Country.from({ code: 'BEL', format: CountryCodeFormat.ALPHA3 }).code).toBe('BE')
    expect(Country.from({ code: '056', format: CountryCodeFormat.NUMERIC }).code).toBe('BE')
  })

  it('resolves spoken languages via @luwio/language', () => {
    const langs = Country.new({ code: 'BE' })
      .languages()
      .toArray()
      .map((l) => l.code)
    expect(langs).toEqual(['nl', 'fr', 'de'])
  })

  it('resolves borders and continent', () => {
    const borders = Country.new({ code: 'BE' })
      .borders()
      .toArray()
      .map((c) => c.code)
    expect(borders).toEqual(['FR', 'DE', 'LU', 'NL'])
    expect(Country.new({ code: 'BE' }).continent().code).toBe('EU')
    expect(Country.new({ code: 'BE' }).continent().name).toBe('Europe')
  })

  it('throws on an unknown country', () => {
    expect(() => Country.new({ code: 'ZZ' })).toThrow(/unknown country/i)
  })
})

describe('Continent', () => {
  it('maps codes to names', () => {
    expect(Continent.new({ code: 'EU' }).name).toBe('Europe')
    expect(Continent.europe().code).toBe('EU')
    expect(Object.keys(CONTINENT_MAP)).toContain('AF')
  })

  it('lists its countries', () => {
    const europe = Continent.europe().countries()
    expect(europe.size).toBeGreaterThan(0)
    expect(europe.toArray().some((c) => c.code === 'BE')).toBe(true)
  })
})

describe('Countries', () => {
  it('builds the Benelux and de-duplicates', () => {
    expect(Countries.benelux().size).toBe(3)
    expect(Countries.benelux().add(Country.new({ code: 'BE' })).size).toBe(3)
  })
})

describe('toMachineName', () => {
  it('slugifies and strips diacritics', () => {
    expect(toMachineName("Côte d'Ivoire")).toBe('cote_d_ivoire')
  })
})
