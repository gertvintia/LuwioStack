import { Country } from '@luwio/country'
import { NationalId } from '@luwio/national-id'
import { readFile } from '../apdu'
import { IdentityDocument } from '../domain/identity-document'
import { parseSimpleTlv } from '../tlv'
import type { CardProfile, CardSession, Sex } from '../types'

// BELPIC files (full path from the master file). The identity, address and photo files are readable
// with a plain SELECT + READ BINARY — no PIN, no secure channel.
const ID_FILE = [0x3f, 0x00, 0xdf, 0x01, 0x40, 0x31] as const
const ADDRESS_FILE = [0x3f, 0x00, 0xdf, 0x01, 0x40, 0x33] as const
const PHOTO_FILE = [0x3f, 0x00, 0xdf, 0x01, 0x40, 0x35] as const

// TLV tags in the identity file.
const ID = {
  cardNumber: 1,
  validityBegin: 3,
  validityEnd: 4,
  nationalNumber: 6,
  surname: 7,
  givenNames: 8,
  thirdGivenName: 9,
  birthPlace: 11,
  birthDate: 12,
  sex: 13,
} as const

// TLV tags in the address file.
const ADDR = { street: 1, zip: 2, municipality: 3 } as const

const utf8 = new TextDecoder('utf-8')
const text = (tlv: Map<number, Uint8Array>, tag: number): string => {
  const value = tlv.get(tag)
  return value ? utf8.decode(value).trim() : ''
}

// Card date fields are text like "01.09.2020".
function parseCardDate(value: string): Date | null {
  const m = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec(value)
  if (!m) return null
  const date = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])))
  return Number.isNaN(date.getTime()) ? null : date
}

function mapSex(value: string): Sex | null {
  const c = value.trim().charAt(0).toUpperCase()
  if (c === 'M') return 'male'
  if (c === 'F' || c === 'V' || c === 'W') return 'female'
  return null
}

async function readBelpic(session: CardSession): Promise<IdentityDocument> {
  const id = parseSimpleTlv(await readFile(session, ID_FILE))
  const address = parseSimpleTlv(await readFile(session, ADDRESS_FILE))
  const photo = await readFile(session, PHOTO_FILE)

  const nationalNumber = text(id, ID.nationalNumber) || null

  // Prefer the Rijksregisternummer for birth date and sex — it's language-independent and resolves
  // the century unambiguously, unlike the card's localized text fields (which we fall back to).
  let birthDate: Date | null = null
  let sex: Sex | null = null
  if (nationalNumber) {
    try {
      const parsed = NationalId.parse(nationalNumber, Country.new({ code: 'BE' }))
      if (parsed.details.countryCode === 'BE') {
        birthDate = parsed.details.birthDate
        sex = parsed.details.sex
      }
    } catch {
      // invalid RRN on the card — fall back to the card fields below
    }
  }
  if (birthDate === null) birthDate = parseCardDate(text(id, ID.birthDate))
  if (sex === null) sex = mapSex(text(id, ID.sex))

  const givenNames = [text(id, ID.givenNames), text(id, ID.thirdGivenName)]
    .filter(Boolean)
    .join(' ')
    .trim()

  const hasAddress = address.size > 0
  return new IdentityDocument({
    documentType: 'id-card',
    countryCode: 'BE',
    givenNames,
    surname: text(id, ID.surname),
    nationalNumber,
    birthDate,
    birthPlace: text(id, ID.birthPlace) || null,
    sex,
    // The card stores nationality as a localized name; mapping it to an ISO code is a future refinement.
    nationality: null,
    documentNumber: text(id, ID.cardNumber),
    issuedAt: parseCardDate(text(id, ID.validityBegin)),
    expiresAt: parseCardDate(text(id, ID.validityEnd)),
    address: hasAddress
      ? {
          street: text(address, ADDR.street),
          zip: text(address, ADDR.zip),
          municipality: text(address, ADDR.municipality),
          countryCode: 'BE',
        }
      : null,
    photo: photo.length > 0 ? photo : null,
  })
}

// Belgium — BELPIC. Open-read: identity/address/photo via SELECT + READ BINARY, no secret required.
export const be: CardProfile = {
  countryCode: 'BE',
  access: { level: 'open' },
  read: readBelpic,
}
