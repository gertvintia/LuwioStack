# AGENTS.md — working in the Luwio monorepo

Conventions an AI (or human) should follow when changing this repo. Keep new code consistent with
what's already here; mirror an existing package rather than inventing a new shape.

## Layout & tooling

- **pnpm workspaces**: `packages/*` (published libraries) and `apps/*` (docs site, showcase). Node
  ESM (`"type": "module"`) throughout.
- **Build**: [tsdown](https://tsdown.dev) → dual ESM+CJS + `.d.ts`. `packages/*/tsdown.config.ts`
  emits `dist/` from `src/index.ts`; React and sibling `@luwio/*` are **external** (never bundled).
- **Test**: vitest, `globals: true`. React packages use `environment: 'happy-dom'`. Tests are
  **colocated** (`*.test.ts` / `*.test.tsx`). A package that imports a sibling aliases it to the
  sibling's `src` in `vitest.config.ts` so tests run without a prior build.
- **Lint/format**: Biome — single quotes, **no semicolons**, 2-space indent, `lineWidth: 100`,
  organized imports/exports. Run `pnpm --filter <pkg> exec biome check --write .`.
- **Releases**: Changesets. Add a `.changeset/*.md` for every package change (`minor` pre-1.0).
- **Commands**: `pnpm dev` (all packages watch + apps on an auto port, browser opens),
  `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm gen:data` (regenerate datasets).

## Package anatomy (mirror this)

```
packages/<pkg>/
  src/
    index.ts                 # ROOT entry — React-free domain only
    react.ts                 # "/react" entry — provider + hook + context (React)
    types.ts                 # I<Entity> interfaces, enums (e.g. ICountry, CountryCodeFormat)
    domain/<entity>.ts       # the domain class (React-free)
    domain/<entities>.ts     # immutable collection (empty/all/add/remove/toArray)
    data.ts + data/*.json    # bundled dataset (generated — do not hand-edit)
    react/<entity>-context.ts
    react/<entity>-provider.tsx
    react/use-<entity>.ts
    utils/to-machine-name.ts
    *.test.ts(x)
  translations/              # name catalogs (see below) — NOT published
  package.json tsconfig.json tsconfig.build.json tsdown.config.ts vitest.config.ts README.md
```

- Two entry points: `.` (React-free domain) and `./react` (React bindings). tsdown builds both:
  `entry: ['src/index.ts', 'src/react.ts']`. `package.json` `exports` maps `.` → `dist/index.*` and
  `./react` → `dist/react.*` (each with `import`/`require` → `types` + `default`).
- `package.json`: `"files": ["dist"]`, `"sideEffects": false`, `"peerDependencies": { "react": ">=18" }`,
  and `react`/`react-dom`/`@types/react` from `catalog:` in devDependencies.
- `tsconfig.json` maps sibling `@luwio/*` **and** their `@luwio/*/react` subpaths to `src` via `paths`
  (for `tsc --noEmit`); `tsconfig.build.json` is paths-free and is what tsdown builds against.
- `vitest.config.ts` aliases the same sibling paths to `src` — list the `/react` subpath **before**
  the bare specifier so it isn't swallowed.

## The domain / provider split (important)

**Prefer short names** — no `Provider` suffix. The split lives across the two entry points, so both
the domain and the provider keep the clean name (`Country`, `Currency`, `Language`, `Phone`,
`Locale`); importing the domain from the root never pulls React.

- **Root (`@luwio/<pkg>`) — React-free domain**: `Country` / `Currency` / `Language` (classes with
  static factories `.new` / `.from`), `Phone` (class with `.parse` / `.isValid`), and `Locale`
  (a plain `{ new, resolve, system }` factory object). Private constructors; factories throw on
  invalid input so an instance is always valid. Plus collections (`Countries`…), types, `toMachineName`.
- **`@luwio/<pkg>/react` — React bindings**: the short-named provider (`<Country country={…}>`) +
  `useCountry()` → `{ country }` + `CountryContext`. The provider re-attaches the domain's factory
  (`Country.new = CountryClass.new`), so `import { Country } from '@luwio/country/react'` both builds
  and provides — the file only ever imports one `Country`. `@luwio/locale/react`'s `<Locale>` composes
  `<Country>` + `<Language>` (from their `/react`) under the hood, and re-exports their React bindings.
- Provider memoizes its value on the entity's stable key (`useMemo(() => value, [value.code])`, or
  dial+national for phone). `useX` throws a clear message outside its provider.
- Using both in one file needs an alias (root `Country` class vs `/react` `Country` provider) — but
  usually a file wants one or the other.

## Naming & data

- Dataset/domain fields are **snake_case**: `name`, `machine_name`, `code`, `alpha2`/`alpha3`,
  `dialing_code`, `currency_code`, `minor_units`. Interfaces are `I<Name>`; enums are `PascalCase`.
- `machine_name` = `toMachineName(name)` — NFD, strip diacritics, lowercase, non-alnum → `_`, trim.
  It's the stable, translation-safe key.
- **Datasets are generated**, never hand-edited: `@luwio/iso-data` (private, unpublished) reads
  `src/raw/dataset.json` and `scripts/generate.mjs` writes each package's `src/data/*.json` slice
  plus the English name catalogs. Run `pnpm gen:data` after editing the raw data or the generator.

## Name-translation catalogs

`packages/<pkg>/translations/<pkg>.<locale>.json` = `{ machine_name: name }`, used to localize
names with `@luwio/translations` (`t(entity.machine_name)`).

- Kept **in the package but excluded from `dist`** (via `files: ["dist"]`) — they add nothing to an
  install. The docs site imports them (`apps/docs/src/data/name-catalogs.ts`) and offers them as
  downloads; implementors download and commit them into their own app.
- `<pkg>.en.json` is generated by `pnpm gen:data`; other locales (e.g. `countries.nl.json`) are
  hand-translated with the same `machine_name` keys and left untouched by the generator.

## Docs site (`apps/docs`)

- Every package has a `<Slug>Page.tsx` and an entry in `content.tsx` `PACKAGES`
  (`slug/name/accent/icon/tagline/blurb/gzip/install/status`), routed in `App.tsx` `renderRoute`
  (hash routing: `#/docs/<slug>`).
- Pages use `DocHero`, `InstallBar`, `CodeBlock`, `Callout`, `ApiTable`, `DownloadButton`, and
  `LiveExample` (runs code against the real package — pass every referenced symbol in `scope`).
- The docs depends on each `@luwio/*` in its `package.json` **and** aliases it to `src` in
  `vite.config.ts` (so edits reflect live).

## Gotchas

- CJS-only deps (e.g. `google-libphonenumber`) break named ESM imports in real Node — use a **default
  import + destructure**, and `import type` for the types.
- After a bulk `pnpm --filter "./packages/*" build`, a package with multiple entries (e.g.
  `@luwio/router`'s `vite` plugin) can occasionally come out half-written — rebuild that package
  alone if a consumer can't resolve `dist/*.mjs`.
- Apps use auto ports + `server.open`; `.claude/launch.json` forces fixed ports (via
  `exec vite --port … --strictPort --no-open`) only for the in-editor preview tooling.
