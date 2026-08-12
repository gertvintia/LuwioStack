# @luwio/google

Helpers for loading and using Google web SDKs (Maps, Identity, Analytics, …).

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** Starts with one-time script loading; typed SDK wrappers to follow.

## Install

```bash
npm install @luwio/google
```

No framework dependency — works anywhere with a DOM.

## Usage

```ts
import { loadGoogleScript } from '@luwio/google'

await loadGoogleScript(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}`)
// window.google.maps is now available
```

Calling `loadGoogleScript` again with the same URL reuses the in-flight/loaded promise, so
the script is only injected once.
