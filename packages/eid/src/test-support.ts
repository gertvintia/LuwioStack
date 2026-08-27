// Shared BELPIC test fixtures. Not an entry point, so it never lands in the published dist.
import type { CardReader, CardSession } from './types'

const enc = new TextEncoder()

/** Build a simple-TLV file body from [tag, text] entries. */
export function tlv(entries: [number, string][]): Uint8Array {
  const parts: number[] = []
  for (const [tag, value] of entries) {
    const bytes = enc.encode(value)
    parts.push(tag, bytes.length, ...bytes)
  }
  return Uint8Array.from(parts)
}

const hex2 = (a: Uint8Array): string =>
  Array.from(a.slice(-2), (b) => b.toString(16).padStart(2, '0')).join('')

/** A mock card answering SELECT (by last two path bytes) + READ BINARY (chunked, 0xFF max). */
export function belpicSession(files: Map<string, Uint8Array>): CardSession {
  let selected = ''
  return {
    atr: new Uint8Array([0x3b]),
    transmit(apdu: Uint8Array): Promise<Uint8Array> {
      if (apdu[1] === 0xa4) {
        selected = hex2(apdu)
        return Promise.resolve(Uint8Array.from([0x90, 0x00]))
      }
      if (apdu[1] === 0xb0) {
        const offset = ((apdu[2] ?? 0) << 8) | (apdu[3] ?? 0)
        const le = (apdu[4] ?? 0) === 0 ? 256 : (apdu[4] ?? 0)
        const file = files.get(selected) ?? new Uint8Array()
        if (offset >= file.length) return Promise.resolve(Uint8Array.from([0x6b, 0x00]))
        const chunk = file.slice(offset, offset + le)
        return Promise.resolve(Uint8Array.from([...chunk, 0x90, 0x00]))
      }
      return Promise.resolve(Uint8Array.from([0x6d, 0x00]))
    },
    close: () => Promise.resolve(),
  }
}

/** The canonical demo card: Jan Baptist Specimen, RRN 85073003328 (1985-07-30, male). */
export function standardBelpicFiles(): Map<string, Uint8Array> {
  return new Map<string, Uint8Array>([
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
}

/** A CardReader whose card is the given files (default: the standard demo card). */
export function belpicMockReader(files = standardBelpicFiles()): CardReader {
  return {
    listReaders: () => Promise.resolve(['Mock BELPIC Reader']),
    waitForCard: () => Promise.resolve(belpicSession(files)),
  }
}

/** A mock EstEID card: SELECT succeeds, READ RECORD returns ASCII records (0x6A83 when absent). */
export function estEidSession(records: Map<number, string>): CardSession {
  return {
    atr: new Uint8Array([0x3b, 0xfe]),
    transmit(apdu: Uint8Array): Promise<Uint8Array> {
      if (apdu[1] === 0xa4) return Promise.resolve(Uint8Array.from([0x90, 0x00]))
      if (apdu[1] === 0xb2) {
        const value = records.get(apdu[2] ?? 0)
        if (value === undefined) return Promise.resolve(Uint8Array.from([0x6a, 0x83]))
        return Promise.resolve(Uint8Array.from([...enc.encode(value), 0x90, 0x00]))
      }
      return Promise.resolve(Uint8Array.from([0x6d, 0x00]))
    },
    close: () => Promise.resolve(),
  }
}

/** A canonical Dutch ID-card MRZ (TD1, 3×30): Jan Pieter Specimen, born 1990-01-01, male. */
export function dutchIdMrz(): string {
  const line1 = `I<NLDSPECI2020${1}${'<'.repeat(15)}` // I< NLD  docNo=SPECI2020 check=1  optional
  const line2 = `9001011M3001012NLD${'<'.repeat(11)}8` // DOB 900101 sex M expiry 300101 nat NLD
  const line3 = `SPECIMEN<<JAN<PIETER${'<'.repeat(10)}`
  return line1 + line2 + line3
}

/** Wrap an MRZ string as an eMRTD DG1 file (BER-TLV: 0x61 { 0x5F1F { MRZ } }). */
export function dg1FromMrz(mrz: string): Uint8Array {
  const bytes = enc.encode(mrz)
  const inner = [0x5f, 0x1f, bytes.length, ...bytes]
  return Uint8Array.from([0x61, inner.length, ...inner])
}

/** A mock eMRTD card: SELECT succeeds; READ BINARY returns the given DG1 (chunked). */
export function emrtdSession(dg1: Uint8Array): CardSession {
  return {
    atr: new Uint8Array([0x3b, 0x88]),
    transmit(apdu: Uint8Array): Promise<Uint8Array> {
      if (apdu[1] === 0xa4) return Promise.resolve(Uint8Array.from([0x90, 0x00]))
      if (apdu[1] === 0xb0) {
        const offset = ((apdu[2] ?? 0) << 8) | (apdu[3] ?? 0)
        const le = (apdu[4] ?? 0) === 0 ? 256 : (apdu[4] ?? 0)
        if (offset >= dg1.length) return Promise.resolve(Uint8Array.from([0x6b, 0x00]))
        const chunk = dg1.slice(offset, offset + le)
        return Promise.resolve(Uint8Array.from([...chunk, 0x90, 0x00]))
      }
      return Promise.resolve(Uint8Array.from([0x6d, 0x00]))
    },
    close: () => Promise.resolve(),
  }
}

/** The canonical EstEID demo card: Mari-Liis Tamm. */
export function standardEstEidRecords(): Map<number, string> {
  return new Map<number, string>([
    [1, 'TAMM'], // surname
    [2, 'MARI'], // given names 1
    [3, 'LIIS'], // given names 2
    [4, 'N'], // sex (naine = female)
    [5, 'EST'], // citizenship
    [6, '01.01.1990'], // birth date
    [7, '49001010000'], // personal code (isikukood)
    [8, 'AA0000000'], // document number
    [9, '01.01.2030'], // expiry
    [10, 'TALLINN'], // birth place
  ])
}
