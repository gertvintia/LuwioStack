---
"@luwio/country": minor
"@luwio/currency": minor
"@luwio/language": minor
"@luwio/phone": minor
"@luwio/locale": minor
---

**Split the domain from the React provider across two entry points**, keeping short names on both.

- **`@luwio/<pkg>` (root) is React-free**: the domain under its clean name — `Country` / `Currency` /
  `Language` (classes with `.new` / `.from`), `Phone` (`.parse` / `.isValid`), and `Locale` (a
  `{ new, resolve, system }` factory) — plus collections, types and `toMachineName`. Importing the
  root never pulls in React.
- **`@luwio/<pkg>/react` holds the React bindings**: the short-named provider (`<Country>`,
  `<Currency>`, `<Language>`, `<Phone>`, `<Locale>`) — which also carries the domain factory, so
  `import { Country } from '@luwio/country/react'` both builds and provides — plus `useCountry` etc.
  and the context. `@luwio/locale/react`'s `<Locale>` composes the child providers and re-exports
  their React bindings.

**Breaking:** React bindings moved from the package root to the `/react` subpath. Update imports:
`import { Country, useCountry } from '@luwio/country/react'` (was `@luwio/country`). Domain imports
(`import { Country } from '@luwio/country'`, `Country.new`, `Phone.parse`, `Locale.new`) are unchanged.
