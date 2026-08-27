import { Country } from '@luwio/country'
import { describe, expect, it, vi } from 'vitest'
import { Eid } from './domain/eid'
import {
  type CardReader,
  type CardSession,
  NotImplementedError,
  UnsupportedCountryError,
} from './types'

const BE = Country.new({ code: 'BE' })
const DE = Country.new({ code: 'DE' })
const GB = Country.new({ code: 'GB' })

// A fake transport: it "presents" a card whose APDU exchange is never actually reached in the
// skeleton (country read() rejects first). `closes` counts how often the session was closed.
function fakeReader(): { reader: CardReader; closes: () => number } {
  let closes = 0
  const session: CardSession = {
    atr: new Uint8Array([0x3b]),
    transmit: () => Promise.resolve(new Uint8Array()),
    close: () => {
      closes++
      return Promise.resolve()
    },
  }
  const reader: CardReader = {
    listReaders: () => Promise.resolve(['Fake Reader 0']),
    waitForCard: () => Promise.resolve(session),
  }
  return { reader, closes: () => closes }
}

describe('Eid — registry & capability matrix', () => {
  it('lists the seeded countries', () => {
    expect(Eid.supportedCountries().sort()).toEqual([
      'BE',
      'DE',
      'EE',
      'ES',
      'FR',
      'IT',
      'NL',
      'PT',
    ])
  })

  it('reports access levels honestly', () => {
    expect(Eid.accessLevel(BE)).toEqual({ level: 'open' })
    expect(Eid.accessLevel(Country.new({ code: 'ES' }))).toEqual({
      level: 'secure-channel',
      via: 'can',
    })
    expect(Eid.accessLevel(Country.new({ code: 'PT' }))).toEqual({
      level: 'secure-channel',
      via: 'pin',
    })
    expect(Eid.accessLevel(DE)).toEqual({ level: 'authorization-required' })
    expect(Eid.accessLevel(Country.new({ code: 'NL' }))).toEqual({
      level: 'secure-channel',
      via: 'mrz',
    })
  })

  it('treats a country with no eID card as unsupported (GB)', () => {
    expect(Eid.isSupported(GB)).toBe(false)
    expect(() => Eid.accessLevel(GB)).toThrow(UnsupportedCountryError)
  })
})

describe('Eid.read', () => {
  it('throws UnsupportedCountryError for a country without a profile', async () => {
    const { reader } = fakeReader()
    await expect(Eid.read(reader, GB)).rejects.toBeInstanceOf(UnsupportedCountryError)
  })

  it('waits for a card then rejects NotImplementedError for an unimplemented country (DE), closing the session', async () => {
    const { reader, closes } = fakeReader()
    const waitSpy = vi.spyOn(reader, 'waitForCard')
    await expect(Eid.read(reader, DE)).rejects.toBeInstanceOf(NotImplementedError)
    expect(waitSpy).toHaveBeenCalledOnce()
    expect(closes()).toBe(1) // session released even though reading failed
  })

  it('calls onCardPresent once a card is available, before reading', async () => {
    const { reader } = fakeReader()
    const onCardPresent = vi.fn()
    await expect(Eid.read(reader, DE, { onCardPresent })).rejects.toBeInstanceOf(
      NotImplementedError,
    )
    expect(onCardPresent).toHaveBeenCalledOnce()
  })
})
