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
import { LocaleProvider, useLocale } from '@luwio/locale'

function App() {
  return (
    <LocaleProvider locale="nl-BE">
      <Info />
    </LocaleProvider>
  )
}

function Info() {
  const { locale, country, language } = useLocale()
  return (
    <p>
      {language.name} in {country.name} ({locale.locale}) — dial {country.direct_dialing_code}
    </p>
  )
}
```

## Domain model (no React required)

```ts
import { createLocale, Country, Continent, MatchingPolicy } from '@luwio/locale'

const locale = createLocale({ languageOrLocale: 'nl-BE' })
locale.language().name        // 'Dutch'
locale.country().alpha3       // 'BEL'
locale.country().borders()    // Countries → FR, DE, LU, NL

Country.new({ code: 'BE' }).direct_dialing_code   // '+32'
Continent.europe().countries().toArray().length   // European countries

// Loose matching: language and country must each exist, not necessarily together
createLocale({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.LOOSE })
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

Getting the locale from the URL (with a redirect when it's missing) will be provided as an
integration with [`@luwio/router`](../router) — a supported locale in the URL is used as-is,
otherwise `resolveLocale(SystemLocale, …)` picks the best supported locale and redirects. See the
docs for the planned shape.

## Structure

```
src/
├── domain/   Locale, Language(s), Country(ies), Continent, SystemLocale
├── utils/    createLocale, resolveLocale, resolvePolicy, normalizeLocale, …
├── react/    LocaleContext, LocaleProvider, useLocale
├── dataset/  built-in dataset + internal registry (module composes its data here)
├── data/     dataset.json (built-in ISO 639 / ISO 3166 dataset)
└── types.ts  interfaces + enums
```

## API surface

- **React:** `LocaleProvider`, `useLocale`
- **Factory:** `createLocale`, `resolveLocale`, `SystemLocale`
- **Domain:** `Locale`, `Language`, `Languages`, `Country`, `Countries`, `Continent`
- **Utils:** `normalizeLocale`, `matchLocalePattern`, `resolvePolicy`, `toMachineName`
- **Types:** `ILocale`, `ICountry`, `ILanguage`, `MatchingPolicy`, `LocalePolicy`, …
