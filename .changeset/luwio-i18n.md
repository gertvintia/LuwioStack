---
"@luwio/translations": minor
---

Add `@luwio/translations`: Lingui-powered translations for React. Create a store with `createTranslations()` (no config), hand it to `<Translations translations={…}>`, and reach it with `useTranslations()` → `{ translations }` to `add()` catalogs at runtime (cached, deduped, from an import/API/inline; languages are validated as `@luwio/language`s), `activate()` a language, or `t()` / `<Trans>` to translate.
