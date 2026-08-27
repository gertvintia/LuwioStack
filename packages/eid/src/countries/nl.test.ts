import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { Eid } from '../domain/eid'
import { dg1FromMrz, dutchIdMrz, emrtdSession } from '../test-support'
import { CardAccessError } from '../types'
import { nl } from './nl'

describe('Netherlands read (ICAO eMRTD)', () => {
  const secrets = { mrz: dutchIdMrz() }

  it('reads DG1 and parses the MRZ into a normalized document', async () => {
    const card = await nl.read(emrtdSession(dg1FromMrz(dutchIdMrz())), secrets)

    expect(card.countryCode).toBe('NL')
    expect(card.documentType).toBe('id-card') // MRZ document code "I"
    expect(card.surname).toBe('SPECIMEN')
    expect(card.givenNames).toBe('JAN PIETER')
    expect(card.sex).toBe('male')
    expect(card.birthDate?.toISOString().slice(0, 10)).toBe('1990-01-01')
    expect(card.expiresAt?.toISOString().slice(0, 10)).toBe('2030-01-01')
    expect(card.documentNumber).toBe('SPECI2020')
    expect(card.nationality).toBe('NL') // NLD → NL
    expect(card.nationalNumber).toBeNull() // MRZ carries no BSN
    expect(card.country().name).toBe('Netherlands')
  })

  it('parses a TD3 passport MRZ (2×44) too', async () => {
    // "P" document code → passport.
    const l1 = `P<NLDSPECIMEN<<JAN<PIETER${'<'.repeat(19)}` // 44 chars
    const l2 = `SPECI20209NLD9001011M3001012${'<'.repeat(15)}0` // 44 chars
    const card = await nl.read(emrtdSession(dg1FromMrz(l1 + l2)), secrets)
    expect(card.documentType).toBe('passport')
    expect(card.surname).toBe('SPECIMEN')
    expect(card.givenNames).toBe('JAN PIETER')
    expect(card.sex).toBe('male')
  })

  it('requires the MRZ or CAN to open a secure channel', async () => {
    await expect(nl.read(emrtdSession(dg1FromMrz(dutchIdMrz())))).rejects.toBeInstanceOf(
      CardAccessError,
    )
  })

  it('is registered as secure-channel via MRZ, and works through Eid.read', async () => {
    expect(Eid.accessLevel(Country.new({ code: 'NL' }))).toEqual({
      level: 'secure-channel',
      via: 'mrz',
    })
    const reader = {
      listReaders: () => Promise.resolve(['Mock eMRTD Reader']),
      waitForCard: () => Promise.resolve(emrtdSession(dg1FromMrz(dutchIdMrz()))),
    }
    const card = await Eid.read(reader, Country.new({ code: 'NL' }), { secrets })
    expect(card.surname).toBe('SPECIMEN')
  })
})
