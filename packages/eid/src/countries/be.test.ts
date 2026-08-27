import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { Eid } from '../domain/eid'
import { belpicSession, standardBelpicFiles, tlv } from '../test-support'
import type { CardReader } from '../types'
import { be } from './be'

describe('BELPIC read', () => {
  it('parses the identity, address and photo from a card', async () => {
    const card = await be.read(belpicSession(standardBelpicFiles()))

    expect(card.documentType).toBe('id-card')
    expect(card.countryCode).toBe('BE')
    expect(card.surname).toBe('Specimen')
    expect(card.givenNames).toBe('Jan Baptist') // tag 8 + tag 9 joined
    expect(card.nationalNumber).toBe('85073003328')
    expect(card.documentNumber).toBe('592194100154')
    expect(card.birthPlace).toBe('Bruxelles')
    // Birth date & sex come from the RRN (language-independent, unambiguous century).
    expect(card.sex).toBe('male')
    expect(card.birthDate?.toISOString().slice(0, 10)).toBe('1985-07-30')
    expect(card.issuedAt?.toISOString().slice(0, 10)).toBe('2020-09-01')
    expect(card.expiresAt?.toISOString().slice(0, 10)).toBe('2030-09-01')
    expect(card.address).toEqual({
      street: 'Rue de la Loi 16',
      zip: '1000',
      municipality: 'Bruxelles',
      countryCode: 'BE',
    })
    expect(card.photo?.length).toBe(300) // multi-chunk read reassembled correctly
  })

  it('cross-validates via @luwio/national-id and @luwio/country', async () => {
    const card = await be.read(belpicSession(standardBelpicFiles()))
    expect(card.country().name).toBe('Belgium')
    expect(card.nationalId()?.value).toBe('85073003328')
    expect(card.isExpired(new Date('2025-01-01T00:00:00Z'))).toBe(false)
    expect(card.isExpired(new Date('2031-01-01T00:00:00Z'))).toBe(true)
  })

  it('falls back to the card fields when the RRN is unusable', async () => {
    const identity = tlv([
      [6, '00000000000'], // invalid RRN
      [7, 'Doe'],
      [8, 'Jane'],
      [12, '15.03.1990'], // card birth date
      [13, 'F'], // card sex
    ])
    const files = new Map([
      ['4031', identity],
      ['4033', new Uint8Array()],
      ['4035', new Uint8Array()],
    ])
    const card = await be.read(belpicSession(files))
    expect(card.birthDate?.toISOString().slice(0, 10)).toBe('1990-03-15')
    expect(card.sex).toBe('female')
    expect(card.nationalId()).toBeNull() // invalid RRN → no validated national id
    expect(card.address).toBeNull()
    expect(card.photo).toBeNull()
  })

  it('works end-to-end through Eid.read with a reader', async () => {
    const reader: CardReader = {
      listReaders: () => Promise.resolve(['Mock Reader']),
      waitForCard: () => Promise.resolve(belpicSession(standardBelpicFiles())),
    }
    const card = await Eid.read(reader, Country.new({ code: 'BE' }))
    expect(card.surname).toBe('Specimen')
    expect(card.nationalId()?.country().name).toBe('Belgium')
  })
})
