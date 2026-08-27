# @luwio/translations

Lingui-powered translations for React. Just translations:

1. Create a **`Translations`** object with `createTranslations()` — no config.
2. Hand it to **`<Translations translations={translations}>`** — like `<RouterProvider router={…} />`.
3. Reach it with **`useTranslations()`** to `add()` catalogs at runtime (cached, deduped) from
   anywhere — an import, an API, inline messages — `activate()` a language, or `t()` to translate.

Languages are added **ad-hoc** (no upfront list); each must be a valid
[`@luwio/language`](../language) `ILanguage`, so it's valid by construction. It knows nothing about
routing.

> Built on [Lingui](https://lingui.dev). Install `@lingui/core` and `@lingui/react` (peers), and use
> the Lingui CLI/config in your app to extract and compile catalogs.

## Install

```bash
npm install @luwio/translations @lingui/core @lingui/react
```

## Create & provide

```ts
// translations.ts
import { createTranslations } from '@luwio/translations'

export const translations = createTranslations() // no config; add languages with add()
```

```tsx
// App.tsx
import { Translations } from '@luwio/translations'
import { translations } from './translations'

function App() {
  return (
    <Translations translations={translations}>
      <Site />
    </Translations>
  )
}
```

## Add a catalog — from anywhere

`add` / `activate` / `isLoaded` take an **`ILanguage`** (from `@luwio/language`), so a language is
always valid. The `source` accepts messages directly, a dynamic import, an API call, or a promise.
It's awaitable, cached and deduped — a language is fetched at most once and never re-loads on switch.

```ts
import { Language } from '@luwio/language'

const nl = Language.new({ code: 'nl' })
const fr = Language.new({ code: 'fr' })

await translations.add(nl, { greeting: 'Hallo' })                                 // inline messages
await translations.add(fr, () => import('./locales/fr').then((m) => m.messages))  // file import
await translations.add(fr, () => fetch(`/api/i18n/${fr.code}`).then((r) => r.json())) // API

translations.activate(nl) // switch to a loaded language
```

## Preload

Preloading is just `add()` without `activate()` — warm the languages a user is likely to switch to
(after first paint, on idle, or on hover) so the switch itself is synchronous, with no fetch and no
loading state.

```ts
const nl = Language.new({ code: 'nl' })
const fr = Language.new({ code: 'fr' })

// Warm the other languages in the background…
void Promise.all([
  translations.add(nl, () => fetch(`/api/i18n/${nl.code}`).then((r) => r.json())),
  translations.add(fr, () => fetch(`/api/i18n/${fr.code}`).then((r) => r.json())),
])

// …later the switch is instant — already cached:
translations.activate(fr)
```

## useTranslations

```tsx
import { Trans, useTranslations } from '@luwio/translations'

function Greeting() {
  const { translations } = useTranslations() // like useRouter() → { router }; re-renders on change
  return (
    <>
      <h1>{translations.t('greeting')}</h1>
      <p>
        <Trans id="welcome" message="Welcome, {name}" values={{ name: 'Gert' }} />
      </p>
    </>
  )
}
```

## With a route (`@luwio/router`)

`@luwio/translations` is routing-agnostic — this is just how an app wires it. `@luwio/router` puts the
resolved locale in route context, so a layout route adds + activates the catalog in `beforeLoad`.
Because `add` is awaited, the route waits for translations; because it's cached, moving between pages
in the same language never re-fetches.

```tsx
import { createRoute } from '@luwio/router'
import { Shell } from '../components/Shell'
import { translations } from '../translations'

export default createRoute({
  id: 'shell',
  layout: true,
  component: Shell,
  beforeLoad: async ({ context }) => {
    const language = context.locale.language() // an ILanguage from @luwio/language
    await translations.add(language, () => fetch(`/api/i18n/${language.code}`).then((r) => r.json()))
    translations.activate(language)
  },
})
```

## API

- `createTranslations()` → `ITranslations` (no config)
  - `add(language, source)` — add a catalog for an `ILanguage` from a `CatalogSource` (messages ·
    `() => import(…)` · `() => fetch(…)` · promise); cached, deduped, awaitable
  - `activate(language)` — make an `ILanguage` active
  - `isLoaded(language)` — whether an `ILanguage`'s catalog is loaded
  - `languages` — the `ILanguage[]` added so far
  - `t(id, values?)` — runtime translate
- React: `Translations` (provider, `{ translations }`), `useTranslations()` → `{ translations }`,
  `Trans`, `useLingui` (re-exported from `@lingui/react`)
- Types: `ITranslations`, `CatalogSource`, `Messages`
