# Luwio

A suite of standalone-but-composable React packages. Each package solves one common
React-app problem, works great on its own, and pairs cleanly with the others — think
TanStack or Symfony components, for React.

## Packages

| Package | What it does |
| --- | --- |
| [`@luwio/locale`](./packages/locale) | Locale / i18n context and hooks |
| [`@luwio/config`](./packages/config) | Typed runtime config provider |
| [`@luwio/storage`](./packages/storage) | Reactive `localStorage`/`sessionStorage` hooks |

Every package is published independently to npm under the `@luwio/*` scope and lists React
only as a **peer dependency** — so you install just the ones you need, and they never fight
over React versions.

## Repository layout

This is a [pnpm](https://pnpm.io) workspace monorepo. Cross-package tasks run via pnpm's
recursive commands (`pnpm -r`); a build orchestrator like
[Turborepo](https://turborepo.dev) or [Nx](https://nx.dev) can be dropped in later for
caching if the suite grows.

```
packages/*      published @luwio/* packages
examples/*      private apps for local dogfooding (never published)
```

## Development

```bash
pnpm install          # install the whole workspace
pnpm dev              # watch-build every package + run the playground
pnpm build            # build every package (dist: ESM + CJS + .d.ts)
pnpm test             # run all tests (Vitest)
pnpm lint             # Biome lint + format check
pnpm typecheck        # tsc --noEmit across packages
```

## Adding a package

Copy any folder in `packages/`, rename it and its `package.json` `name`, then run
`pnpm install`. No other wiring needed.

## Releasing

Versioning and publishing are handled by [Changesets](https://github.com/changesets/changesets)
with **independent** versioning — a package is only bumped and published when it has a
changeset.

```bash
pnpm changeset        # describe your change; pick affected packages + bump type
```

Merging to `main` opens a "Version Packages" PR; merging *that* PR publishes the changed
packages to npm (with provenance) via GitHub Actions.
