---
"@luwio/country": minor
"@luwio/language": minor
"@luwio/locale": minor
---

Add stand-alone React coupling to `@luwio/country` and `@luwio/language`, mirroring `@luwio/locale`.

- `@luwio/country` now exports a `<Country country={…}>` provider and a `useCountry()` → `{ country }` hook. The exported `Country` is the provider and still carries the `Country.new` / `Country.from` factories, so one import both builds and provides.
- `@luwio/language` gains the same `<Language language={…}>` provider and `useLanguage()` → `{ language }` hook, with `Language.new` / `Language.from` on the exported `Language`.
- `<Locale>` now renders `<Country>` and `<Language>` under the hood, so `useCountry()` / `useLanguage()` also resolve inside a `<Locale>` — no extra wiring. `@luwio/locale` re-exports both hooks.

React is now a peer dependency of `@luwio/country` and `@luwio/language`.
