import type { NationalIdDetails, NationalIdSpec, Sex } from '../types'

// 15 chars: S YY MM DD CCC OOO KK. Corsica departments 2A/2B become 19/18 for the checksum.
// Key KK = 97 - (first 13 as a number mod 97). First digit encodes sex (odd male, even female).
const NIR = /^[1-8]\d{4}(?:\d{2}|2[AB])\d{6}\d{2}$/
const frParse = (value: string): NationalIdDetails | null => {
  if (value.length !== 15 || !NIR.test(value)) return null
  const numeric = value.slice(0, 13).replace('2A', '19').replace('2B', '18')
  if (!/^\d{13}$/.test(numeric)) return null
  if (97 - (Number(numeric) % 97) !== Number(value.slice(13, 15))) return null
  const sex: Sex = Number(value.slice(0, 1)) % 2 === 1 ? 'male' : 'female'
  return { countryCode: 'FR', sex }
}

export const fr: NationalIdSpec = { parse: frParse }
