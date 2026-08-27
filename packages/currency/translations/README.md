# Currency name catalogs

Ready-to-use `machine_name → name` catalogs for localizing currency names with
`@luwio/translations` — `t(currency.machine_name)`.

- Keys are the currency's `machine_name` (from `@luwio/currency`), generated with `toMachineName`, so a
  file works directly with `Currencies.all()` and `t(currency.machine_name)`.
- `currencies.en.json` — English names (source of truth for the keys).

These files are **kept with the package but excluded from its published bundle** (`files: ["dist"]`),
so they add nothing to an install. They're offered as downloads on the docs site — grab the ones you
need and commit them in your app. Add a new locale by copying `currencies.en.json` and translating the
values (keep the keys). Regenerate the English source with `pnpm gen:data`.
