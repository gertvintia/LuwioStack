import type { NationalIdDetails, NationalIdSpec } from '../types'

// NIF: 9 digits, first non-zero. Weighted mod-11 check — weights 9..2 over the first 8 digits,
// check = 11 - (sum mod 11), folded to 0 when it lands on 10 or 11.
const ptParse = (value: string): NationalIdDetails | null => {
  if (!/^[1-9]\d{8}$/.test(value)) return null

  let sum = 0
  for (let i = 0; i < 8; i++) sum += Number(value.charAt(i)) * (9 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (check !== Number(value.charAt(8))) return null

  return { countryCode: 'PT' }
}

export const pt: NationalIdSpec = { parse: ptParse }
