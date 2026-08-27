import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { Eid } from '../domain/eid'
import { estEidSession, standardEstEidRecords } from '../test-support'
import type { CardReader } from '../types'
import { ee } from './ee'

describe('EstEID read (record-based scheme)', () => {
  it('reads the personal-data records into a normalized document', async () => {
    const card = await ee.read(estEidSession(standardEstEidRecords()))

    expect(card.countryCode).toBe('EE')
    expect(card.surname).toBe('TAMM')
    expect(card.givenNames).toBe('MARI LIIS') // record 2 + record 3 joined
    expect(card.sex).toBe('female') // "N" (naine)
    expect(card.birthDate?.toISOString().slice(0, 10)).toBe('1990-01-01')
    expect(card.nationalNumber).toBe('49001010000')
    expect(card.documentNumber).toBe('AA0000000')
    expect(card.expiresAt?.toISOString().slice(0, 10)).toBe('2030-01-01')
    expect(card.birthPlace).toBe('TALLINN')
    expect(card.nationality).toBe('EE') // EST → EE
    expect(card.address).toBeNull() // not carried on the EstEID personal-data file
    expect(card.country().name).toBe('Estonia')
  })

  it('works end-to-end through Eid.read, and is a registered open-read country', async () => {
    expect(Eid.supportedCountries()).toContain('EE')
    expect(Eid.accessLevel(Country.new({ code: 'EE' }))).toEqual({ level: 'open' })

    const reader: CardReader = {
      listReaders: () => Promise.resolve(['Mock EstEID Reader']),
      waitForCard: () => Promise.resolve(estEidSession(standardEstEidRecords())),
    }
    const card = await Eid.read(reader, Country.new({ code: 'EE' }))
    expect(card.surname).toBe('TAMM')
    // @luwio/national-id doesn't cover EE yet, so the validated id is null (honest, not a crash).
    expect(card.nationalId()).toBeNull()
  })
})
