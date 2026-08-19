import rows from './data/countries.json'
import type { ICountryRow } from './types'

// The built-in ISO 3166 dataset, bundled into this package at build time. Generated from
// @luwio/iso-data — do not edit by hand; run `pnpm gen:data` from the repo root.
export const countryRows = rows as ICountryRow[]
