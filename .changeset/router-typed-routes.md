---
"@luwio/router": minor
---

Opt-in type safety for routes:

- `createRoute<TParams, TSearch>` now types the `params` / `search` (and `context.locale`) seen by a
  route's `beforeLoad` and `loader`. Defaults to loose records, so existing untyped routes are
  unaffected.
- New augmentable `RouteRegister` interface maps each route `id` to its `params` / `search`. When
  augmented, `href`, `path`, `absolute` and `navigate` check the id, require the right `params`,
  type `query`, and reject unknown ids; left unaugmented, ids stay loose `string`s as before.
