import dataset from '../data/dataset.json'
import { type IDatasetEntry, type ILanguage, type ILocale, LanguageCodeFormat } from '../types'
import { toMachineName } from '../utils/to-machine-name'
import { Locale } from './locale'

const entries = dataset as IDatasetEntry[]

export class Language implements ILanguage {
  public readonly name: string
  public readonly machine_name: string
  public readonly alpha2: string
  public readonly alpha3: string

  private constructor(value: string, format: LanguageCodeFormat) {
    let entry: IDatasetEntry | undefined

    if (format === LanguageCodeFormat.ALPHA2) {
      entry = entries.find((d) => d.language.iso_639_1.toLowerCase() === value.toLowerCase())
    } else {
      // alpha3: prefer iso_639_3, fall back to iso_639_2
      entry =
        entries.find(
          (d) =>
            d.language.iso_639_3 !== '' &&
            d.language.iso_639_3.toLowerCase() === value.toLowerCase(),
        ) ?? entries.find((d) => d.language.iso_639_2.toLowerCase() === value.toLowerCase())
    }

    if (!entry) {
      throw new Error(`Unknown language: ${value}`)
    }

    this.alpha2 = entry.language.iso_639_1
    this.alpha3 =
      entry.language.iso_639_3 !== '' ? entry.language.iso_639_3 : entry.language.iso_639_2
    this.name = entry.language.name
    this.machine_name = toMachineName(entry.language.name)
  }

  /** Look up by ISO 639-1 (alpha-2) code. */
  public static new(value: { code: string }): Language {
    return new Language(value.code, LanguageCodeFormat.ALPHA2)
  }

  /** Look up by code in an explicit format (defaults to alpha-2). */
  public static from(value: { code: string; format?: LanguageCodeFormat }): Language {
    return new Language(value.code, value.format ?? LanguageCodeFormat.ALPHA2)
  }

  public toLocale(value: { country: string }): ILocale {
    return Locale.new({ language: this.alpha2, country: value.country })
  }
}
