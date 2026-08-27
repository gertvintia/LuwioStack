import type { CardReader, CardSession } from './types'

// Reading a smartcard needs PC/SC, which only runs in Electron's **main** process (Node). This entry
// bridges that to a sandboxed **renderer** over IPC:
//   • main:     serveEid(ipcMain, nodeCardReader())
//   • preload:  contextBridge.exposeInMainWorld('eid', createEidBridge(ipcRenderer))
//   • renderer: electronCardReader(window.eid) → pass to Eid.read / <Eid reader={…}>
//
// Electron's own objects are injected (typed via the minimal shapes below), so this module needs no
// `electron` dependency and is fully testable with fakes.

const DEFAULT_PREFIX = 'eid'
const channel = (prefix: string, name: string): string => `${prefix}:${name}`

/** The renderer-facing bridge, serialization-safe (byte arrays as number[]). */
export interface EidBridge {
  listReaders(): Promise<string[]>
  waitForCard(readerName?: string): Promise<{ id: string; atr: number[] }>
  transmit(id: string, apdu: number[]): Promise<number[]>
  close(id: string): Promise<void>
}

interface IpcMainLike {
  handle(channelName: string, listener: (event: unknown, ...args: never[]) => unknown): void
}
interface IpcRendererLike {
  invoke(channelName: string, ...args: unknown[]): Promise<unknown>
}

export interface ServeEidOptions {
  /** IPC channel prefix; must match the preload's. Default `"eid"`. */
  channelPrefix?: string
}

/**
 * Host a {@link CardReader} in the Electron **main** process over IPC. Pair with
 * {@link createEidBridge} in the preload and {@link electronCardReader} in the renderer.
 */
export function serveEid(
  ipcMain: IpcMainLike,
  reader: CardReader,
  options: ServeEidOptions = {},
): void {
  const prefix = options.channelPrefix ?? DEFAULT_PREFIX
  const sessions = new Map<string, CardSession>()
  let counter = 0

  ipcMain.handle(channel(prefix, 'listReaders'), () => reader.listReaders())

  ipcMain.handle(channel(prefix, 'waitForCard'), async (_event, readerName?: string) => {
    const session = await reader.waitForCard(readerName)
    const id = `eid-${++counter}`
    sessions.set(id, session)
    return { id, atr: Array.from(session.atr) }
  })

  ipcMain.handle(channel(prefix, 'transmit'), async (_event, id: string, apdu: number[]) => {
    const session = sessions.get(id)
    if (!session) throw new Error(`eid: unknown session "${id}"`)
    return Array.from(await session.transmit(Uint8Array.from(apdu)))
  })

  ipcMain.handle(channel(prefix, 'close'), async (_event, id: string) => {
    const session = sessions.get(id)
    if (!session) return
    sessions.delete(id)
    await session.close()
  })
}

/** Build the {@link EidBridge} in the Electron **preload**, to expose via `contextBridge`. */
export function createEidBridge(
  ipcRenderer: IpcRendererLike,
  options: ServeEidOptions = {},
): EidBridge {
  const prefix = options.channelPrefix ?? DEFAULT_PREFIX
  return {
    listReaders: () => ipcRenderer.invoke(channel(prefix, 'listReaders')) as Promise<string[]>,
    waitForCard: (readerName) =>
      ipcRenderer.invoke(channel(prefix, 'waitForCard'), readerName) as Promise<{
        id: string
        atr: number[]
      }>,
    transmit: (id, apdu) =>
      ipcRenderer.invoke(channel(prefix, 'transmit'), id, apdu) as Promise<number[]>,
    close: (id) => ipcRenderer.invoke(channel(prefix, 'close'), id) as Promise<void>,
  }
}

/**
 * A {@link CardReader} for the Electron **renderer**, backed by the {@link EidBridge} exposed from
 * the preload. Pass it to `Eid.read(reader, country)` or `<Eid reader={…}>`.
 */
export function electronCardReader(bridge: EidBridge): CardReader {
  return {
    listReaders: () => bridge.listReaders(),
    async waitForCard(readerName?: string): Promise<CardSession> {
      const { id, atr } = await bridge.waitForCard(readerName)
      return {
        atr: Uint8Array.from(atr),
        transmit: async (apdu) => Uint8Array.from(await bridge.transmit(id, Array.from(apdu))),
        close: () => bridge.close(id),
      }
    },
  }
}
