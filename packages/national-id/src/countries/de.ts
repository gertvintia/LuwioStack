import type { NationalIdDetails, NationalIdSpec } from '../types'

// Steuerliche Identifikationsnummer: 11 digits, first digit non-zero. Among the first 10 digits
// exactly one digit repeats (2 or 3 times); the 11th is an ISO 7064 MOD 11,10 check digit.
const deParse = (value: string): NationalIdDetails | null => {
  if (!/^[1-9]\d{10}$/.test(value)) return null

  const first10 = value.slice(0, 10)
  const counts = new Map<string, number>()
  for (const c of first10) counts.set(c, (counts.get(c) ?? 0) + 1)
  const repeated = [...counts.values()].filter((n) => n >= 2)
  if (repeated.length !== 1) return null
  const times = repeated[0]
  if (times !== 2 && times !== 3) return null

  let product = 10
  for (const ch of first10) {
    let sum = (Number(ch) + product) % 10
    if (sum === 0) sum = 10
    product = (sum * 2) % 11
  }
  let check = 11 - product
  if (check === 10) check = 0
  if (check !== Number(value.charAt(10))) return null

  return { countryCode: 'DE' }
}

export const de: NationalIdSpec = { parse: deParse }
