# @luwio/country

Typed **ISO 3166** country data for JavaScript — countries, continents, land borders, dialing
codes, currencies, flags and the languages spoken in each. A small, immutable domain model;
framework-agnostic (no React required).

Part of [Luwio](https://github.com/) — standalone, but pairs well with the other `@luwio/*`
packages (notably [`@luwio/language`](../language) and [`@luwio/locale`](../locale)).

## Install

```bash
npm install @luwio/country
```

Pulls in [`@luwio/language`](../language) automatically — `Country.languages()` returns rich
`Language` objects.

## Usage

```ts
import { Country, Countries, Continent } from '@luwio/country'

const be = Country.new({ code: 'BE' }) // ISO 3166-1 alpha-2
be.name                 // 'Belgium'
be.alpha3               // 'BEL'
be.numeric              // '056'
be.direct_dialing_code  // '+32'
be.currency_code        // 'EUR'  (formatting lives in @luwio/money)
be.currency_symbol      // '€'
be.flag                 // '🇧🇪'
be.capital              // 'Brussels'

be.languages().toArray().map((l) => l.name) // ['Dutch', 'French', 'German']
be.borders().toArray().map((c) => c.code)   // ['FR', 'DE', 'LU', 'NL']
be.continent().name                          // 'Europe'

// Look up by alpha-3 or numeric too:
Country.from({ code: 'BEL', format: 'alpha3' }).code // 'BE'

// Continents and collections:
Continent.europe().countries().size // European countries
Countries.benelux().toArray().map((c) => c.code) // ['BE', 'NL', 'LU']
```

An unknown code throws — `Country.new({ code: 'ZZ' })` → `Error: Unknown country: ZZ`.

## API surface

- **Domain:** `Country` (`.new`, `.from`), `Countries`, `Continent`, `CONTINENT_MAP`
- **Utils:** `toMachineName`
- **Types:** `ICountry`, `ICountries`, `IContinent`, `CountryCodeFormat`

## Data

The bundled ISO 3166 dataset is generated from `@luwio/iso-data` (the monorepo's source of
truth) and ships inside this package — nothing is fetched or read at runtime. Spoken languages
are stored as ISO 639-1 codes and resolved to `Language` objects via `@luwio/language`.
