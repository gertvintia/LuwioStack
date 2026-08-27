# @luwio/iban

Typed IBAN validation and formatting for React — the global ISO 13616 (MOD‑97) check over a
per‑country length registry, so it validates **every IBAN country** out of the box. A `<Iban>`
provider and `useIban` hook, mirroring `@luwio/phone`.

```bash
npm i @luwio/iban
```

`@luwio/country` is a dependency; React 18+ is a peer dependency (only for the provider / hook).

## Usage

```ts
import { Iban } from '@luwio/iban'

const iban = Iban.parse('BE68 5390 0754 7034') // spaces & case ignored; invalid input throws
iban.value        // 'BE68539007547034'  (canonical, compact)
iban.countryCode  // 'BE'
iban.checkDigits  // '68'
iban.bban         // '539007547034'
iban.format()     // 'BE68 5390 0754 7034'  (print groups of four)
iban.country()    // a @luwio/country Country — iban.country().name === 'Belgium'

Iban.isValid('DE89370400440532013000') // true  (non-throwing)
Iban.supportedCountries()              // every ISO code with a defined IBAN format
```

## React

```tsx
import { Iban, useIban } from '@luwio/iban/react'

function App() {
  return (
    <Iban iban={Iban.parse('BE68539007547034')}>
      <Account />
    </Iban>
  )
}

function Account() {
  const { iban } = useIban()
  return <span>{iban.format()} · {iban.country().name}</span>
}
```

`Iban` from `@luwio/iban` is the React‑free domain class; `@luwio/iban/react` exports the `<Iban>`
provider (which also carries `Iban.parse` / `Iban.isValid`) and `useIban()` → `{ iban }` (throws
outside a provider). Validation is a single algorithm (ISO 13616) plus the per‑country length table
in `src/data.ts` — add a country by adding one line.
