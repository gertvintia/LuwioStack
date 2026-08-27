import { Language } from '@luwio/language'
import { describe, expect, it, vi } from 'vitest'
import { createTranslations, toMessages } from './translations'

const en = Language.new({ code: 'en' })
const nl = Language.new({ code: 'nl' })
const fr = Language.new({ code: 'fr' })

describe('createTranslations', () => {
  it('loads flat message catalogs (the API shape) from any source, activates, and translates', async () => {
    const tr = createTranslations()

    await tr.add(en, { greeting: 'Hello' }) // flat messages directly
    tr.activate(en)
    expect(tr.t('greeting')).toBe('Hello')

    await tr.add(nl, () => Promise.resolve({ greeting: 'Hallo' })) // loader fn
    tr.activate(nl)
    expect(tr.t('greeting')).toBe('Hallo')

    await tr.add(fr, Promise.resolve({ greeting: 'Bonjour' })) // a promise
    tr.activate(fr)
    expect(tr.t('greeting')).toBe('Bonjour')
  })

  it('also accepts a tokens map, transforming it to messages', async () => {
    const tr = createTranslations()
    const tokens = {
      help: { key: 'help', defaultValue: 'Help' },
      home: { key: 'home', defaultValue: 'Home' },
    }
    await tr.add(en, tokens)
    tr.activate(en)

    // Reference the id via the token: t(tokens.help.key).
    expect(tr.t(tokens.help.key)).toBe('Help')
    expect(tr.t(tokens.home)).toBe('Home') // whole token works too
  })

  it('adds languages ad-hoc — no upfront config', async () => {
    const tr = createTranslations()
    expect(tr.languages).toEqual([])

    await tr.add(en, { greeting: 'Hello' })
    tr.activate(nl)

    expect(tr.languages.map((l) => l.code).sort()).toEqual(['en', 'nl'])
    expect(tr.isLoaded(en)).toBe(true)
    expect(tr.isLoaded(fr)).toBe(false)
  })

  it('t(token) falls back to defaultValue when the key is not in the catalog', async () => {
    const tr = createTranslations()
    await tr.add(en, { greeting: 'Hello' }) // no `missing` key loaded
    tr.activate(en)

    // Plain id → returns the id itself; token → returns its defaultValue.
    expect(tr.t('missing')).toBe('missing')
    expect(tr.t({ key: 'missing', defaultValue: 'Fallback' })).toBe('Fallback')
  })

  it('toMessages normalizes a flat map (passthrough) and a tokens map', () => {
    expect(toMessages({ help: 'Help' })).toEqual({ help: 'Help' })
    expect(toMessages({ home: { key: 'home', defaultValue: 'Home' } })).toEqual({ home: 'Home' })
  })

  it('rejects a bogus language asserted as ILanguage', async () => {
    const tr = createTranslations()
    const bogus = { code: 'zz' } as unknown as typeof en
    await expect(tr.add(bogus, {})).rejects.toThrow()
    expect(() => tr.activate(bogus)).toThrow()
  })

  it('never re-loads an already-loaded catalog', async () => {
    const source = vi.fn(() => ({ greeting: 'Hello' }))
    const tr = createTranslations()

    await tr.add(en, source)
    await tr.add(en, source) // repeat — no reload
    tr.activate(en)

    expect(source).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent loads of the same language', async () => {
    const source = vi.fn(async () => ({ greeting: 'Hello' }))
    const tr = createTranslations()

    await Promise.all([tr.add(en, source), tr.add(en, source), tr.add(en, source)])

    expect(source).toHaveBeenCalledTimes(1)
  })
})
