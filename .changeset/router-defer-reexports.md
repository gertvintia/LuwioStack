---
"@luwio/router": minor
---

Re-export `Await`, `useAwaited` and `defer` from `@luwio/router` (vendored from TanStack), so
deferred/streamed loader data works without importing `@tanstack/react-router`. A route's `loader`
can return a promise and the component renders through immediately, showing a skeleton only for the
deferred part via `<Await promise={…} fallback={…}>` (or React 19's `use()`). Documented alongside
`pendingComponent` in a new "Loading states & skeletons" section.
