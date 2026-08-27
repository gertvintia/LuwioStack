import type { NationalIdDetails, NationalIdSpec, Sex } from '../types'

// Codice Fiscale: 6 name letters, then encoded birth/comune, then a control letter. The control
// character sums per-position values (an odd table for 1st/3rd/… chars, an even table for the rest)
// mod 26. Numeric fields may be letter-substituted (omocodia), so the format allows A-Z0-9 there.
const CF = /^[A-Z]{6}[A-Z0-9]{2}[A-Z][A-Z0-9]{2}[A-Z][A-Z0-9]{3}[A-Z]$/

const ODD: Record<string, number> = {
  '0': 1,
  '1': 0,
  '2': 5,
  '3': 7,
  '4': 9,
  '5': 13,
  '6': 15,
  '7': 17,
  '8': 19,
  '9': 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
}
const EVEN: Record<string, number> = {}
for (let i = 0; i < 10; i++) EVEN[String(i)] = i
for (let i = 0; i < 26; i++) EVEN[String.fromCharCode(65 + i)] = i

// Omocodia: when a numeric slot is taken, digits are replaced by letters L,M,N,P,Q,R,S,T,U,V → 0-9.
const OMO: Record<string, string> = {
  L: '0',
  M: '1',
  N: '2',
  P: '3',
  Q: '4',
  R: '5',
  S: '6',
  T: '7',
  U: '8',
  V: '9',
}
const deomo = (ch: string): string | undefined => (/\d/.test(ch) ? ch : OMO[ch])

const itParse = (value: string): NationalIdDetails | null => {
  if (!CF.test(value)) return null

  let sum = 0
  for (let i = 0; i < 15; i++) {
    const v = i % 2 === 0 ? ODD[value.charAt(i)] : EVEN[value.charAt(i)]
    if (v === undefined) return null
    sum += v
  }
  if (String.fromCharCode(65 + (sum % 26)) !== value.charAt(15)) return null

  // Sex is in the day field (positions 9-10): day 1-31 for males, day + 40 (41-71) for females.
  // A valid code always carries a day in one of those ranges, so sex is always determined — a day
  // that decodes outside them means the code is malformed.
  const d1 = deomo(value.charAt(9))
  const d2 = deomo(value.charAt(10))
  if (d1 === undefined || d2 === undefined) return null
  const dd = Number(d1 + d2)
  let sex: Sex
  if (dd >= 1 && dd <= 31) sex = 'male'
  else if (dd >= 41 && dd <= 71) sex = 'female'
  else return null

  return { countryCode: 'IT', sex }
}

export const it: NationalIdSpec = { parse: itParse }
