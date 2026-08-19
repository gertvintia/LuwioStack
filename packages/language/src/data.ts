import rows from './data/languages.json'
import type { ILanguageRow } from './types'

// The built-in ISO 639 dataset, bundled into this package at build time. Generated from
// @luwio/iso-data — do not edit by hand; run `pnpm gen:data` from the repo root.
export const languageRows = rows as ILanguageRow[]
