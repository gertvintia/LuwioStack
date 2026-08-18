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

## Custom data sources

The library ships a built-in ISO dataset, but you can **replace or extend** it with your own. A
data source is just entries in the interface format (`IDatasetEntry`) — build one with
`defineDataSource`, then activate it with `configureDataset`. All domain lookups (`Country`,
`Language`, `Continent`, `Locale`, `resolveLocale`) read from the active dataset.

```ts
import { builtinDataSource, configureDataset, defineDataSource } from '@luwio/locale'

// Extend the built-in data (include builtinDataSource; later sources win)
configureDataset(
  builtinDataSource,
  defineDataSource(myRows, (row) => ({
    locale: row.tag,             // e.g. 'xx-QQ'
    language: { name: row.lang, name_local: row.lang, iso_639_1: row.langCode, iso_639_2: '', iso_639_3: '' },
    country: { name: row.country, /* …ICountry fields… */ },
  })),
)

// …or replace it entirely (omit builtinDataSource)
configureDataset(defineDataSource(myEntries))

// Restore the built-in dataset
import { resetDataset } from '@luwio/locale'
resetDataset()
```

Sources merge left → right at three granularities — a single country (by alpha-2) or language (by
ISO 639-1) overrides that unit across *every* locale that references it, while `locale` decides
which entries exist. So you can change just Belgium's dialing code without re-supplying every
`xx-BE` entry. For async data,
fetch first and call `configureDataset` once it resolves (the domain layer stays synchronous).

## Structure

```
src/
├── domain/   Locale, Language(s), Country(ies), Continent, SystemLocale
├── utils/    createLocale, resolveLocale, resolvePolicy, normalizeLocale, …
├── react/    LocaleContext, LocaleProvider, useLocale
├── dataset/  registry + configureDataset / defineDataSource / builtinDataSource
├── data/     dataset.json (built-in ISO 639 / ISO 3166 dataset)
└── types.ts  interfaces + enums
```

## API surface

- **React:** `LocaleProvider`, `useLocale`
- **Factory:** `createLocale`, `resolveLocale`, `SystemLocale`
- **Data sources:** `configureDataset`, `defineDataSource`, `builtinDataSource`, `resetDataset`, `getDataset`
- **Domain:** `Locale`, `Language`, `Languages`, `Country`, `Countries`, `Continent`
- **Utils:** `normalizeLocale`, `matchLocalePattern`, `resolvePolicy`, `toMachineName`
- **Types:** `ILocale`, `ICountry`, `ILanguage`, `MatchingPolicy`, `LocalePolicy`, …
