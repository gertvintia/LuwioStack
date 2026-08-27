# @luwio/eid

A framework for reading national **eID smartcards** from a physical reader — transport-agnostic
domain, a pluggable reader interface, and a per-country card-profile registry, mirroring
`@luwio/national-id`. A `<Eid>` provider and `useEid` hook for React.

> **Status.** Three schemes are implemented over the `@luwio/eid/node` PC/SC transport (with an
> `@luwio/eid/electron` IPC bridge): Belgium (BELPIC, binary TLV files) and Estonia (EstEID, ASCII
> records) read open; the Netherlands parses its ICAO eMRTD MRZ (still needs the MRZ/CAN to open the
> BAC/PACE secure channel — that handshake is the next step). Other countries reject
> `NotImplementedError` for now — the split is stable, so more are additive.

```bash
npm i @luwio/eid
# for the Node / Electron PC/SC transport, also install the native peer:
npm i @pokusew/pcsclite
```

`@luwio/country` and `@luwio/national-id` are dependencies; React 18+ is a peer dependency (only for
the provider / hook); `@pokusew/pcsclite` is an optional native module the app installs for the Node
transport (loaded dynamically).

## Which setup do I need?

**A normal browser tab cannot talk to a USB card reader** — the browser sandbox has no access to the
OS smartcard (PC/SC) stack, and no npm package changes that. The card is always read by a *native*
process. Two options, both supported because the package is transport-agnostic:

- **Electron desktop app (recommended).** Your React app runs inside Electron; the reader is driven
  in Electron's Node *main* process and read from the *renderer* over a built-in IPC bridge. See
  [Electron transport](#electron-transport-luwioeidelectron) — fully supported today.
- **Plain web app + a local helper.** Your React app runs in an ordinary browser tab and talks to a
  small native helper on the user's machine (`127.0.0.1`) that does the PC/SC. You implement a small
  `CardReader` that speaks to it. See [Plain browser + a local helper](#plain-browser--a-local-helper).

Not viable: WebUSB / the Web Smart Card API straight from a web page — experimental, usually blocked
by the OS's own PC/SC driver, and inconsistent across readers.

### Connect a reader to your laptop

Same first step either way — get the OS to see the reader and card:

```bash
# 1. Plug in a USB smart-card reader (any "CCID"-class reader) and insert the eID card.
# 2. PC/SC service:  Windows / macOS have it built in.  On Linux:
sudo apt install pcscd pcsc-tools     # Debian/Ubuntu
sudo systemctl enable --now pcscd
# 3. Sanity check (optional): should list your reader + the card's ATR
pcsc_scan
```

## Why it's built this way

An eID is an ISO 7816 smartcard: reading it means exchanging APDUs over the OS **PC/SC** stack, which
pure browser JS cannot do — a real transport is native (Node/Electron) or a localhost helper the
browser talks to. And readability is gated **per country** by crypto and law, not by library
completeness:

| Country | Card | Access |
| --- | --- | --- |
| **BE** | eID (BELPIC) | `open` — identity/address/photo readable, no PIN — **implemented** |
| **EE** | EstEID | `open` — record-based personal-data file, no PIN — **implemented** |
| **ES** | DNIe 3.0 | `secure-channel` via CAN |
| **IT** | CIE | `secure-channel` via CAN |
| **FR** | CNIe (2021+) | `secure-channel` via CAN |
| **PT** | Cartão de Cidadão | `secure-channel` via PIN |
| **NL** | ID card / passport (ICAO eMRTD) | `secure-channel` via MRZ — **MRZ parsing implemented** (BAC/PACE pending) |
| **DE** | nPA / eID | `authorization-required` — needs a government cert + eID-Server (closed to third parties) |

(The UK has no national eID card, so `GB` is unsupported → `UnsupportedCountryError`.)

## Usage

```ts
import { Eid } from '@luwio/eid'
import { Country } from '@luwio/country'

Eid.supportedCountries()                       // ['BE','DE','EE','ES','FR','IT','NL','PT']
Eid.isSupported(Country.new({ code: 'GB' }))   // false
Eid.accessLevel(Country.new({ code: 'BE' }))   // { level: 'open' }
Eid.accessLevel(Country.new({ code: 'DE' }))   // { level: 'authorization-required' }

// `reader` is a CardReader — from @luwio/eid/node, the Electron bridge, or a mock.
const card = await Eid.read(reader, Country.new({ code: 'BE' }))
card.givenNames      // 'Jan Baptist'
card.surname         // 'Specimen'
card.nationalNumber  // '85073003328'
card.birthDate       // Date 1985-07-30 (from the RRN via @luwio/national-id)
card.sex             // 'male'
card.address         // { street, zip, municipality, countryCode: 'BE' }
card.photo           // Uint8Array (JPEG bytes)
card.country()       // a @luwio/country Country
card.nationalId()    // validated via @luwio/national-id (or null)
card.isExpired()     // false
```

## Node transport (`@luwio/eid/node`)

`nodeCardReader()` is a `CardReader` over the OS **PC/SC** stack via the native `@pokusew/pcsclite`
module — for Node / Electron **main**. Install the peer (`npm i @pokusew/pcsclite`); it's loaded
dynamically, with a clear error if missing.

```ts
import { Eid } from '@luwio/eid'
import { nodeCardReader } from '@luwio/eid/node'
import { Country } from '@luwio/country'

const card = await Eid.read(nodeCardReader(), Country.new({ code: 'BE' }))
```

## Electron transport (`@luwio/eid/electron`)

PC/SC only works in Electron's **main** process; the sandboxed **renderer** reaches it over IPC.
These three helpers take Electron's `ipcMain` / `ipcRenderer` as arguments, so the package needs no
`electron` dependency.

```ts
// main
import { ipcMain } from 'electron'
import { nodeCardReader } from '@luwio/eid/node'
import { serveEid } from '@luwio/eid/electron'
serveEid(ipcMain, nodeCardReader())

// preload
import { contextBridge, ipcRenderer } from 'electron'
import { createEidBridge } from '@luwio/eid/electron'
contextBridge.exposeInMainWorld('eid', createEidBridge(ipcRenderer))

// renderer
import { Eid } from '@luwio/eid'
import { electronCardReader } from '@luwio/eid/electron'
import { Country } from '@luwio/country'
const card = await Eid.read(electronCardReader(window.eid), Country.new({ code: 'BE' }))
```

## Plain browser + a local helper

If your app is a normal website, the browser tab reaches a small native helper on `127.0.0.1` that
does the PC/SC. Since `CardReader` is just an interface, implement one that talks to that helper —
here over a WebSocket — then use it like any other reader (`<Eid reader={localBridgeReader()}>`):

```ts
import type { CardReader } from '@luwio/eid'

export function localBridgeReader(url = 'ws://127.0.0.1:8723'): CardReader {
  const open = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url)
      ws.onopen = () => resolve(ws)
      ws.onerror = () => reject(new Error('eID helper not reachable on ' + url))
    })
  let seq = 0
  const call = (ws: WebSocket, method: string, params: unknown) =>
    new Promise<any>((resolve, reject) => {
      const id = ++seq
      const onMessage = (e: MessageEvent) => {
        const msg = JSON.parse(e.data)
        if (msg.id !== id) return
        ws.removeEventListener('message', onMessage)
        msg.error ? reject(new Error(msg.error)) : resolve(msg.result)
      }
      ws.addEventListener('message', onMessage)
      ws.send(JSON.stringify({ id, method, params }))
    })

  return {
    async listReaders() {
      const ws = await open()
      try {
        return await call(ws, 'listReaders', {})
      } finally {
        ws.close()
      }
    },
    async waitForCard(readerName) {
      const ws = await open()
      const { atr } = await call(ws, 'waitForCard', { readerName })
      return {
        atr: Uint8Array.from(atr),
        transmit: async (apdu) =>
          Uint8Array.from(await call(ws, 'transmit', { apdu: Array.from(apdu) })),
        close: async () => {
          await call(ws, 'close', {})
          ws.close()
        },
      }
    },
  }
}
```

You (or your organization) provide the native helper — the same idea as Belgium's official eID
service or Germany's AusweisApp, which run locally and expose a port the page talks to. A ready-made
`@luwio/eid/bridge` (both sides) is on the roadmap. Notes: the helper must allow your site's origin,
and an `https` page may still reach `ws://127.0.0.1` (loopback is exempt from mixed-content blocking).

## The transport (`CardReader`)

The app supplies a transport implementing `CardReader` — this package only defines the shape, so a
Node PC/SC binding, an Electron bridge, or a mock all plug in the same way:

```ts
interface CardReader {
  listReaders(): Promise<string[]>
  waitForCard(reader?: string): Promise<CardSession>
}
interface CardSession {
  atr: Uint8Array
  transmit(apdu: Uint8Array): Promise<Uint8Array>
  close(): Promise<void>
}
```

## React

```tsx
import { Eid, useEid } from '@luwio/eid/react'
import { Country } from '@luwio/country'

function App({ reader }) {
  return (
    <Eid reader={reader}>
      <Scan />
    </Eid>
  )
}

function Scan() {
  const { status, card, error, read } = useEid()
  return (
    <div>
      <button onClick={() => read(Country.new({ code: 'BE' }))}>Read card</button>
      <p>status: {status}</p>
      {card && <p>{card.givenNames} {card.surname}</p>}
      {error && <p>{error.message}</p>}
    </div>
  )
}
```

`useEid()` returns `{ status, card, error, read, reset }` where `status` moves
`idle → waiting → reading → read` (or `no-reader` / `error`). `Eid` from `@luwio/eid` is the
React-free domain; `@luwio/eid/react` exports the `<Eid>` provider (which also carries `Eid.read` /
`Eid.supportedCountries` / `Eid.isSupported` / `Eid.accessLevel`) and `useEid()` (throws outside a
provider).

## Adding a country

Each country is one file. Implement a `CardProfile` in `src/countries/<code>.ts` — declare its
`access` level and, when the transport work is done, its `read()` — then register it in
`src/registry.ts`. Purely additive, exactly like `@luwio/national-id`.

```ts
// src/countries/xx.ts
import { type CardProfile, NotImplementedError } from '../types'
export const xx: CardProfile = {
  countryCode: 'XX',
  access: { level: 'open' },
  read: () => Promise.reject(new NotImplementedError('XX')),
}
```
