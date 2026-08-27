import { languageRows } from '../data'
import type { ILanguage, ILanguages } from '../types'
import { Language } from './language'

/** An immutable collection of {@link ILanguage}, de-duplicated by alpha-2 code. */
export class Languages implements ILanguages {
  private readonly values: ILanguage[]

  private constructor(values: ILanguage[]) {
    this.values = values
  }

  static empty(): ILanguages {
    return new Languages([])
  }

  /** Every language in the bundled ISO 639 dataset, in source order. */
  static all(): ILanguages {
    return new Languages(languageRows.map((row) => Language.from({ code: row.iso_639_1 })))
  }

  add(language: ILanguage): ILanguages {
    const exists = this.values.some(
      (item) => item.alpha2.toLowerCase() === language.alpha2.toLowerCase(),
    )
    if (exists) return this
    return new Languages([...this.values, language])
  }

  remove(language: ILanguage): ILanguages {
    return new Languages(
      this.values.filter((item) => item.alpha2.toLowerCase() !== language.alpha2.toLowerCase()),
    )
  }

  toArray(): ILanguage[] {
    return this.values
  }

  get size(): number {
    return this.values.length
  }
}
