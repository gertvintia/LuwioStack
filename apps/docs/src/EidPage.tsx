import { Country } from '@luwio/country'
import type { CardReader, CardSession } from '@luwio/eid'
import { Eid, useEid } from '@luwio/eid/react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'setup', label: 'Which setup do I need?' },
  { id: 'hardware', label: 'Connect a reader' },
  { id: 'electron', label: 'Electron (recommended)' },
  { id: 'browser', label: 'Plain browser + helper' },
  { id: 'capability', label: 'Capability matrix' },
  { id: 'usage', label: 'Reading a card' },
  { id: 'react-usage', label: 'React hook' },
  { id: 'examples', label: 'Live example' },
  { id: 'api', label: 'API reference' },
]

// ---- A demo BELPIC reader that replays canned bytes (no hardware) — powers the live example. ----
const enc = new TextEncoder()
const tlv = (entries: [number, string][]): Uint8Array => {
  const parts: number[] = []
  for (const [tag, value] of entries) {
    const bytes = enc.encode(value)
    parts.push(tag, bytes.length, ...bytes)
  }
  return Uint8Array.from(parts)
}
const hex2 = (a: Uint8Array): string =>
  Array.from(a.slice(-2), (b) => b.toString(16).padStart(2, '0')).join('')

function demoBelpicReader(): CardReader {
  const files = new Map<string, Uint8Array>([
    [
      '4031',
      tlv([
        [1, '592194100154'],
        [3, '01.09.2020'],
        [4, '01.09.2030'],
        [6, '85073003328'],
        [7, 'Specimen'],
        [8, 'Jan'],
        [9, 'Baptist'],
        [11, 'Bruxelles'],
        [13, 'M'],
      ]),
    ],
    [
      '4033',
      tlv([
        [1, 'Rue de la Loi 16'],
        [2, '1000'],
        [3, 'Bruxelles'],
      ]),
    ],
    ['4035', new Uint8Array(300).fill(0x41)],
  ])
  const session: CardSession = {
    atr: new Uint8Array([0x3b]),
    close: () => Promise.resolve(),
    transmit(apdu) {
      if (apdu[1] === 0xa4) {
        session.__sel = hex2(apdu)
        return Promise.resolve(Uint8Array.from([0x90, 0x00]))
      }
      if (apdu[1] === 0xb0) {
        const off = ((apdu[2] ?? 0) << 8) | (apdu[3] ?? 0)
        const le = (apdu[4] ?? 0) || 256
        const file = files.get(session.__sel ?? '') ?? new Uint8Array()
        if (off >= file.length) return Promise.resolve(Uint8Array.from([0x6b, 0x00]))
        const chunk = file.slice(off, off + le)
        return Promise.resolve(Uint8Array.from([...chunk, 0x90, 0x00]))
      }
      return Promise.resolve(Uint8Array.from([0x6d, 0x00]))
    },
  } as CardSession & { __sel?: string }
  return {
    listReaders: () => Promise.resolve(['Demo BELPIC Reader']),
    waitForCard: () => Promise.resolve(session),
  }
}
const demoReader = demoBelpicReader()

const USAGE_CODE = `import { Eid } from '@luwio/eid'
import { Country } from '@luwio/country'

Eid.supportedCountries()                     // ['BE','DE','EE','ES','FR','IT','NL','PT']
Eid.accessLevel(Country.new({ code: 'BE' })) // { level: 'open' }

// reader is a CardReader — from @luwio/eid/node, a bridge, or a mock.
const card = await Eid.read(reader, Country.new({ code: 'BE' }))
card.givenNames        // 'Jan Baptist'
card.surname           // 'Specimen'
card.nationalNumber    // '85073003328'  (validated: card.nationalId())
card.birthDate         // Date 1985-07-30 (from the RRN — language-independent)
card.sex               // 'male'
card.address           // { street, zip, municipality, countryCode: 'BE' }
card.photo             // Uint8Array (JPEG bytes)
card.isExpired()       // false`

const NODE_CODE = `import { Eid } from '@luwio/eid'
import { nodeCardReader } from '@luwio/eid/node' // Node / Electron
import { Country } from '@luwio/country'

// Needs the optional native peer:  npm i @pokusew/pcsclite
const reader = nodeCardReader()               // talks to the OS PC/SC stack
const card = await Eid.read(reader, Country.new({ code: 'BE' }))
console.log(card.givenNames, card.surname, card.nationalNumber)`

const HARDWARE_CODE = `# 1. Plug a USB smart-card reader (any "CCID"-class reader) into the laptop.
# 2. Insert the eID card.
# 3. Make sure the OS PC/SC service is running:
#    • Windows / macOS — built in, nothing to do.
#    • Linux — install and start pcscd:
sudo apt install pcscd pcsc-tools     # Debian/Ubuntu
sudo systemctl enable --now pcscd
# 4. Verify the reader + card are seen (optional sanity check):
pcsc_scan                              # from pcsc-tools — should list your reader and the card's ATR`

const ELECTRON_INSTALL = `npm i @luwio/eid @pokusew/pcsclite
# @pokusew/pcsclite is a native module — rebuild it for Electron's Node version:
npm i -D @electron/rebuild
npx electron-rebuild -f -w @pokusew/pcsclite`

const ELECTRON_MAIN = `// main.ts — the Electron MAIN process (this is Node, so PC/SC works here)
import { app, BrowserWindow, ipcMain } from 'electron'
import { nodeCardReader } from '@luwio/eid/node'
import { serveEid } from '@luwio/eid/electron'

// Expose the card reader to the renderer over IPC. That's the whole main-process setup.
serveEid(ipcMain, nodeCardReader())

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true, // required — keeps the renderer sandboxed
      nodeIntegration: false,
    },
  })
  win.loadURL('http://localhost:5173') // your Vite/React dev server (or loadFile in prod)
})`

const ELECTRON_PRELOAD = `// preload.ts — runs before your React app, bridges main ↔ renderer
import { contextBridge, ipcRenderer } from 'electron'
import { createEidBridge } from '@luwio/eid/electron'

// Exposes window.eid to your React code. Nothing else leaks in.
contextBridge.exposeInMainWorld('eid', createEidBridge(ipcRenderer))`

const ELECTRON_TYPES = `// global.d.ts — so TypeScript knows about window.eid in your React app
import type { EidBridge } from '@luwio/eid/electron'

declare global {
  interface Window {
    eid: EidBridge
  }
}`

const ELECTRON_RENDERER = `// Scan.tsx — your React component. This is a normal React app!
import { useMemo } from 'react'
import { Eid, useEid } from '@luwio/eid/react'
import { electronCardReader } from '@luwio/eid/electron'
import { Country } from '@luwio/country'

export function App() {
  // window.eid comes from the preload; turn it into a CardReader once.
  const reader = useMemo(() => electronCardReader(window.eid), [])
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
      <button
        disabled={status === 'waiting' || status === 'reading'}
        onClick={() => read(Country.new({ code: 'BE' }))}
      >
        Read Belgian eID
      </button>

      {status === 'waiting' && <p>Insert your card…</p>}
      {status === 'reading' && <p>Reading…</p>}
      {card && <p>Hello, {card.givenNames} {card.surname} — {card.nationalNumber}</p>}
      {error && <p style={{ color: 'crimson' }}>{error.message}</p>}
    </div>
  )
}`

const BROWSER_READER = `// localBridgeReader.ts — a CardReader for a PLAIN web app (normal browser tab).
// It talks to a small native helper running on the user's machine at 127.0.0.1, because a browser
// tab cannot open a USB reader itself. You (or your org) ship that helper; it does the real PC/SC
// and answers these four JSON messages: listReaders, waitForCard, transmit, close.
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

// Then use it exactly like any other reader:
//   <Eid reader={localBridgeReader()}> … </Eid>`

const REACT_CODE = `import { Eid, useEid } from '@luwio/eid/react'
import { nodeCardReader } from '@luwio/eid/node'
import { Country } from '@luwio/country'

function App() {
  return (
    <Eid reader={nodeCardReader()}>
      <Scan />
    </Eid>
  )
}

function Scan() {
  const { status, card, read } = useEid()
  return (
    <div>
      <button onClick={() => read(Country.new({ code: 'BE' }))}>Read card</button>
      <p>status: {status}</p>
      {card && <p>{card.givenNames} {card.surname} — {card.nationalNumber}</p>}
    </div>
  )
}`

// Live: reads a canned Belgian eID through the real BELPIC parser (no hardware).
const EX_MATRIX = `const rows = Eid.supportedCountries().map((code) => {
  const a = Eid.accessLevel(Country.new({ code }))
  return { code, detail: a.level === 'secure-channel' ? a.level + ' (' + a.via + ')' : a.level }
})
render(
  <table>
    <thead><tr><th>Country</th><th>Access level</th></tr></thead>
    <tbody>{rows.map((r) => <tr key={r.code}><td>{r.code}</td><td>{r.detail}</td></tr>)}</tbody>
  </table>
)`

const EX_BELPIC = `function Card() {
  const { status, card, error, read } = useEid()
  return (
    <div>
      <button onClick={() => read(Country.new({ code: 'BE' }))}>Read Belgian eID (demo)</button>
      <p>status: <strong>{status}</strong></p>
      {card && (
        <dl>
          <dt>Name</dt><dd>{card.givenNames} {card.surname}</dd>
          <dt>National number</dt><dd>{card.nationalNumber}</dd>
          <dt>Born</dt><dd>{card.birthDate?.toISOString().slice(0, 10)} ({card.sex})</dd>
          <dt>Address</dt>
          <dd>{card.address?.street}, {card.address?.zip} {card.address?.municipality}</dd>
          <dt>Valid until</dt>
          <dd>{card.expiresAt?.toISOString().slice(0, 10)} {card.isExpired() ? '(expired)' : ''}</dd>
          <dt>Photo</dt><dd>{card.photo?.length} bytes</dd>
        </dl>
      )}
      {error && <p>{error.name}: {error.message}</p>}
    </div>
  )
}

// demoReader replays canned BELPIC bytes; swap for nodeCardReader() with a real reader.
render(<Eid reader={demoReader}><Card /></Eid>)`

export function EidPage() {
  return (
    <DocsLayout slug="eid" sections={SECTIONS}>
      <DocHero slug="eid" />

      <Callout>
        <strong>Three schemes implemented.</strong> Belgium (BELPIC, binary TLV files) and Estonia
        (EstEID, ASCII records) read open, and the Netherlands parses its ICAO eMRTD MRZ (passport /
        ID-card chip) — three very different on-card formats behind the same <code>CardReader</code>{' '}
        abstraction, over the <code>@luwio/eid/node</code> PC/SC transport (with an{' '}
        <code>@luwio/eid/electron</code> IPC bridge). NL still needs the document MRZ/CAN to open
        the BAC/PACE secure channel (that crypto handshake is the next step); the remaining
        countries reject <code>NotImplementedError</code>. The live demo below runs the real BELPIC
        parser over <em>canned</em> data — no hardware required.
      </Callout>

      <p>
        <code>@luwio/eid</code> reads national <strong>eID smartcards</strong> from a physical
        reader. An eID is an ISO 7816 smartcard, so reading it means exchanging APDUs over the OS
        PC/SC stack — which pure browser JS can't do, and which is gated <em>per country</em> by
        crypto and law. So it mirrors <a href="#/docs/national-id">@luwio/national-id</a>: a
        per-country registry where each profile declares how readable its card is and how to parse
        it, over a pluggable <code>CardReader</code> transport, with a <code>&lt;Eid&gt;</code> /{' '}
        <code>useEid</code> pair for React.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/eid" />
      <Callout>
        <code>@luwio/country</code> and <code>@luwio/national-id</code> are dependencies (installed
        automatically). React 18+ is a peer dependency, only for <code>&lt;Eid&gt;</code> /{' '}
        <code>useEid</code>. The PC/SC transport also needs the native{' '}
        <code>@pokusew/pcsclite</code> module — covered in the setup below.
      </Callout>

      <h2 id="setup">Which setup do I need?</h2>
      <Callout>
        <strong>A normal browser tab cannot talk to a USB card reader</strong> — the browser sandbox
        has no access to the OS smartcard (PC/SC) stack, and no npm package can change that. So the
        card is always read by a <em>native</em> process. You have two real options, and this
        package works with both because it's transport-agnostic.
      </Callout>
      <p>Pick the one that matches how your React app ships:</p>
      <ul>
        <li>
          <strong>Electron desktop app (recommended).</strong> Your React app runs inside Electron.
          The reader is driven in Electron's Node <em>main</em> process; your React{' '}
          <em>renderer</em> reads it over a tiny built-in IPC bridge. One app, fully supported today
          by <code>@luwio/eid/node</code> + <code>@luwio/eid/electron</code>.
        </li>
        <li>
          <strong>Plain web app + a local helper.</strong> Your React app runs in an ordinary
          browser tab and talks to a small native helper on the user's machine (
          <code>127.0.0.1</code>) that does the actual PC/SC. You wire up a small{' '}
          <code>CardReader</code> that speaks to it — shown below.
        </li>
      </ul>
      <p>
        Not viable: driving the reader straight from a web page with WebUSB or the Web Smart Card
        API — those are experimental, usually blocked by the OS's own PC/SC driver, and don't work
        across readers. Use one of the two paths above.
      </p>

      <h2 id="hardware">Connect a reader to your laptop</h2>
      <p>Same first step for either setup — get the OS to see the reader and card:</p>
      <CodeBlock code={HARDWARE_CODE} lang="bash" />

      <h2 id="electron">Electron (recommended)</h2>
      <p>Four small pieces — and your React code stays a normal React app.</p>

      <h3>1 · Install</h3>
      <p>
        <code>@pokusew/pcsclite</code> is a native module, so rebuild it for Electron's Node
        version:
      </p>
      <CodeBlock code={ELECTRON_INSTALL} lang="bash" />

      <h3>2 · Main process — expose the reader</h3>
      <p>
        One line does it: <code>serveEid</code> publishes a <code>nodeCardReader()</code> over IPC.
      </p>
      <CodeBlock code={ELECTRON_MAIN} />

      <h3>3 · Preload — bridge it into the browser context</h3>
      <p>
        <code>createEidBridge</code> puts a safe <code>window.eid</code> in your React app (and tell
        TypeScript it's there):
      </p>
      <CodeBlock code={ELECTRON_PRELOAD} />
      <CodeBlock code={ELECTRON_TYPES} />

      <h3>4 · Renderer — your React app</h3>
      <p>
        Turn <code>window.eid</code> into a <code>CardReader</code>, hand it to{' '}
        <code>&lt;Eid&gt;</code>, and read with <code>useEid()</code> — this is the only file you
        touch day to day:
      </p>
      <CodeBlock code={ELECTRON_RENDERER} />
      <Callout>
        Keep <code>contextIsolation: true</code> and <code>nodeIntegration: false</code> — the
        bridge is exactly what makes that safe — and re-run <code>electron-rebuild</code> after
        upgrading Electron.
      </Callout>

      <h2 id="browser">Plain browser + a local helper</h2>
      <p>
        If your app is a normal website, the browser tab reaches a small native helper on{' '}
        <code>127.0.0.1</code> that does the PC/SC. Since <code>CardReader</code> is just an
        interface, you implement one that talks to that helper — here over a WebSocket — then use it
        like any other reader (
        <code>
          &lt;Eid reader={'{'}localBridgeReader(){'}'}&gt;
        </code>
        ):
      </p>
      <CodeBlock code={BROWSER_READER} />
      <Callout>
        You (or your organization) provide the native helper — the same idea as Belgium's official
        eID service or Germany's AusweisApp, which run locally and expose a port the page talks to.
        A ready-made <code>@luwio/eid/bridge</code> (both sides) is on the roadmap; until then the
        reader above is all the browser side needs. Two notes: the helper must allow your site's
        origin, and an <code>https</code> page may still reach <code>ws://127.0.0.1</code> —
        loopback is exempt from mixed-content blocking.
      </Callout>

      <h2 id="capability">Capability matrix</h2>
      <p>
        Which countries can be read, and what each card needs — reported by{' '}
        <code>Eid.accessLevel</code> (generated live):
      </p>
      <LiveExample code={EX_MATRIX} scope={{ Country, Eid }} />
      <p>
        <code>open</code> = readable with no secret (Belgium & Estonia — implemented).{' '}
        <code>secure-channel</code> = needs a CAN/MRZ/PIN first (NL reads its ICAO eMRTD via the
        MRZ; ES/IT/FR/PT via CAN/PIN). <code>authorization-required</code> = closed to third parties
        without a government certificate (DE). <code>online-only</code> = no readable chip at all (a
        future case). The UK has no eID card, so <code>GB</code> is unsupported.
      </p>

      <h2 id="usage">Reading a card</h2>
      <p>
        However you got the <code>reader</code> (Electron, local helper, or a plain Node script),
        reading is the same: <code>Eid.read(reader, country)</code> waits for a card and returns a
        normalized <code>IIdentityDocument</code> (birth date and sex come from the
        Rijksregisternummer via <code>@luwio/national-id</code>). It throws{' '}
        <code>UnsupportedCountryError</code> for a country with no profile.
      </p>
      <CodeBlock code={USAGE_CODE} />
      <p>In a plain Node script or CLI, use the PC/SC reader directly — no Electron needed:</p>
      <CodeBlock code={NODE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Provide a <code>reader</code> via <code>&lt;Eid&gt;</code>, then read cards with{' '}
        <code>useEid</code> — it models the full lifecycle{' '}
        <code>idle → waiting → reading → read</code> (or <code>no-reader</code> / <code>error</code>
        ).
      </p>
      <CodeBlock code={REACT_CODE} />

      <h2 id="examples">Examples</h2>
      <p>
        The real BELPIC parser, driven live against a demo reader that replays canned card bytes (no
        hardware). Click to parse a Belgian eID into a normalized document:
      </p>
      <LiveExample code={EX_BELPIC} scope={{ Country, Eid, useEid, demoReader }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Eid.read(reader, country, options?)',
            desc: 'Wait for a card and read it. Throws UnsupportedCountryError if no profile; unimplemented countries reject NotImplementedError. Belgium and Estonia are implemented.',
          },
          {
            sig: 'Eid.accessLevel(country)',
            desc: 'How readable the card is: { level: "open" | "secure-channel" (via can/mrz/pin) | "authorization-required" | "online-only" }.',
          },
          {
            sig: 'nodeCardReader(options?)',
            desc: 'From @luwio/eid/node — a CardReader over the OS PC/SC stack (needs the native @pokusew/pcsclite peer). Node / Electron main.',
          },
          {
            sig: 'serveEid / createEidBridge / electronCardReader',
            desc: 'From @luwio/eid/electron — host PC/SC in the Electron main process and reach it from the sandboxed renderer over IPC.',
          },
          {
            sig: 'IIdentityDocument',
            desc: 'Normalized read result — givenNames, surname, nationalNumber, birthDate, sex, address, photo, validity, country(), nationalId(), isExpired().',
          },
          {
            sig: 'CardReader / CardSession',
            desc: 'The transport interface an app supplies — listReaders(), waitForCard() → { atr, transmit(apdu), close() }.',
          },
          {
            sig: '<Eid reader={…}> / useEid()',
            desc: 'From @luwio/eid/react — the provider and the hook returning { status, card, error, read, reset }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
