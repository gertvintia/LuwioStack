# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

To record a change and its release intent, run:

```bash
pnpm changeset
```

Pick the affected `@luwio/*` package(s), choose a bump (patch / minor / major), and write a
short summary. Commit the generated file with your PR. Versioning is **independent** — each
package is only bumped and published when it has a changeset.
