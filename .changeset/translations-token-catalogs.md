---
"@luwio/translations": minor
---

Add typed tokens. `add()` accepts a catalog as either flat Lingui messages (`{ help: 'Help' }`, the shape an API returns) or a token map (`{ help: { key: 'help', defaultValue: 'Help' } }`), normalized internally. Define a token map as a local, typed id registry and call `t(tokens.help.key)` instead of magic strings; `t()` also accepts a whole `Token`, using its `defaultValue` as the fallback when the active catalog has no entry for `token.key`. New exports: `Token`, `Tokens`, `Catalog` types and the `toMessages` helper (transform a token map to messages, e.g. to seed the source language).
