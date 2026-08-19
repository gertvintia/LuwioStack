---
"@luwio/country": minor
"@luwio/language": minor
---

Initial release of `@luwio/country` and `@luwio/language` — the ISO data packages `@luwio/locale`
is built on, now standalone.

- `@luwio/language`: typed ISO 639 language data. `Language` (`.new` / `.from`), `Languages`,
  dependency-free and framework-agnostic.
- `@luwio/country`: typed ISO 3166 country data. `Country` (`.new` / `.from`) exposing ISO codes,
  capital, region, `dialing_code`, `currency_code` (symbol + formatting live in `@luwio/money`),
  `timezones`, plus `.languages()` (rich `Language` objects via `@luwio/language`), `.borders()`
  and `.continent()`; `Continent` and immutable `Countries` collections.

Both bundle their own data slice, generated at build time from the internal `@luwio/iso-data`
source of truth — nothing is read at runtime.
