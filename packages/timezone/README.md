# @luwio/timezone

Typed IANA timezone data for React — a small domain model over the runtime's timezone database, with
DST-aware offsets/abbreviations, a `<Timezone>` provider and a `useTimezone` hook. Mirrors
`@luwio/country` / `@luwio/currency`. Built for `@luwio/datetime` to compose.

```bash
npm i @luwio/timezone
```

React 18+ is a peer dependency (only for the provider / hook).

## Usage

```ts
import { Timezone, Timezones } from '@luwio/timezone'

const tz = Timezone.new({ name: 'Europe/Brussels' }) // unknown names throw
tz.name             // 'Europe/Brussels'
tz.machine_name     // 'europe_brussels'
tz.offset()         // minutes east of UTC now (DST-aware): 60 (CET) / 120 (CEST)
tz.offset(new Date('2024-07-15')) // 120
tz.abbreviation()   // 'CET' / 'CEST' (or 'GMT+1' where no abbreviation exists)

Timezone.system     // the runtime's timezone
Timezones.all().toArray().length // every IANA zone the runtime knows
```

## React

```tsx
import { Timezone, useTimezone } from '@luwio/timezone/react'

function App() {
  return (
    <Timezone timezone={Timezone.system}>
      <Clock />
    </Timezone>
  )
}

function Clock() {
  const { timezone } = useTimezone()
  return <span>{timezone.name} (UTC{timezone.offset() >= 0 ? '+' : ''}{timezone.offset() / 60})</span>
}
```

`Timezone` from `@luwio/timezone` is the React-free domain class; `@luwio/timezone/react` exports the
`<Timezone>` provider (which also carries `Timezone.new` / `Timezone.system`) and `useTimezone()` →
`{ timezone }` (throws outside a provider). Offsets and abbreviations come from the runtime's `Intl`
timezone database, so they're correct for any instant, DST included. The bundled name list is
generated with `pnpm gen:data` — do not edit `src/data/*.json` by hand.
