import { describe, expect, it } from 'vitest'
import { Locale as LocaleClass } from './domain/locale'
import {
  Continent,
  Countries,
  Country,
  CountryCodeFormat,
  Language,
  Locale,
  MatchingPolicy,
  matchLocalePattern,
  normalizeLocale,
  resolveLocale,
  resolvePolicy,
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

describe('toMachineName', () => {
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

describe('resolvePolicy', () => {
  it('returns a uniform policy as-is', () => {
    expect(resolvePolicy(MatchingPolicy.LOOSE, 'en', 'US')).toBe(MatchingPolicy.LOOSE)
  })

  it('picks the most specific matching rule', () => {
    const policy = {
      default: MatchingPolicy.STRICT,
      locales: { 'en-*': MatchingPolicy.LOOSE },
    }
    expect(resolvePolicy(policy, 'en', 'ZZ')).toBe(MatchingPolicy.LOOSE)
    expect(resolvePolicy(policy, 'nl', 'BE')).toBe(MatchingPolicy.STRICT)
  })
})

describe('Locale', () => {
  it('creates a strict locale from a known combination', () => {
    const locale = Locale.new({ languageOrLocale: 'nl-BE' })
    expect(locale.locale).toBe('nl-BE')
    expect(locale.language_code).toBe('nl')
    expect(locale.country_code).toBe('BE')
    expect(locale.language().name).toBe('Dutch')
    expect(locale.country().name).toBe('Belgium')
    expect(locale.toIntlLocale()).toBeInstanceOf(Intl.Locale)
  })

  it('throws when the language or country is unknown', () => {
    expect(() => Locale.new({ languageOrLocale: 'zz', country: 'BE' })).toThrow(/unknown/i)
  })

  it('resolves the continent of the locale', () => {
    expect(Locale.new({ languageOrLocale: 'nl-BE' }).continent().name).toBe('Europe')
  })

  it('defaults to LOOSE — a valid language + country pair is accepted without a policy', () => {
    // 'en-BE' isn't a dataset combination, but 'en' and 'BE' each exist.
    expect(Locale.new({ languageOrLocale: 'en', country: 'BE' }).locale).toBe('en-BE')
  })

  it('accepts a loose combination when parts exist separately', () => {
    const locale = Locale.new({
      languageOrLocale: 'en',
      country: 'BE',
      policy: MatchingPolicy.LOOSE,
    })
    expect(locale.locale).toBe('en-BE')
  })
})

describe('Country', () => {
  it('resolves ISO codes and dialing prefix', () => {
    const be = Country.new({ code: 'BE' })
    expect(be.alpha3).toBe('BEL')
    expect(be.numeric).toHaveLength(3)
    expect(be.direct_dialing_code).toBe('+32')
    expect(be.borders().toArray().length).toBeGreaterThan(0)
  })

  it('looks up by alpha-3 format', () => {
    expect(Country.from({ code: 'BEL', format: CountryCodeFormat.ALPHA3 }).alpha2).toBe('BE')
  })
})

describe('Language', () => {
  it('resolves by alpha-2 code', () => {
    expect(Language.new({ code: 'nl' }).name).toBe('Dutch')
  })
})

describe('Countries collection', () => {
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

describe('Continent', () => {
  it('lists European countries including Belgium', () => {
    const codes = Continent.europe()
      .countries()
      .toArray()
      .map((c) => c.alpha2)
    expect(codes).toContain('BE')
  })
})

describe('resolveLocale', () => {
  it('falls back through the resolution chain to the catch-all', () => {
    const resolved = resolveLocale({
      detected: LocaleClass.fromLocale({ locale: 'es-ES' }),
      supported: ['nl-BE', 'fr-FR'],
      overrides: { '*': 'nl-BE' },
    })
    expect(resolved.locale).toBe('nl-BE')
  })

  it('prefers a same-language supported locale', () => {
    const resolved = resolveLocale({
      detected: LocaleClass.fromLocale({ locale: 'fr-BE', policy: MatchingPolicy.LOOSE }),
      supported: ['fr-FR', 'nl-NL'],
      overrides: { '*': 'nl-NL' },
    })
    expect(resolved.locale).toBe('fr-FR')
  })
})

describe('resolveLocale (string detected)', () => {
  it('resolves an unknown string via the * catch-all instead of throwing', () => {
    const r = resolveLocale({
      detected: 'zz-ZZ',
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'en-US' },
    })
    expect(r.locale).toBe('en-US')
  })

  it('resolves null/undefined (no locale in the route) via the * catch-all', () => {
    const r = resolveLocale({
      detected: null,
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'nl-BE' },
    })
    expect(r.locale).toBe('nl-BE')
  })

  it('returns a supported string as-is', () => {
    const r = resolveLocale({
      detected: 'nl-BE',
      supported: ['en-US', 'nl-BE'],
      overrides: { '*': 'en-US' },
    })
    expect(r.locale).toBe('nl-BE')
  })
})
