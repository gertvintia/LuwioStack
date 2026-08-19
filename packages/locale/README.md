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
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  // A locale that can't be resolved throws while rendering — an error boundary
  // turns that into a fallback instead of a blank screen.
  return (
    <ErrorBoundary fallback={<p>Unsupported locale.</p>}>
      <Locale
        locale="nl-BE"                 // required — the 'language-country' string
        policy={MatchingPolicy.STRICT} // optional — overrides the default (LOOSE)
      >
        <Info />
      </Locale>
    </ErrorBoundary>
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


A locale that can't be resolved throws while rendering, so wrap `<Locale>` in an error boundary
(above). For untrusted/optional values, resolve them first with
[`resolveLocale`](#locale-resolution) — it maps onto your supported set (falling back via the
required `*` catch-all) so `<Locale>` never throws. `useLocale` throws if used outside a provider.

## Domain model (no React required)

```ts
import { createLocale, Country, Continent, MatchingPolicy } from '@luwio/locale'

const locale = createLocale({ languageOrLocale: 'nl-BE' })
locale.language().name        // 'Dutch'
locale.country().alpha3       // 'BEL'
locale.country().borders()    // Countries → FR, DE, LU, NL

Country.new({ code: 'BE' }).direct_dialing_code   // '+32'
Continent.europe().countries().toArray().length   // European countries

// STRICT vs LOOSE, on 'en-BE' (English spoken in Belgium):
//   LOOSE (default) — 'en' and 'BE' each exist → accepted, even if not a listed pair.
//   STRICT          — must be an exact dataset entry → 'en-BE' throws ('nl-BE' passes).
// Either way, an unknown language or country (e.g. 'zz-BE') throws.
createLocale({ languageOrLocale: 'en', country: 'BE' })                                // 'en-BE' (LOOSE)
createLocale({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.STRICT }) // throws
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

With [`@luwio/router`](../router) (planned), `useRouteLocale()` always returns a locale — the one
in the URL, or the router's configured default when the URL has none — so you never handle `null`.
Resolve it onto what you support, then hand the result to `<Locale>`:

```tsx
import { Locale, resolveLocale } from '@luwio/locale'
import { useRouteLocale } from '@luwio/router'

const SUPPORTED = ['nl-BE', 'fr-FR', 'en-US']
const OVERRIDES = { 'en-*': 'en-US', '*': 'nl-BE' } // '*' catch-all → default

function App() {
  const { locale } = useRouteLocale() // always a locale (route's, or the router default)
  const active = resolveLocale({ detected: locale, supported: SUPPORTED, overrides: OVERRIDES })
  return (
    <Locale locale={active.locale}>
      <Site />
    </Locale>
  )
}
```

An unsupported `/pt-PT` falls to the `*` catch-all (default); everything else resolves through the
usual rules (same-language → per-pattern → catch-all). No crash, no manual null handling.

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
