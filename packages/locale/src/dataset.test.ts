import { afterEach, describe, expect, it } from 'vitest'
import {
  builtinDataSource,
  Country,
  configureDataset,
  defineDataSource,
  getDataset,
  type IDatasetEntry,
  Locale,
  resetDataset,
} from './index'

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

  it('getDataset reflects the active entries', () => {
    configureDataset(defineDataSource([CUSTOM]))
    expect(getDataset()).toHaveLength(1)
    expect(getDataset()[0]?.locale).toBe('xx-QQ')
  })
})
