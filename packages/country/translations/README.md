# Country name catalogs

Ready-to-use `machine_name → name` catalogs for localizing country names with
`@luwio/translations` — `t(country.machine_name)`.

- Keys are the country's `machine_name` (from `@luwio/country`), generated with `toMachineName`, so a
  file works directly with `Countries.all()` and `t(country.machine_name)`.
- `countries.en.json` — English names (source of truth for the keys).
- `countries.nl.json` — Dutch names; untranslated entries fall back to the English name.

These files are **kept with the package but excluded from its published bundle** (`files: ["dist"]`),
so they add nothing to an install. They're offered as downloads on the docs site — grab the ones you
need and commit them in your app. Add a new locale by copying `countries.en.json` and translating the
values (keep the keys).
