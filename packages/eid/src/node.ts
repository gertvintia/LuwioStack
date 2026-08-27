import { CardAccessError, type CardReader, type CardSession } from './types'

// Node's Buffer, typed minimally so this Node-only entry needs no @types/node dependency.
declare const Buffer: { from(data: Uint8Array): Uint8Array }

// The subset of the @pokusew/pcsclite API we depend on, typed locally (an optional native module,
// installed by the app — see the README — and loaded dynamically).
interface PcscReader {
  name: string
  state: number
  SCARD_STATE_PRESENT: number
  SCARD_SHARE_SHARED: number
  SCARD_LEAVE_CARD: number
  on(event: 'status', cb: (status: { state: number; atr?: Uint8Array }) => void): void
  on(event: 'error', cb: (err: Error) => void): void
  on(event: 'end', cb: () => void): void
  connect(options: { share_mode: number }, cb: (err: Error | null, protocol: number) => void): void
  transmit(
    data: Uint8Array,
    responseMaxLength: number,
    protocol: number,
    cb: (err: Error | null, response: Uint8Array) => void,
  ): void
  disconnect(disposition: number, cb: (err: Error | null) => void): void
}
interface PcscInstance {
  on(event: 'reader', cb: (reader: PcscReader) => void): void
  on(event: 'error', cb: (err: Error) => void): void
  close(): void
}

/** Factory matching `@pokusew/pcsclite`'s default export; injectable for testing. */
export type PcscliteFactory = () => PcscInstance

export interface NodeCardReaderOptions {
  /** Only use a reader whose name contains this string. Default: the first reader with a card. */
  readerName?: string
  /** Inject the pcsclite factory (used in tests). Default: the optional `@pokusew/pcsclite` peer. */
  pcsclite?: PcscliteFactory
}

async function loadPcsclite(): Promise<PcscliteFactory> {
  try {
    // A variable specifier keeps bundlers from resolving this optional native module at build time;
    // the app installs it (see the README) and it's loaded here at runtime.
    const specifier = '@pokusew/pcsclite'
    const mod = await import(specifier)
    return (mod.default ?? mod) as unknown as PcscliteFactory
  } catch {
    throw new CardAccessError(
      '@luwio/eid/node needs the optional peer dependency "@pokusew/pcsclite". Install it with: npm i @pokusew/pcsclite',
    )
  }
}

/**
 * A {@link CardReader} backed by the OS **PC/SC** stack via the native `@pokusew/pcsclite` module —
 * for Node / Electron. Pass it to `Eid.read(reader, country)` or `<Eid reader={…}>`.
 *
 * ```ts
 * import { Eid } from '@luwio/eid'
 * import { nodeCardReader } from '@luwio/eid/node'
 * import { Country } from '@luwio/country'
 *
 * const card = await Eid.read(nodeCardReader(), Country.new({ code: 'BE' }))
 * ```
 */
export function nodeCardReader(options: NodeCardReaderOptions = {}): CardReader {
  const factory = async (): Promise<PcscliteFactory> => options.pcsclite ?? (await loadPcsclite())

  return {
    async listReaders(): Promise<string[]> {
      const create = await factory()
      return new Promise((resolve, reject) => {
        const pcsc = create()
        const names: string[] = []
        pcsc.on('error', reject)
        pcsc.on('reader', (reader) => names.push(reader.name))
        setTimeout(() => {
          pcsc.close()
          resolve(names)
        }, 300)
      })
    },

    async waitForCard(readerName = options.readerName): Promise<CardSession> {
      const create = await factory()
      return new Promise((resolve, reject) => {
        const pcsc = create()
        pcsc.on('error', reject)
        pcsc.on('reader', (reader) => {
          if (readerName && !reader.name.includes(readerName)) return
          reader.on('error', reject)
          reader.on('status', (status) => {
            const present = (status.state & reader.SCARD_STATE_PRESENT) !== 0
            const changed = ((reader.state ^ status.state) & reader.SCARD_STATE_PRESENT) !== 0
            if (!present || !changed) return
            reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
              if (err) return reject(err)
              resolve({
                atr: status.atr ? Uint8Array.from(status.atr) : new Uint8Array(),
                transmit: (apdu) =>
                  new Promise((res, rej) => {
                    reader.transmit(Buffer.from(apdu), 0x10000, protocol, (e, response) =>
                      e ? rej(e) : res(Uint8Array.from(response)),
                    )
                  }),
                close: () =>
                  new Promise((res) => {
                    reader.disconnect(reader.SCARD_LEAVE_CARD, () => {
                      pcsc.close()
                      res()
                    })
                  }),
              })
            })
          })
        })
      })
    },
  }
}
