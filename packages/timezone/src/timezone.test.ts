import { describe, expect, it } from 'vitest'
import { Timezone, Timezones, toMachineName } from './index'

const winter = new Date('2024-01-15T12:00:00Z')
const summer = new Date('2024-07-15T12:00:00Z')

describe('Timezone', () => {
  it('looks up by IANA name and exposes the core fields', () => {
    const tz = Timezone.new({ name: 'Europe/Brussels' })
    expect(tz.name).toBe('Europe/Brussels')
    expect(tz.machine_name).toBe('europe_brussels')
  })

  it('computes DST-aware offsets (minutes east of UTC)', () => {
    const brussels = Timezone.new({ name: 'Europe/Brussels' })
    expect(brussels.offset(winter)).toBe(60) // CET
    expect(brussels.offset(summer)).toBe(120) // CEST

    const ny = Timezone.new({ name: 'America/New_York' })
    expect(ny.offset(winter)).toBe(-300) // EST
    expect(ny.offset(summer)).toBe(-240) // EDT

    expect(Timezone.new({ name: 'Asia/Tokyo' }).offset(winter)).toBe(540) // no DST
    expect(Timezone.new({ name: 'UTC' }).offset(winter)).toBe(0)
  })

  it('reports the short abbreviation', () => {
    const ny = Timezone.new({ name: 'America/New_York' })
    expect(ny.abbreviation(winter)).toBe('EST')
    expect(ny.abbreviation(summer)).toBe('EDT')
  })

  it('exposes the runtime timezone via Timezone.system', () => {
    expect(typeof Timezone.system.name).toBe('string')
    expect(Timezone.system.name.length).toBeGreaterThan(0)
  })

  it('throws on an unknown timezone', () => {
    expect(() => Timezone.new({ name: 'Mars/Olympus_Mons' })).toThrow(/Unknown timezone/)
  })
})

describe('Timezones', () => {
  it('enumerates the whole dataset with all()', () => {
    const all = Timezones.all().toArray()
    expect(all.length).toBeGreaterThan(300)
    expect(all.some((t) => t.name === 'Europe/Brussels')).toBe(true)
  })

  it('de-duplicates by name', () => {
    const set = Timezones.empty()
      .add(Timezone.new({ name: 'UTC' }))
      .add(Timezone.new({ name: 'UTC' }))
    expect(set.size).toBe(1)
  })
})

describe('toMachineName', () => {
  it('slugifies an IANA name', () => {
    expect(toMachineName('America/Argentina/Buenos_Aires')).toBe('america_argentina_buenos_aires')
  })
})
