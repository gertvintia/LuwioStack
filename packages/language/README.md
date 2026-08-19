# @luwio/language

Typed **ISO 639** language data for JavaScript — a small, immutable domain model over the
ISO 639-1/2/3 list. Dependency-free and framework-agnostic (no React required).

Part of [Luwio](https://github.com/) — standalone, but pairs well with the other `@luwio/*`
packages (notably [`@luwio/country`](../country) and [`@luwio/locale`](../locale)).

## Install

```bash
npm install @luwio/language
```

## Usage

```ts
import { Language, Languages } from '@luwio/language'

const nl = Language.new({ code: 'nl' }) // ISO 639-1
nl.name        // 'Dutch'
nl.code        // 'nl'  (alias of alpha2)
nl.alpha2      // 'nl'
nl.alpha3      // 'nld' (ISO 639-3, falls back to 639-2)

// Look up by ISO 639-3 too:
Language.from({ code: 'nld', format: 'alpha3' }).name // 'Dutch'

// Immutable, de-duplicated collections:
Languages.empty()
  .add(Language.new({ code: 'nl' }))
  .add(Language.new({ code: 'fr' }))
  .size // 2
```

An unknown code throws — `Language.new({ code: 'zz' })` → `Error: Unknown language: zz`.

## API surface

- **Domain:** `Language` (`.new`, `.from`), `Languages`
- **Utils:** `toMachineName`
- **Types:** `ILanguage`, `ILanguages`, `LanguageCodeFormat`

## Data

The bundled ISO 639 dataset is generated from `@luwio/iso-data` (the monorepo's source of
truth) and ships inside this package — nothing is fetched or read at runtime.
