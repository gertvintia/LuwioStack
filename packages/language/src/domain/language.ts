import { languageRows } from '../data'
import { type ILanguage, type ILanguageRow, LanguageCodeFormat } from '../types'
import { toMachineName } from '../utils/to-machine-name'

export class Language implements ILanguage {
  public readonly name: string
  public readonly machine_name: string
  public readonly code: string
  public readonly alpha2: string
  public readonly alpha3: string

  private constructor(value: string, format: LanguageCodeFormat) {
    let row: ILanguageRow | undefined

    if (format === LanguageCodeFormat.ALPHA2) {
      row = languageRows.find((r) => r.iso_639_1.toLowerCase() === value.toLowerCase())
    } else {
      // alpha3: prefer ISO 639-3, fall back to ISO 639-2
      row =
        languageRows.find(
          (r) => r.iso_639_3 !== '' && r.iso_639_3.toLowerCase() === value.toLowerCase(),
        ) ?? languageRows.find((r) => r.iso_639_2.toLowerCase() === value.toLowerCase())
    }

    if (!row) {
      throw new Error(`Unknown language: ${value}`)
    }

    this.alpha2 = row.iso_639_1
    this.code = row.iso_639_1
    this.alpha3 = row.iso_639_3 !== '' ? row.iso_639_3 : row.iso_639_2
    this.name = row.name
    this.machine_name = toMachineName(row.name)
  }

  /** Look up by ISO 639-1 (alpha-2) code, e.g. `Language.new({ code: 'nl' })`. */
  public static new(value: { code: string }): Language {
    return new Language(value.code, LanguageCodeFormat.ALPHA2)
  }

  /** Look up by code in an explicit format (defaults to alpha-2). */
  public static from(value: { code: string; format?: LanguageCodeFormat }): Language {
    return new Language(value.code, value.format ?? LanguageCodeFormat.ALPHA2)
  }
}
