import type { NationalIdDetails, NationalIdSpec } from '../types'

// 8 or 9 digits (8 is zero-padded to 9). Passes the "11-test": weighted sum with weights
// 9,8,7,6,5,4,3,2,-1 must be divisible by 11. No birth date or sex is encoded.
const nlParse = (value: string): NationalIdDetails | null => {
  if (!/^\d{8,9}$/.test(value)) return null
  const s = value.padStart(9, '0')
  if (s === '000000000') return null
  const digits = [...s].map(Number)
  const weights = [9, 8, 7, 6, 5, 4, 3, 2, -1]
  const sum = weights.reduce((acc, w, i) => acc + w * (digits[i] ?? 0), 0)
  if (sum % 11 !== 0) return null
  return { countryCode: 'NL' }
}

export const nl: NationalIdSpec = { parse: nlParse }
