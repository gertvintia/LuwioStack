# @luwio/router

Typed routing primitives for React.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** The public API is minimal and still taking shape.

## Install

```bash
npm install @luwio/router
```

React 18+ is a peer dependency.

## Usage

```tsx
import { defineRoutes } from '@luwio/router'

export const routes = defineRoutes([
  { path: '/', render: () => <Home /> },
  { path: '/users/:id', render: (params) => <User id={params.id} /> },
])
```

`defineRoutes` is an identity helper today — it preserves the literal types of your route
list. Matching, navigation, and a `<Router>` component are on the roadmap.
