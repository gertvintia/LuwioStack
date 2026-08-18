import type { DataSource, IDatasetEntry } from '../types'
import { builtinEntries } from './builtin'
import { getDataset, resetActiveDataset, setActiveDataset } from './registry'

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
 * Set the active dataset from one or more sources, merged left → right — later sources override
 * earlier ones per `locale`. Include {@link builtinDataSource} to **extend** the built-in data;
 * omit it to **replace** it entirely.
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
  const byLocale = new Map<string, IDatasetEntry>()
  for (const source of sources) {
    for (const entry of source.entries) byLocale.set(entry.locale, entry)
  }
  setActiveDataset([...byLocale.values()])
}

/** Restore the built-in dataset, discarding anything set via {@link configureDataset}. */
export function resetDataset(): void {
  resetActiveDataset()
}

/** Read the currently-active dataset entries. */
export { getDataset }
