# Language name catalogs

Ready-to-use `machine_name → name` catalogs for localizing language names with
`@luwio/translations` — `t(language.machine_name)`.

- Keys are the language's `machine_name` (from `@luwio/language`), generated with `toMachineName`, so a
  file works directly with `Languages.all()` and `t(language.machine_name)`.
- `languages.en.json` — English names (source of truth for the keys).

These files are **kept with the package but excluded from its published bundle** (`files: ["dist"]`),
so they add nothing to an install. They're offered as downloads on the docs site — grab the ones you
need and commit them in your app. Add a new locale by copying `languages.en.json` and translating the
values (keep the keys).
