import type { NationalIdDetails, NationalIdSpec } from '../types'

// DNI (8 digits + control letter) and NIE (X/Y/Z + 7 digits + letter). The control letter is
// "TRWAGMYFPDXBNJZSQVHLCKE"[number mod 23]; for NIE the leading X/Y/Z becomes 0/1/2.
const CONTROL = 'TRWAGMYFPDXBNJZSQVHLCKE'
const NIE_LEAD: Record<string, string> = { X: '0', Y: '1', Z: '2' }

const esParse = (value: string): NationalIdDetails | null => {
  let numStr: string | undefined
  let letter: string | undefined

  const dni = /^(\d{8})([A-Z])$/.exec(value)
  if (dni) {
    numStr = dni[1]
    letter = dni[2]
  } else {
    const nie = /^([XYZ])(\d{7})([A-Z])$/.exec(value)
    if (nie) {
      numStr = (NIE_LEAD[nie[1] ?? ''] ?? '') + (nie[2] ?? '')
      letter = nie[3]
    }
  }
  if (numStr === undefined || letter === undefined) return null
  if (CONTROL[Number(numStr) % 23] !== letter) return null

  return { countryCode: 'ES' }
}

export const es: NationalIdSpec = { parse: esParse }
