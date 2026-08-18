import type { IDatasetEntry } from '../types'
import { builtinEntries } from './builtin'

// A module-level store for the active dataset. The domain layer (Country, Language, Continent,
// Locale) reads from getDataset() on every lookup — never captures it at import time — so
// configureDataset() takes effect for all subsequent lookups.
let active: IDatasetEntry[] = builtinEntries

/** The dataset the domain layer currently reads from. */
export function getDataset(): IDatasetEntry[] {
  return active
}

/** Replace the active dataset. Internal — public callers use `configureDataset`. */
export function setActiveDataset(entries: IDatasetEntry[]): void {
  active = entries
}

/** Restore the built-in dataset. */
export function resetActiveDataset(): void {
  active = builtinEntries
}
