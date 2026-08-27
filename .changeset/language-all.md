---
"@luwio/language": minor
---

Add `Languages.all()` — the whole bundled ISO 639 dataset as a `Languages` collection. Handy for building a `machine_name → name` catalog (each language's `machine_name` is a stable, unique translation key, so you can localize names with `t(language.machine_name)`) or a language picker.
