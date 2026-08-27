// Generates the per-package data slices from the canonical ISO dataset.
//
// Source of truth: src/raw/dataset.json (377 locale combinations, each embedding a full
// language + country record). This script dedups it into the minimal slice each package
// bundles at build time:
//
//   @luwio/language  ← languages.json   (unique ISO 639 languages)
//   @luwio/country   ← countries.json   (unique ISO 3166 countries + language_codes)
//   @luwio/currency  ← currencies.json  (unique ISO 4217 currencies; names/minor units from ICU)
//
// It also writes each package's English name catalog (translations/<pkg>.en.json, machine_name →
// name) — kept in the package but excluded from its published dist; the docs site offers them as
// downloads. Other locales are hand-translated and left untouched here.
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
  const count = Array.isArray(value) ? value.length : Object.keys(value).length
  console.log(`  wrote ${count} entries → ${path.slice(packages.length + 1)}`)
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

// ── @luwio/currency ──────────────────────────────────────────────────────────
// Unique currencies keyed by ISO 4217 code, taken from each country's currency.
// The raw dataset carries the code + symbol; the English name and minor-unit digits
// come from the runtime's Intl data (Node ships full ICU), baked in here so the
// package needs no runtime Intl. A handful of non-ISO, pegged currencies (Jersey
// pound, …) have no Intl name — those fall back to a curated name below.
const CURRENCY_NAME_FALLBACKS = {
  CKD: 'Cook Islands Dollar',
  FOK: 'Faroese Króna',
  GGP: 'Guernsey Pound',
  IMP: 'Isle of Man Pound',
  JEP: 'Jersey Pound',
  KID: 'Kiribati Dollar',
  TVD: 'Tuvaluan Dollar',
}
const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' })
const minorUnitsOf = (code) => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions()
      .maximumFractionDigits
  } catch {
    return 2 // non-ISO codes Intl rejects are all 2-decimal (pegged to GBP/NZD/DKK/AUD)
  }
}
const currenciesByCode = new Map()
for (const entry of raw) {
  const { currency_code: code, currency_symbol: symbol } = entry.country
  if (!code || currenciesByCode.has(code)) continue
  const intlName = currencyNames.of(code)
  currenciesByCode.set(code, {
    code,
    name: intlName === code ? (CURRENCY_NAME_FALLBACKS[code] ?? code) : intlName,
    symbol,
    minor_units: minorUnitsOf(code),
  })
}
const currencies = [...currenciesByCode.values()].sort((a, b) => a.code.localeCompare(b.code))

// ── @luwio/timezone ──────────────────────────────────────────────────────────
// The IANA timezone list, straight from the runtime's ICU. Offsets/abbreviations are computed at
// runtime (DST-aware), so only the names are baked.
const timezones = Intl.supportedValuesOf('timeZone')

// ── Name catalogs (translations/<pkg>.en.json) ───────────────────────────────
// A `machine_name → English name` catalog per package, offered as a download on the docs site so
// implementors can localize names with `t(entity.machine_name)`. Kept in each package's
// `translations/` dir but excluded from its published `dist` (`files: ["dist"]`). Keyed by the same
// `machine_name` the domain derives at runtime (via the identical `toMachineName` below), so a
// downloaded file lines up with `Countries.all()` / `Languages.all()` / `Currencies.all()`.
// Only the English source is generated; other locales are hand-translated (e.g. countries.nl.json).
const toMachineName = (name) =>
  name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
const nameCatalog = (rows) => Object.fromEntries(rows.map((r) => [toMachineName(r.name), r.name]))

console.log(`Generating data slices from ${raw.length} locale entries:`)
writeJson(join(packages, 'language/src/data/languages.json'), languages)
writeJson(join(packages, 'country/src/data/countries.json'), countries)
writeJson(join(packages, 'currency/src/data/currencies.json'), currencies)
writeJson(join(packages, 'timezone/src/data/timezones.json'), timezones)
writeJson(join(packages, 'language/translations/languages.en.json'), nameCatalog(languages))
writeJson(join(packages, 'country/translations/countries.en.json'), nameCatalog(countries))
writeJson(join(packages, 'currency/translations/currencies.en.json'), nameCatalog(currencies))
