import { describe, expect, it } from 'vitest'
import { Locale as LocaleClass } from './domain/locale'
import {
  Continent,
  Countries,
  Country,
  CountryCodeFormat,
  Language,
  Locale,
  matchLocalePattern,
  normalizeLocale,
  toMachineName,
} from './index'

describe('normalizeLocale', () => {
  it('normalizes casing and separators', () => {
    expect(normalizeLocale({ locale: 'EN_us' })).toBe('en-US')
    expect(normalizeLocale({ locale: ' fr-fr ' })).toBe('fr-FR')
  })

  it('throws on a missing country part', () => {
    expect(() => normalizeLocale({ locale: 'en' })).toThrow(/country/i)
  })
})

describe('toMachineName (re-exported from @luwio/country)', () => {
  it('slugifies and strips diacritics', () => {
    expect(toMachineName('North America')).toBe('north_america')
    expect(toMachineName('Côte d’Ivoire')).toBe('cote_d_ivoire')
  })
})

describe('matchLocalePattern', () => {
  it('matches wildcards and option lists', () => {
    expect(matchLocalePattern('en-*', 'en', 'US')).toBe(true)
    expect(matchLocalePattern('*-BE', 'nl', 'BE')).toBe(true)
    expect(matchLocalePattern('en-[BE,NL]', 'en', 'NL')).toBe(true)
    expect(matchLocalePattern('en-[BE,NL]', 'en', 'US')).toBe(false)
  })
})

describe('Locale', () => {
  it('creates a locale from a known combination', () => {
    const locale = Locale.new({ languageOrLocale: 'nl-BE' })
    expect(locale.locale).toBe('nl-BE')
    expect(locale.code).toBe('nl-BE')
    expect(locale.language_code).toBe('nl')
    expect(locale.country_code).toBe('BE')
    expect(locale.language().name).toBe('Dutch')
    expect(locale.country().name).toBe('Belgium')
    expect(locale.toIntlLocale()).toBeInstanceOf(Intl.Locale)
  })

  it('is valid whenever the language and country are each known — no combination check', () => {
    // 'en-BE' isn't a listed pairing, but 'en' and 'BE' each exist → accepted.
    expect(Locale.new({ languageOrLocale: 'en', country: 'BE' }).locale).toBe('en-BE')
  })

  it('throws when the language or country is unknown', () => {
    expect(() => Locale.new({ languageOrLocale: 'zz', country: 'BE' })).toThrow(/unknown/i)
    expect(() => Locale.new({ languageOrLocale: 'nl', country: 'ZZ' })).toThrow(/unknown/i)
  })

  it('resolves the continent of the locale', () => {
    expect(Locale.new({ languageOrLocale: 'nl-BE' }).continent().name).toBe('Europe')
  })
})

describe('Country (re-exported)', () => {
  it('resolves ISO codes and dialing prefix', () => {
    const be = Country.new({ code: 'BE' })
    expect(be.alpha3).toBe('BEL')
    expect(be.numeric).toHaveLength(3)
    expect(be.dialing_code).toBe('+32')
    expect(be.currency_code).toBe('EUR')
    expect(be.borders().toArray().length).toBeGreaterThan(0)
  })

  it('resolves its continent', () => {
    expect(Country.new({ code: 'BE' }).continent().name).toBe('Europe')
  })

  it('looks up by alpha-3 format', () => {
    expect(Country.from({ code: 'BEL', format: CountryCodeFormat.ALPHA3 }).alpha2).toBe('BE')
  })
})

describe('Language (re-exported)', () => {
  it('resolves by alpha-2 code', () => {
    expect(Language.new({ code: 'nl' }).name).toBe('Dutch')
  })
})

describe('Countries collection (re-exported)', () => {
  it('is immutable and de-duplicates', () => {
    const base = Countries.benelux()
    expect(base.size).toBe(3)
    const added = base.add(Country.new({ code: 'BE' }))
    expect(added.size).toBe(3) // BE already present
    const removed = base.removeBy(CountryCodeFormat.ALPHA2, 'LU')
    expect(
      removed
        .toArray()
        .map((c) => c.alpha2)
        .sort(),
    ).toEqual(['BE', 'NL'])
    expect(base.size).toBe(3) // original untouched
  })
})

describe('Continent (re-exported)', () => {
  it('lists European countries including Belgium', () => {
    const codes = Continent.europe()
      .countries()
      .toArray()
      .map((c) => c.alpha2)
    expect(codes).toContain('BE')
  })
})

describe('Locale.system', () => {
  it('exposes the detected runtime locale as a full Locale', () => {
    expect(typeof Locale.system.locale).toBe('string')
    expect(Locale.system.code).toBe(Locale.system.locale)
    expect(typeof Locale.system.country().name).toBe('string')
  })
})

describe('Locale.resolve', () => {
  it('falls back through the resolution chain to the catch-all', () => {
    const resolved = Locale.resolve({
      detected: LocaleClass.fromLocale({ locale: 'es-ES' }),
      supported: ['nl-BE', 'fr-FR'],
      overrides: { '*': 'nl-BE' },
    })
    expect(resolved.locale).toBe('nl-BE')
  })

  it('prefers a same-language supported locale', () => {
    const resolved = Locale.resolve({
      detected: LocaleClass.fromLocale({ locale: 'fr-BE' }),
      supported: ['fr-FR', 'nl-NL'],
      overrides: { '*': 'nl-NL' },
    })
    expect(resolved.locale).toBe('fr-FR')
  })
})

describe('Locale.resolve (no supported list — whole dataset)', () => {
  it('accepts any valid detected locale as-is', () => {
    // 'nl-DE' isn't a common pairing, but nl and DE are each known → valid → returned.
    expect(Locale.resolve({ detected: 'nl-DE', overrides: { '*': 'en-US' } }).locale).toBe('nl-DE')
    expect(Locale.resolve({ detected: 'fr-FR', overrides: { '*': 'en-US' } }).locale).toBe('fr-FR')
  })

  it('falls back to the catch-all for an invalid/unknown detected locale', () => {
    expect(Locale.resolve({ detected: 'zz-ZZ', overrides: { '*': 'nl-BE' } }).locale).toBe('nl-BE')
    expect(Locale.resolve({ detected: null, overrides: { '*': 'nl-BE' } }).locale).toBe('nl-BE')
  })

  it('still applies overrides before the catch-all', () => {
    // 'en-XX' is invalid (XX unknown), so it isn't accepted as-is; the 'en-*' pattern maps it.
    expect(
      Locale.resolve({ detected: 'en-XX', overrides: { 'en-*': 'en-US', '*': 'nl-BE' } }).locale,
    ).toBe('en-US')
  })
})

describe('Locale.resolve (string detected)', () => {
  it('resolves an unknown string via the * catch-all instead of throwing', () => {
    const r = Locale.resolve({
      detected: 'zz-ZZ',
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'en-US' },
    })
    expect(r.locale).toBe('en-US')
  })

  it('resolves null/undefined (no locale in the route) via the * catch-all', () => {
    const r = Locale.resolve({
      detected: null,
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'nl-BE' },
    })
    expect(r.locale).toBe('nl-BE')
  })

  it('returns a supported string as-is', () => {
    const r = Locale.resolve({
      detected: 'nl-BE',
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'en-US' },
    })
    expect(r.locale).toBe('nl-BE')
  })
})
