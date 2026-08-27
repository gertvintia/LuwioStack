---
"@luwio/iban": minor
---

New package `@luwio/iban` — typed IBAN validation and formatting for React. `Iban.parse(value)` (spaces/case ignored) validates the country length and the ISO 13616 MOD-97 checksum — one global algorithm over a per-country length registry, so it covers every IBAN country — and throws on anything invalid; it exposes `value`, `countryCode`, `checkDigits`, `bban`, `format()` (print groups of four) and `country()` (a `@luwio/country` Country). `Iban.isValid(...)` is the non-throwing check and `Iban.supportedCountries()` lists the registry. Split like the rest: React-free domain at `@luwio/iban`, `<Iban>` provider + `useIban()` at `@luwio/iban/react`. `@luwio/country` is a dependency; React is a peer dependency.
