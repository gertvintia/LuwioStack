import rows from './data/currencies.json'
import type { ICurrencyRow } from './types'

// The built-in ISO 4217 dataset, bundled into this package at build time. Generated from
// @luwio/iso-data — do not edit by hand; run `pnpm gen:data` from the repo root.
export const currencyRows = rows as ICurrencyRow[]
