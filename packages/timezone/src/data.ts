import rows from './data/timezones.json'

// The IANA timezone list, bundled at build time. Generated from `Intl.supportedValuesOf('timeZone')`
// via @luwio/iso-data — do not edit by hand; run `pnpm gen:data` from the repo root.
export const timezoneRows = rows as string[]
