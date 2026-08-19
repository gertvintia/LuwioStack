export enum LanguageCodeFormat {
  ALPHA2 = 'alpha2',
  ALPHA3 = 'alpha3',
}

export interface ILanguage {
  name: string
  /** Machine-readable identifier, stable across translations. */
  machine_name: string
  /** Primary code — ISO 639-1 alpha-2, e.g. `"nl"`. Alias of {@link ILanguage.alpha2}. */
  code: string
  /** ISO 639-1 code. */
  alpha2: string
  /** ISO 639-3 code (falls back to ISO 639-2). */
  alpha3: string
}

export interface ILanguages {
  readonly size: number
  add(language: ILanguage): ILanguages
  remove(language: ILanguage): ILanguages
  toArray(): ILanguage[]
}

/** A row in the bundled ISO 639 dataset. Internal shape — the public model is {@link ILanguage}. */
export interface ILanguageRow {
  name: string
  name_local: string
  iso_639_1: string
  iso_639_2: string
  iso_639_3: string
}
