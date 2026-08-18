---
"@luwio/locale": minor
---

Add pluggable data sources. The built-in ISO dataset is now the default of a small registry that
the whole domain layer reads through, so you can replace or extend it with your own data:
`configureDataset(...sources)` sets the active dataset (sources merged left → right, later wins per
`locale`), `defineDataSource(entries)` / `defineDataSource(rows, map)` builds a source from the
interface format or your own shape, `builtinDataSource` exposes the built-in data for composing,
and `resetDataset()` restores it. `getDataset()` reads the active entries.
