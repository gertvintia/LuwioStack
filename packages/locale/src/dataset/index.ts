import type { IDatasetCountry, IDatasetEntry, IDatasetLanguage } from '../types'
import { builtinEntries } from './builtin'
import { getDataset, resetActiveDataset, setActiveDataset } from './registry'

// Internal dataset composition. The module reads its data through the registry (getDataset) and
// composes it here: the built-in dataset is the default, and combineDataset() merges additional
// sources at country / language / locale granularity so the module can layer in extra data.
// Not part of the public API — @luwio/locale ships its built-in dataset and consumers use it.

/** A source of dataset entries in the interface format. */
interface DataSource {
  readonly entries: readonly IDatasetEntry[]
}

/** The library's built-in dataset, as a composable {@link DataSource}. */
export const builtinDataSource: DataSource = { entries: builtinEntries }

/**
 * Build a {@link DataSource} — either from entries already in the interface format, or from your
 * own rows plus a `map` that projects each row to an {@link IDatasetEntry}.
 *
 * @example
 * // already in the interface format
 * defineDataSource(myEntries)
 *
 * @example
 * // your own shape + a mapper
 * defineDataSource(rows, (row) => ({ locale: row.tag, language: {…}, country: {…} }))
 */
export function defineDataSource(entries: readonly IDatasetEntry[]): DataSource
export function defineDataSource<T>(rows: readonly T[], map: (row: T) => IDatasetEntry): DataSource
export function defineDataSource<T>(
  rowsOrEntries: readonly T[] | readonly IDatasetEntry[],
  map?: (row: T) => IDatasetEntry,
): DataSource {
  const entries = map
    ? (rowsOrEntries as readonly T[]).map(map)
    : (rowsOrEntries as readonly IDatasetEntry[])
  return { entries }
}

/**
 * Set the active dataset from one or more sources, merged left → right. Later sources override
 * earlier ones at three granularities: a single country (by alpha-2) or language (by ISO 639-1)
 * replaces that unit across *every* locale that references it, and `locale` decides which entries
 * exist. Include {@link builtinDataSource} to **extend** the built-in data; omit it to **replace**.
 *
 * @example
 * // extend the built-in dataset
 * configureDataset(builtinDataSource, defineDataSource(rows, toEntry))
 *
 * @example
 * // replace it entirely
 * configureDataset(defineDataSource(myEntries))
 */
export function configureDataset(...sources: DataSource[]): void {
  // Merge at three granularities so an override lands where you'd expect: `locale` decides which
  // entries exist, while a single country (by alpha-2) or language (by ISO 639-1) overrides that
  // unit across *every* locale that references it — no need to re-supply every `xx-BE` entry to
  // change Belgium. Last source wins at each granularity.
  const entryByLocale = new Map<string, IDatasetEntry>()
  const countryByAlpha2 = new Map<string, IDatasetCountry>()
  const languageByIso = new Map<string, IDatasetLanguage>()

  for (const source of sources) {
    for (const entry of source.entries) {
      entryByLocale.set(entry.locale, entry)
      countryByAlpha2.set(entry.country.iso_3166_1_alpha2, entry.country)
      if (entry.language.iso_639_1 !== '')
        languageByIso.set(entry.language.iso_639_1, entry.language)
    }
  }

  const merged: IDatasetEntry[] = []
  for (const entry of entryByLocale.values()) {
    merged.push({
      locale: entry.locale,
      language: languageByIso.get(entry.language.iso_639_1) ?? entry.language,
      country: countryByAlpha2.get(entry.country.iso_3166_1_alpha2) ?? entry.country,
    })
  }
  setActiveDataset(merged)
}

/** Restore the built-in dataset, discarding anything set via {@link configureDataset}. */
export function resetDataset(): void {
  resetActiveDataset()
}

/** Read the currently-active dataset entries. */
export { getDataset }
