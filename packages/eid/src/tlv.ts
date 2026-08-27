// Belgian eID files use a flat "simple TLV" layout: a 1-byte tag, a 1-byte length, then the value.
// (All identity/address fields fit in a single byte of length; the photo is a separate binary file.)
export function parseSimpleTlv(bytes: Uint8Array): Map<number, Uint8Array> {
  const out = new Map<number, Uint8Array>()
  let i = 0
  while (i + 2 <= bytes.length) {
    const tag = bytes[i] ?? 0
    const len = bytes[i + 1] ?? 0
    if (tag === 0) break // trailing padding
    out.set(tag, bytes.slice(i + 2, i + 2 + len))
    i += 2 + len
  }
  return out
}
