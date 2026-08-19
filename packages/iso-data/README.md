# @luwio/iso-data

**Internal.** Not published to npm (`private: true`). The single source of truth for Luwio's
ISO 639 (language) and ISO 3166 (country) data.

`src/raw/dataset.json` holds the canonical dataset — 377 language-country combinations, each
embedding a full language and country record. `scripts/generate.mjs` dedups it into the minimal
slice each consuming package bundles at build time:

| Output | Consumed by |
|---|---|
| `packages/language/src/data/languages.json` | `@luwio/language` |
| `packages/country/src/data/countries.json` | `@luwio/country` |

The generated slices are **committed** — treat them as build artifacts, edit the raw dataset
instead. Regenerate from the repo root:

```bash
pnpm gen:data
```

Each published package ships (bundles) its own slice, so nothing reads a file outside its own
`dist` at runtime — this package exists only at build time.
