import type { NationalIdDetails, NationalIdSpec } from '../types'

// National Insurance number: two prefix letters + six digits + a suffix letter A-D. No check digit.
// Prefix letters exclude D, F, I, O (2nd only), Q, U, V, plus a handful of disallowed pairs.
const NINO = /^[ABCEGHJ-PRSTW-Z][ABCEGHJ-NPRSTW-Z]\d{6}[A-D]$/
const INVALID_PREFIX = new Set(['BG', 'GB', 'KN', 'NK', 'NT', 'TN', 'ZZ'])

const gbParse = (value: string): NationalIdDetails | null => {
  if (!NINO.test(value)) return null
  if (INVALID_PREFIX.has(value.slice(0, 2))) return null
  return { countryCode: 'GB' }
}

export const gb: NationalIdSpec = { parse: gbParse }
