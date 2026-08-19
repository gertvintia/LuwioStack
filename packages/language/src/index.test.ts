import { describe, expect, it } from 'vitest'
import { Language, LanguageCodeFormat, Languages, toMachineName } from './index'

describe('Language', () => {
  it('looks up by ISO 639-1 code', () => {
    const nl = Language.new({ code: 'nl' })
    expect(nl.name).toBe('Dutch')
    expect(nl.code).toBe('nl')
    expect(nl.alpha2).toBe('nl')
    expect(nl.alpha3).toBe('nld')
    expect(nl.machine_name).toBe('dutch')
  })

  it('is case-insensitive', () => {
    expect(Language.new({ code: 'NL' }).code).toBe('nl')
  })

  it('looks up by alpha-3 code', () => {
    expect(Language.from({ code: 'nld', format: LanguageCodeFormat.ALPHA3 }).code).toBe('nl')
  })

  it('throws on an unknown language', () => {
    expect(() => Language.new({ code: 'zz' })).toThrow(/unknown language/i)
  })
})

describe('Languages', () => {
  it('de-duplicates by alpha-2 code', () => {
    const langs = Languages.empty()
      .add(Language.new({ code: 'nl' }))
      .add(Language.new({ code: 'fr' }))
      .add(Language.new({ code: 'nl' }))
    expect(langs.size).toBe(2)
    expect(langs.toArray().map((l) => l.code)).toEqual(['nl', 'fr'])
  })

  it('removes by identity', () => {
    const langs = Languages.empty().add(Language.new({ code: 'nl' }))
    expect(langs.remove(Language.new({ code: 'nl' })).size).toBe(0)
  })
})

describe('toMachineName', () => {
  it('slugifies and strips diacritics', () => {
    expect(toMachineName('Norwegian Bokmål')).toBe('norwegian_bokmal')
  })
})
