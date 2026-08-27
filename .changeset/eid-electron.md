---
"@luwio/eid": minor
---

Add the `@luwio/eid/electron` transport for reading eID cards from an Electron renderer.

Since PC/SC only works in Electron's main process (which is Node), this bridges it to the sandboxed renderer over IPC with three dependency-free helpers (Electron's own objects are injected, so no `electron` dependency): `serveEid(ipcMain, reader)` hosts a real `CardReader` (e.g. `nodeCardReader()`) in the main process; `createEidBridge(ipcRenderer)` builds the renderer-facing bridge to expose via `contextBridge` in the preload; and `electronCardReader(bridge)` turns that bridge back into an ordinary `CardReader` for `Eid.read` / `<Eid reader={…}>`. Byte payloads cross IPC as plain number arrays, and a configurable channel prefix lets multiple integrations coexist.
