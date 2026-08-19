// Generates the per-package data slices from the canonical ISO dataset.
//
// Source of truth: src/raw/dataset.json (377 locale combinations, each embedding a full
// language + country record). This script dedups it into the minimal slice each package
// bundles at build time:
//
//   @luwio/language  ← languages.json   (unique ISO 639 languages)
//   @luwio/country   ← countries.json   (unique ISO 3166 countries + language_codes)
//
// The slices are committed to git — treat them as generated artifacts. Re-run with
// `pnpm --filter @luwio/iso-data generate` (or `pnpm gen:data` from the root) after
// editing the raw dataset.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const isoData = join(here, '..')
const packages = join(isoData, '..')

const raw = JSON.parse(readFileSync(join(isoData, 'src/raw/dataset.json'), 'utf8'))

/** Write `value` as pretty JSON (2-space, trailing newline) after ensuring its dir exists. */
function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
  console.log(`  wrote ${value.length} entries → ${path.slice(packages.length + 1)}`)
}

// ── @luwio/language ──────────────────────────────────────────────────────────
// Every language that appears anywhere (as a locale's primary language, or as a
// language spoken in some country), keyed by ISO 639-1. Languages without an ISO
// 639-1 code can't be looked up by the domain layer, so they're skipped here.
const languagesByCode = new Map()
function collectLanguage(l) {
  if (!l || l.iso_639_1 === '') return
  if (languagesByCode.has(l.iso_639_1)) return
  languagesByCode.set(l.iso_639_1, {
    name: l.name,
    name_local: l.name_local,
    iso_639_1: l.iso_639_1,
    iso_639_2: l.iso_639_2,
    iso_639_3: l.iso_639_3,
  })
}
for (const entry of raw) {
  collectLanguage(entry.language)
  for (const l of entry.country.languages) collectLanguage(l)
}
const languages = [...languagesByCode.values()].sort((a, b) =>
  a.iso_639_1.localeCompare(b.iso_639_1),
)

// ── @luwio/country ───────────────────────────────────────────────────────────
// Unique countries keyed by ISO 3166-1 alpha-2. Spoken languages are stored as a
// list of ISO 639-1 codes (`language_codes`) — the rich Language objects are built
// by @luwio/country via @luwio/language, so we never duplicate language records.
const countriesByAlpha2 = new Map()
for (const entry of raw) {
  const c = entry.country
  if (countriesByAlpha2.has(c.iso_3166_1_alpha2)) continue
  const language_codes = []
  for (const l of c.languages) {
    if (l.iso_639_1 !== '' && !language_codes.includes(l.iso_639_1))
      language_codes.push(l.iso_639_1)
  }
  countriesByAlpha2.set(c.iso_3166_1_alpha2, {
    name: c.name,
    name_local: c.name_local,
    iso_3166_1_alpha2: c.iso_3166_1_alpha2,
    iso_3166_1_alpha3: c.iso_3166_1_alpha3,
    iso_3166_1_numeric: c.iso_3166_1_numeric,
    continent: c.continent,
    region: c.region,
    capital: c.capital,
    dialing_code: c.direct_dialing_code,
    currency_code: c.currency_code,
    timezones: c.timezones,
    borders: c.borders,
    language_codes,
  })
}
const countries = [...countriesByAlpha2.values()].sort((a, b) =>
  a.iso_3166_1_alpha2.localeCompare(b.iso_3166_1_alpha2),
)

console.log(`Generating data slices from ${raw.length} locale entries:`)
writeJson(join(packages, 'language/src/data/languages.json'), languages)
writeJson(join(packages, 'country/src/data/countries.json'), countries)
