---
"@luwio/locale": minor
---

**Breaking:** React locale API reworked.

- `<Locale>`'s `locale` prop now takes a resolved `Locale` object (`ILocale`) instead of a `language-country` string. Pass a `Locale.new(...)` or `Locale.resolve(...)` result directly — e.g. `<Locale locale={Locale.new({ languageOrLocale: 'nl-BE' })}>`. This drops the redundant string round-trip when you already hold a resolved locale (as the router does), and moves fail-fast validation to where the locale is constructed.
- `useLocale()` now returns `{ locale }` instead of `{ current }` — read the active locale as `const { locale } = useLocale()` (was `const { current } = useLocale(); current.locale`). The `CurrentLocale` type is removed.
