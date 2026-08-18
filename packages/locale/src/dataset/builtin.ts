import dataset from '../data/dataset.json'
import type { IDatasetEntry } from '../types'

/** The library's built-in ISO 639 / ISO 3166 dataset (377 locale entries). */
export const builtinEntries = dataset as IDatasetEntry[]
