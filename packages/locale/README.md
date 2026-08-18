# @luwio/locale

Simple, predictable **locale management** for React. A typed domain model over a built-in
ISO dataset (377 language-country combinations) — resolve locales, inspect the country and
language behind them, and expose the active locale through a provider + hook.

Part of [Luwio](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> Ported and restructured from [`@tacky-org/locale`](https://github.com/gertvdb/locale-react).

## Install

```bash
npm install @luwio/locale
```

React 18+ is a peer dependency (the domain layer works without React too).

## React usage

```tsx
import { Locale, MatchingPolicy, useLocale } from '@luwio/locale'

function App() {
  return (
    <Locale
      locale="nl-BE"                 // required — the 'language-country' string
      policy={MatchingPolicy.STRICT} // optional — overrides the default (LOOSE)
    >
      <Info />
    </Locale>
  )
}

function Info() {
  const { current } = useLocale()
  return (
    <p>
      {current.language.name} in {current.region.name} ({current.locale.code})
      — dial {current.region.direct_dialing_code}
    </p>
  )
}
```


With just `locale`, an unknown value throws. Add `supported` + `overrides` and `<Locale>` resolves
exactly like [`resolveLocale`](#locale-resolution) — an unknown `locale` falls back via the
required `*` catch-all instead of throwing. `resolveLocale` also accepts a raw string as `detected`.

## Domain model (no React required)

```ts
import { createLocale, Country, Continent, MatchingPolicy } from '@luwio/locale'

const locale = createLocale({ languageOrLocale: 'nl-BE' })
locale.language().name        // 'Dutch'
locale.country().alpha3       // 'BEL'
locale.country().borders()    // Countries → FR, DE, LU, NL

Country.new({ code: 'BE' }).direct_dialing_code   // '+32'
Continent.europe().countries().toArray().length   // European countries

// Loose matching is the default: language and country must each exist, not
// necessarily together. Pass MatchingPolicy.STRICT to require the exact combo.
createLocale({ languageOrLocale: 'en', country: 'BE' }) // 'en-BE'
```

## Locale resolution

`resolveLocale` maps a detected locale onto the ones your app supports, with exact →
override → wildcard → same-language → catch-all fallback:

```ts
import { resolveLocale, SystemLocale } from '@luwio/locale'

resolveLocale({
  detected: SystemLocale,
  supported: ['nl-BE', 'fr-FR', 'en-US'],
  overrides: { 'en-*': 'en-US', '*': 'nl-BE' }, // '*' catch-all is required
})
```

## Locale routing

With [`@luwio/router`](../router) (planned), take the locale from the URL — a string, or `null`
when the route has no locale segment — map it onto what you support with `resolveLocale`, then hand
the result to `<Locale>`:

```tsx
import { Locale, resolveLocale } from '@luwio/locale'
import { useRouteLocale } from '@luwio/router'

const SUPPORTED = ['nl-BE', 'fr-FR', 'en-US']
const OVERRIDES = { 'en-*': 'en-US', '*': 'nl-BE' } // '*' catch-all is required

function App() {
  const { locale } = useRouteLocale()   // '/pt-PT' → 'pt-PT', or null for '/about'
  const active = resolveLocale({ detected: locale, supported: SUPPORTED, overrides: OVERRIDES })
  return (
    <Locale locale={active.locale}>
      <Site />
    </Locale>
  )
}
```

An unsupported `/pt-PT` and a missing (`null`) locale both land on the `*` catch-all; anything else
resolves through the usual rules (same-language → per-pattern → catch-all). The site renders in the
default language — no redirect, no crash.

## Structure

```
src/
├── domain/   Locale, Language(s), Country(ies), Continent, SystemLocale
├── utils/    createLocale, resolveLocale, resolvePolicy, normalizeLocale, …
├── react/    LocaleContext, Locale, useLocale
├── dataset/  built-in dataset + internal registry (module composes its data here)
├── data/     dataset.json (built-in ISO 639 / ISO 3166 dataset)
└── types.ts  interfaces + enums
```

## API surface

- **React:** `Locale`, `useLocale` (returns `{ current }` → `locale.code`, `language`, `region`, `languages`, `intl`)
- **Factory:** `createLocale`, `resolveLocale`, `SystemLocale`
- **Domain:** `Language`, `Languages`, `Country`, `Countries`, `Continent`
- **Utils:** `normalizeLocale`, `matchLocalePattern`, `resolvePolicy`, `toMachineName`
- **Types:** `ILocale`, `ICountry`, `ILanguage`, `MatchingPolicy`, `LocalePolicy`, …
