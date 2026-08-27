---
"@luwio/country": minor
---

Add `Countries.all()` — the whole bundled ISO 3166 dataset as a `Countries` collection. Handy for building a `machine_name → name` catalog (each country's `machine_name` is a stable, unique translation key, so you can localize names with `t(country.machine_name)`) or a country picker.
