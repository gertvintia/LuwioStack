---
"@luwio/currency": minor
---

New package `@luwio/currency` — typed ISO 4217 currency data for React, mirroring `@luwio/country` / `@luwio/language`. `Currency.new({ code })` builds a currency with `code`, `name`, `symbol`, `minor_units` and `machine_name`; `Currencies.all()` / `.empty().add()` give immutable, de-duplicated collections. Ships React coupling: a `<Currency currency={…}>` provider (also carrying the `Currency.new` factory) and a `useCurrency()` → `{ currency }` hook. The dataset is generated from `@luwio/iso-data` (ISO 4217 codes + symbols, with English names and minor-unit digits from ICU). React is a peer dependency.
