import type { NationalIdDetails, NationalIdSpec } from '../types'

// 11 digits: YY MM DD SSS CC. Check digits CC = 97 - (first9 mod 97) for people born before 2000,
// or 97 - ((2_000_000_000 + first9) mod 97) for 2000+. BIS numbers add 20 (sex known at
// registration) or 40 (sex unknown) to the month — the checksum still runs on the raw digits.
const beParse = (value: string): NationalIdDetails | null => {
  if (!/^\d{11}$/.test(value)) return null
  const first9 = Number(value.slice(0, 9))
  const check = Number(value.slice(9, 11))
  const mod = (n: number) => 97 - (n % 97)
  const born2000 = mod(2_000_000_000 + first9) === check
  const born1900 = mod(first9) === check
  if (!born1900 && !born2000) return null

  const rawMonth = Number(value.slice(2, 4))
  const day = Number(value.slice(4, 6))
  const seq = Number(value.slice(6, 9))
  const isBis = rawMonth > 12
  const month = rawMonth > 40 ? rawMonth - 40 : rawMonth > 20 ? rawMonth - 20 : rawMonth

  // Sex is encoded in the sequence parity — reliable for RRN and BIS+20, not for BIS+40 (sex unknown).
  const sexKnown = rawMonth <= 12 || (rawMonth > 20 && rawMonth <= 32)
  const sex = sexKnown ? (seq % 2 === 1 ? 'male' : 'female') : null

  const year = (born2000 ? 2000 : 1900) + Number(value.slice(0, 2))
  let birthDate: Date | null = null
  if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    const d = new Date(Date.UTC(year, month - 1, day))
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day) {
      birthDate = d // null when the birth date is unknown (00/00) or impossible (e.g. Feb 30)
    }
  }
  return { countryCode: 'BE', birthDate, sex, isBis }
}

export const be: NationalIdSpec = { parse: beParse }
