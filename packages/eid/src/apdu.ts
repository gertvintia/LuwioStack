import { CardAccessError, type CardSession } from './types'

export const SW_OK = 0x9000

/** The two trailing status bytes of a response, as a 16-bit number (0 if the response is too short). */
export function statusWord(response: Uint8Array): number {
  const n = response.length
  if (n < 2) return 0
  return ((response[n - 2] ?? 0) << 8) | (response[n - 1] ?? 0)
}

/** The response payload without its trailing status word. */
export function responseBody(response: Uint8Array): Uint8Array {
  return response.slice(0, Math.max(0, response.length - 2))
}

// SELECT by path from the master file (P1=0x08), returning no file control info (P2=0x0C).
export async function selectByPath(session: CardSession, path: readonly number[]): Promise<void> {
  const apdu = Uint8Array.from([0x00, 0xa4, 0x08, 0x0c, path.length, ...path])
  const sw = statusWord(await session.transmit(apdu))
  if (sw !== SW_OK) throw new CardAccessError(`SELECT failed (SW=0x${sw.toString(16)})`)
}

// READ BINARY the currently-selected file in full, following the card's length hints and stopping at
// end-of-file (SW 0x6Bxx / 0x6282) or a short read.
export async function readBinary(session: CardSession): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  let offset = 0
  for (;;) {
    const p1 = (offset >> 8) & 0xff
    const p2 = offset & 0xff
    let response = await session.transmit(Uint8Array.from([0x00, 0xb0, p1, p2, 0xff]))
    let sw = statusWord(response)
    if (sw >> 8 === 0x6c) {
      // Wrong Le — the card tells us the exact length in the low byte; retry with it.
      response = await session.transmit(Uint8Array.from([0x00, 0xb0, p1, p2, sw & 0xff]))
      sw = statusWord(response)
    }
    if (sw >> 8 === 0x6b || sw === 0x6282) break // end of file
    if (sw !== SW_OK) throw new CardAccessError(`READ BINARY failed (SW=0x${sw.toString(16)})`)
    const chunk = responseBody(response)
    chunks.push(chunk)
    if (chunk.length < 0xff) break
    offset += chunk.length
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const c of chunks) {
    out.set(c, pos)
    pos += c.length
  }
  return out
}

/** Select a file by path and read it in full. */
export async function readFile(session: CardSession, path: readonly number[]): Promise<Uint8Array> {
  await selectByPath(session, path)
  return readBinary(session)
}

// SELECT an application by its AID (P1=0x04).
export async function selectByAid(session: CardSession, aid: readonly number[]): Promise<void> {
  const apdu = Uint8Array.from([0x00, 0xa4, 0x04, 0x0c, aid.length, ...aid])
  const sw = statusWord(await session.transmit(apdu))
  if (sw !== SW_OK) throw new CardAccessError(`SELECT AID failed (SW=0x${sw.toString(16)})`)
}

// SELECT a file by its 2-byte identifier. `p1` picks the mode: 0x00 = MF, 0x01 = child DF,
// 0x02 = EF under the current DF (ISO 7816-4).
export async function selectFid(session: CardSession, fid: number, p1: number): Promise<void> {
  const apdu = Uint8Array.from([0x00, 0xa4, p1, 0x0c, 0x02, (fid >> 8) & 0xff, fid & 0xff])
  const sw = statusWord(await session.transmit(apdu))
  if (sw !== SW_OK) {
    throw new CardAccessError(`SELECT 0x${fid.toString(16)} failed (SW=0x${sw.toString(16)})`)
  }
}

// READ RECORD `record` (1-based) from the currently-selected EF. Returns an empty array when the
// record doesn't exist (SW 0x6Axx / 0x6Bxx) so callers can stop cleanly.
export async function readRecord(session: CardSession, record: number): Promise<Uint8Array> {
  let response = await session.transmit(Uint8Array.from([0x00, 0xb2, record, 0x04, 0x00]))
  let sw = statusWord(response)
  if (sw >> 8 === 0x6c) {
    response = await session.transmit(Uint8Array.from([0x00, 0xb2, record, 0x04, sw & 0xff]))
    sw = statusWord(response)
  }
  if (sw >> 8 === 0x6a || sw >> 8 === 0x6b) return new Uint8Array() // record not found
  if (sw !== SW_OK) {
    throw new CardAccessError(`READ RECORD ${record} failed (SW=0x${sw.toString(16)})`)
  }
  return responseBody(response)
}
