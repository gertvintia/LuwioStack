import { afterEach, describe, expect, it } from 'vitest'
import {
  builtinDataSource,
  configureDataset,
  defineDataSource,
  getDataset,
  resetDataset,
} from './dataset'
import { Locale } from './domain/locale'
import { Country, type IDatasetEntry } from './index'

const CUSTOM: IDatasetEntry = {
  locale: 'xx-QQ',
  language: {
    name: 'Examplish',
    name_local: 'Examplish',
    iso_639_1: 'xx',
    iso_639_2: 'xxx',
    iso_639_3: 'xxx',
  },
  country: {
    name: 'Qaardia',
    name_local: 'Qaardia',
    iso_3166_1_alpha2: 'QQ',
    iso_3166_1_alpha3: 'QQQ',
    iso_3166_1_numeric: 999,
    continent: 'Europe',
    region: 'Test',
    capital: 'Q-City',
    direct_dialing_code: '+999',
    currency_code: 'QQD',
    currency_symbol: 'Q',
    flag: '🏳️',
    timezones: ['UTC'],
    borders: [],
    languages: [
      {
        name: 'Examplish',
        name_local: 'Examplish',
        iso_639_1: 'xx',
        iso_639_2: 'xxx',
        iso_639_3: 'xxx',
      },
    ],
  },
}

afterEach(() => resetDataset())

describe('@luwio/locale data sources', () => {
  it('replaces the dataset entirely', () => {
    configureDataset(defineDataSource([CUSTOM]))
    expect(Country.new({ code: 'QQ' }).name).toBe('Qaardia')
    expect(() => Country.new({ code: 'BE' })).toThrow() // built-in no longer present
  })

  it('extends the built-in dataset', () => {
    configureDataset(builtinDataSource, defineDataSource([CUSTOM]))
    expect(Country.new({ code: 'QQ' }).alpha3).toBe('QQQ')
    expect(Country.new({ code: 'BE' }).alpha3).toBe('BEL') // built-in kept
  })

  it('maps custom rows via defineDataSource(rows, map)', () => {
    const rows = [{ tag: 'xx-QQ' }]
    configureDataset(defineDataSource(rows, () => CUSTOM))
    expect(Locale.fromLocale({ locale: 'xx-QQ' }).locale).toBe('xx-QQ')
  })

  it('resetDataset restores the built-in data', () => {
    configureDataset(defineDataSource([CUSTOM]))
    resetDataset()
    expect(Country.new({ code: 'BE' }).alpha3).toBe('BEL')
    expect(() => Country.new({ code: 'QQ' })).toThrow()
  })

  it('overrides a country across every locale that references it (granularity)', () => {
    // The built-in data has several be-* locales (nl-BE, fr-BE, …) all sharing country BE.
    // Overriding BE from a *single* entry must apply to all of them.
    const be = Country.new({ code: 'BE' })
    const nl = {
      name: 'Dutch',
      name_local: 'Nederlands',
      iso_639_1: 'nl',
      iso_639_2: 'nld',
      iso_639_3: 'nld',
    }
    const overriddenBE = {
      name: be.name,
      name_local: be.name,
      iso_3166_1_alpha2: 'BE',
      iso_3166_1_alpha3: 'BEL',
      iso_3166_1_numeric: 56,
      continent: 'Europe',
      region: 'Western Europe',
      capital: 'Brussels',
      direct_dialing_code: '+000', // ← the change
      currency_code: 'EUR',
      currency_symbol: '€',
      flag: '🇧🇪',
      timezones: ['UTC+01:00'],
      borders: ['FR', 'DE', 'LU', 'NL'],
      languages: [nl],
    }
    configureDataset(
      builtinDataSource,
      defineDataSource([{ locale: 'nl-BE', language: nl, country: overriddenBE }]),
    )
    // A different be-locale still sees the override — proof it merged at country granularity,
    // not per whole locale entry.
    expect(Country.new({ code: 'BE' }).direct_dialing_code).toBe('+000')
    expect(Locale.fromLocale({ locale: 'fr-BE' }).country().direct_dialing_code).toBe('+000')
  })

  it('getDataset reflects the active entries', () => {
    configureDataset(defineDataSource([CUSTOM]))
    expect(getDataset()).toHaveLength(1)
    expect(getDataset()[0]?.locale).toBe('xx-QQ')
  })
})
