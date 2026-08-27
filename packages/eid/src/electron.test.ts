import { Country } from '@luwio/country'
import { describe, expect, it } from 'vitest'
import { Eid } from './domain/eid'
import { createEidBridge, electronCardReader, serveEid } from './electron'
import { belpicMockReader } from './test-support'

// An in-memory IPC pair: ipcRenderer.invoke(ch, …) calls the ipcMain.handle(ch) listener.
function fakeIpc() {
  const handlers = new Map<string, (event: unknown, ...args: never[]) => unknown>()
  return {
    ipcMain: {
      handle(channelName: string, listener: (event: unknown, ...args: never[]) => unknown) {
        handlers.set(channelName, listener)
      },
    },
    ipcRenderer: {
      async invoke(channelName: string, ...args: unknown[]): Promise<unknown> {
        const handler = handlers.get(channelName)
        if (!handler) throw new Error(`no handler for ${channelName}`)
        return handler({}, ...(args as never[]))
      },
    },
  }
}

describe('@luwio/eid/electron', () => {
  it('reads a BELPIC card across the main↔renderer IPC bridge', async () => {
    const { ipcMain, ipcRenderer } = fakeIpc()

    // Main process: host the real PC/SC-style reader (here, a canned BELPIC mock).
    serveEid(ipcMain, belpicMockReader())

    // Preload + renderer: bridge over IPC, then use it as an ordinary CardReader.
    const bridge = createEidBridge(ipcRenderer)
    const reader = electronCardReader(bridge)

    expect(await reader.listReaders()).toEqual(['Mock BELPIC Reader'])

    const card = await Eid.read(reader, Country.new({ code: 'BE' }))
    expect(card.givenNames).toBe('Jan Baptist')
    expect(card.surname).toBe('Specimen')
    expect(card.nationalNumber).toBe('85073003328')
    expect(card.sex).toBe('male')
    expect(card.photo?.length).toBe(300) // byte arrays survive the IPC round-trip
  })

  it('honors a matching channel prefix on both sides (and mismatches fail)', async () => {
    const { ipcMain, ipcRenderer } = fakeIpc()
    serveEid(ipcMain, belpicMockReader(), { channelPrefix: 'myapp-eid' })

    const matched = electronCardReader(createEidBridge(ipcRenderer, { channelPrefix: 'myapp-eid' }))
    expect((await matched.waitForCard()).atr.length).toBeGreaterThan(0)

    const mismatched = electronCardReader(createEidBridge(ipcRenderer)) // default prefix
    await expect(mismatched.waitForCard()).rejects.toThrow(/no handler/)
  })
})
