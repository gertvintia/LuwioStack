---
"@luwio/locale": minor
---

`@luwio/locale` now composes `@luwio/country` and `@luwio/language` instead of shipping its own
dataset, and drops matching policies in favour of a single rule.

- **Depends on** `@luwio/country` + `@luwio/language` (installed automatically). `Country`,
  `Countries`, `Continent`, `Language` and `Languages` are re-exported, so `@luwio/locale` stays a
  one-stop import.
- **No more matching policies.** `MatchingPolicy`, `LocalePolicy`, `resolvePolicy` and the `policy`
  prop/option are removed. A locale is valid whenever its language and country are each known;
  unknown parts throw.
- **`useLocale().current.locale`** is now the full `Locale` (the same object `Locale.new()` returns)
  rather than a `{ code }` stub; the redundant flat `current.language` / `country` / `languages` /
  `intl` fields are gone — reach them via `current.locale.language()` etc.
- `Country` gains `currency_code`, `capital`, `region`, `timezones` and `name_local`, and its
  `direct_dialing_code` is renamed to `dialing_code`.
- **`resolveLocale` and `SystemLocale` moved onto `Locale`** as `Locale.resolve()` and
  `Locale.system`, alongside `Locale.new()` — the standalone `resolveLocale` / `SystemLocale`
  exports are removed.
- `Locale.resolve`'s `supported` list is now **optional** — omit it to accept any valid locale (a
  known language + known country), i.e. the whole dataset.
