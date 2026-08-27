---
"@luwio/cli": minor
---

Scaffold apps with runtime locale config as the default pattern. The generated app now fetches its
locale set + default from an API and bootstraps the router from that in `main.tsx`, instead of
hard-coding `locales.ts`. Fetching, ETag caching, and stale-while-revalidate come from the new
`@luwio/bootstrap` (added as a core dependency): `locale-config.ts` is thin wiring over
`createConfigLoader`, and `ConfigUpdateBanner` uses `useConfigUpdate` to surface a "new configuration
available — Reload" nudge when an open tab sees a publish. Also fixes the stale `CreateRouter` call in
the template to the current `createRouter` API.
