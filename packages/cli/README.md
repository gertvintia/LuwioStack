# @luwio/cli

Scaffold a Luwio app — the `luwio` command. Dependency-free (Node built-ins only).

## Usage

```bash
# no install needed
pnpm dlx @luwio/cli create my-app
# or: npx @luwio/cli create my-app

cd my-app
pnpm install
pnpm dev
```

## Commands

```
luwio create <directory> [options]
luwio <directory>                 # shorthand for create

  -t, --template <name>   Template to scaffold (default: app)
  -m, --modules <list>    Extra @luwio modules to add (comma-separated); skips the prompt
  -w, --workspace         Use workspace:* for @luwio deps (test inside this monorepo)
  -y, --yes               Accept defaults; don't prompt
  -h, --help              Show help
  -v, --version           Show version
```

Run interactively (no flags) and it prompts for the directory and which optional `@luwio` modules to
add: `config, storage, country, datetime, money, phone, theme, google-maps, google-analytics`.

## Test a generated app inside this monorepo

`--workspace` writes `workspace:*` for the `@luwio/*` deps, so a generated app resolves against the
local packages instead of published versions. Scaffold it into `apps/`, then install from the root:

```bash
luwio create apps/demo --modules config,storage --workspace
pnpm install            # links the workspace:* deps
pnpm --filter demo dev
```

## Templates

- **app** — a locale-routed React app built on `@luwio/router` + `@luwio/locale` +
  `@luwio/translations` (Vite + TanStack Router): one route file per page with translated URL
  segments, a translations layout that loads catalogs per language, a home page, and a language
  switcher.
