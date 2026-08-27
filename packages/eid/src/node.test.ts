import { describe, expect, it } from 'vitest'
import { nodeCardReader, type PcscliteFactory } from './node'

const tick = () => new Promise((r) => setTimeout(r, 0))

// A hand-rolled event emitter so the fakes need no node:events import.
class Emitter {
  private handlers: Record<string, ((...args: unknown[]) => void)[]> = {}
  on(event: string, cb: (...args: unknown[]) => void): void {
    const list = this.handlers[event] ?? []
    list.push(cb)
    this.handlers[event] = list
  }
  emit(event: string, ...args: unknown[]): void {
    for (const h of this.handlers[event] ?? []) h(...args)
  }
}

class FakeReader extends Emitter {
  state = 0
  readonly SCARD_STATE_PRESENT = 0x20
  readonly SCARD_SHARE_SHARED = 2
  readonly SCARD_LEAVE_CARD = 0
  constructor(
    public name: string,
    private response: Uint8Array,
  ) {
    super()
  }
  connect(_opts: { share_mode: number }, cb: (err: Error | null, protocol: number) => void): void {
    cb(null, 1)
  }
  transmit(
    _data: Uint8Array,
    _len: number,
    _protocol: number,
    cb: (err: Error | null, response: Uint8Array) => void,
  ): void {
    cb(null, this.response)
  }
  disconnect(_disposition: number, cb: (err: Error | null) => void): void {
    cb(null)
  }
}

class FakePcsc extends Emitter {
  closed = false
  close(): void {
    this.closed = true
  }
}

describe('nodeCardReader (PC/SC transport)', () => {
  it('waits for a card, then transmits APDUs over the connected session', async () => {
    const pcsc = new FakePcsc()
    const reader = new FakeReader('ACME CCID Reader 0', Uint8Array.from([0x90, 0x00]))
    const factory: PcscliteFactory = () => pcsc as never

    const session$ = nodeCardReader({ pcsclite: factory }).waitForCard()
    await tick() // let the (async) factory resolve and listeners attach

    pcsc.emit('reader', reader)
    reader.emit('status', { state: reader.SCARD_STATE_PRESENT, atr: Uint8Array.from([0x3b, 0x98]) })

    const session = await session$
    expect(Array.from(session.atr)).toEqual([0x3b, 0x98])

    const response = await session.transmit(Uint8Array.from([0x00, 0xa4, 0x08, 0x0c]))
    expect(Array.from(response)).toEqual([0x90, 0x00])

    await session.close()
    expect(pcsc.closed).toBe(true)
  })

  it('ignores readers whose name does not match readerName', async () => {
    const pcsc = new FakePcsc()
    const factory: PcscliteFactory = () => pcsc as never

    const session$ = nodeCardReader({ pcsclite: factory, readerName: 'Belgium' }).waitForCard()
    await tick()

    const wrong = new FakeReader('Some Other Reader', Uint8Array.from([0x90, 0x00]))
    pcsc.emit('reader', wrong)
    wrong.emit('status', { state: wrong.SCARD_STATE_PRESENT })

    let resolved = false
    void session$.then(() => {
      resolved = true
    })
    await tick()
    expect(resolved).toBe(false) // non-matching reader was skipped

    const right = new FakeReader('Belgium eID Reader', Uint8Array.from([0x90, 0x00]))
    pcsc.emit('reader', right)
    right.emit('status', { state: right.SCARD_STATE_PRESENT })
    await expect(session$).resolves.toBeDefined()
  })

  it('reports a helpful error when the native peer is missing', async () => {
    // No injected factory → tries to import @pokusew/pcsclite, which isn't installed here.
    await expect(nodeCardReader().waitForCard()).rejects.toThrow(/@pokusew\/pcsclite/)
  })
})
