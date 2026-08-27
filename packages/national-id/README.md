# @luwio/national-id

Typed national identification number validation for React — an **incremental per‑country registry**.
Unlike IBAN there's no single global algorithm; each country has its own scheme, so support is added
one country at a time. A `<NationalId>` provider and `useNationalId` hook, mirroring `@luwio/iban`.

Ships with eight countries:

| Country | Scheme | Notes |
| --- | --- | --- |
| **BE** | Rijksregisternummer **+ BIS number** | MOD‑97 check (pre‑2000 / 2000+ variants); extracts birth date & sex; flags BIS (`isBis`) |
| **DE** | Steuerliche Identifikationsnummer | ISO 7064 MOD 11,10 check + repeated‑digit rule |
| **ES** | DNI **and** NIE | mod‑23 control letter (X/Y/Z → 0/1/2 for NIE) |
| **FR** | NIR / INSEE (n° de sécurité sociale) | MOD‑97 key; Corsica `2A`/`2B` handled; extracts sex |
| **GB** | National Insurance number (UK) | prefix/suffix rules (no check digit) — registered under ISO code `GB` |
| **IT** | Codice Fiscale | control character; handles omocodia; extracts sex |
| **NL** | Burgerservicenummer (BSN) | 11‑test; 8‑digit numbers zero‑padded |
| **PT** | NIF (Número de Identificação Fiscal) | weighted mod‑11 check |

```bash
npm i @luwio/national-id
```

`@luwio/country` is a dependency; React 18+ is a peer dependency (only for the provider / hook).

## Usage

```ts
import { NationalId } from '@luwio/national-id'
import { Country } from '@luwio/country'

const be = Country.new({ code: 'BE' })

const id = NationalId.parse('85.07.30-033.28', be) // separators & case ignored; invalid input throws
id.value       // '85073003328'  (normalized)
id.countryCode // 'BE'
id.country()   // a @luwio/country Country — id.country().name === 'Belgium'

// Scheme-specific data lives on id.details, discriminated by countryCode — you only ever see the
// fields a number actually encodes (no properties that are silently null half the time). Narrow:
if (id.details.countryCode === 'BE') {
  id.details.birthDate // Date 1985-07-30 (null when unknown)
  id.details.sex       // 'male'
  id.details.isBis     // false — true for a Belgian BIS (non-resident) number
}

NationalId.isValid('111222333', Country.new({ code: 'NL' })) // true  (non-throwing)
NationalId.supportedCountries()                              // ['BE','DE','ES','FR','GB','IT','NL','PT']
```

`id.details` is a discriminated union. Its shape per country: `BE` → `{ birthDate, sex, isBis }`;
`FR` and `IT` → `{ sex }`; `DE`, `ES`, `GB`, `NL`, `PT` → no extra fields (their numbers encode no
personal data). This is deliberate — there are no `birthDate` / `sex` properties sitting `null` on
countries that don't have them.

### Belgian BIS numbers

A BIS number has the same shape as a Rijksregisternummer, but the month field carries **+20** (sex
known at registration) or **+40** (sex unknown). Both validate, and `id.isBis` tells them apart:

```ts
const bis = NationalId.parse('90210100166', be)
if (bis.details.countryCode === 'BE') {
  bis.details.isBis     // true
  bis.details.birthDate // 1990-01-01  (month 21 → January)
}
```

### Supported vs. invalid

"Not supported yet" is kept distinct from "invalid" — parsing an unregistered country throws
`UnsupportedCountryError`, not a validation error, so an unimplemented country never looks like a bad
number:

```ts
import { NationalId, UnsupportedCountryError } from '@luwio/national-id'

const us = Country.new({ code: 'US' })
NationalId.isSupported(us) // false
try {
  NationalId.parse('123', us)
} catch (err) {
  err instanceof UnsupportedCountryError // true — err.countryCode === 'US'
}
```

## React

```tsx
import { NationalId, useNationalId } from '@luwio/national-id/react'
import { Country } from '@luwio/country'

function App() {
  return (
    <NationalId nationalId={NationalId.parse('85073003328', Country.new({ code: 'BE' }))}>
      <Citizen />
    </NationalId>
  )
}

function Citizen() {
  const { nationalId } = useNationalId()
  const sex = nationalId.details.countryCode === 'BE' ? nationalId.details.sex : null
  return <span>{nationalId.country().name} · {sex}</span>
}
```

`NationalId` from `@luwio/national-id` is the React‑free domain class; `@luwio/national-id/react`
exports the `<NationalId>` provider (which also carries `NationalId.parse` / `isValid` / `isSupported`
/ `supportedCountries`) and `useNationalId()` → `{ nationalId }` (throws outside a provider).

## Adding a country

Each country is one file. Implement a `NationalIdSpec` in `src/countries/<code>.ts` that validates a
normalized string and returns the parsed fields (or `null`), then register it in `src/registry.ts` —
purely additive, nothing else changes.

```ts
// src/countries/xx.ts
import type { NationalIdSpec } from '../types'
export const xx: NationalIdSpec = {
  parse: (value) => (/* valid? */ ? { countryCode: 'XX' } : null),
}
```

If the scheme encodes personal data, add a variant to the `NationalIdDetails` union in
`src/types.ts` (e.g. `{ countryCode: 'XX'; birthDate: Date | null }`) and return those fields — so
the data is typed only where it exists.
