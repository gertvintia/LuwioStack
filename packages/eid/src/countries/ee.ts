import { readRecord, selectFid } from '../apdu'
import { IdentityDocument } from '../domain/identity-document'
import type { CardProfile, CardSession, Sex } from '../types'

// Estonia — EstEID. The personal-data file is readable with no PIN, but unlike Belgium's binary TLV
// files it's a set of fixed-position ASCII *records* read with READ RECORD — a good demonstration
// that the CardReader/CardSession abstraction handles a different on-card scheme.
const MF = 0x3f00
const ESTEID_DF = 0xeeee
const PERSONAL_DATA_EF = 0x5044

// 1-based record numbers in the personal-data file (EstEID 3.x layout).
const REC = {
  surname: 1,
  givenNames1: 2,
  givenNames2: 3,
  sex: 4,
  citizenship: 5,
  birthDate: 6,
  personalCode: 7,
  documentNumber: 8,
  expiry: 9,
  birthPlace: 10,
} as const

const utf8 = new TextDecoder('utf-8')

function parseEstDate(value: string): Date | null {
  const m = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec(value)
  if (!m) return null
  const date = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])))
  return Number.isNaN(date.getTime()) ? null : date
}

function mapSex(value: string): Sex | null {
  const c = value.trim().charAt(0).toUpperCase()
  if (c === 'M') return 'male'
  if (c === 'N' || c === 'F') return 'female' // "N" = naine (female, Estonian)
  return null
}

// ISO 3166-1 alpha-3 → alpha-2 for the citizenships EstEID commonly carries (POC-level mapping).
const ALPHA3_TO_ALPHA2: Record<string, string> = { EST: 'EE' }

async function readEstEid(session: CardSession): Promise<IdentityDocument> {
  await selectFid(session, MF, 0x00) // master file
  await selectFid(session, ESTEID_DF, 0x01) // EstEID application (child DF)
  await selectFid(session, PERSONAL_DATA_EF, 0x02) // personal-data EF

  const rec = async (n: number): Promise<string> => utf8.decode(await readRecord(session, n)).trim()

  const givenNames = [await rec(REC.givenNames1), await rec(REC.givenNames2)]
    .filter(Boolean)
    .join(' ')
    .trim()
  const citizenship = await rec(REC.citizenship)

  return new IdentityDocument({
    documentType: 'id-card',
    countryCode: 'EE',
    givenNames,
    surname: await rec(REC.surname),
    // The Estonian personal code (isikukood) itself encodes birth date and sex, but the card also
    // stores them as explicit records, so we read those directly.
    nationalNumber: (await rec(REC.personalCode)) || null,
    birthDate: parseEstDate(await rec(REC.birthDate)),
    birthPlace: (await rec(REC.birthPlace)) || null,
    sex: mapSex(await rec(REC.sex)),
    nationality: ALPHA3_TO_ALPHA2[citizenship] ?? null,
    documentNumber: await rec(REC.documentNumber),
    issuedAt: null,
    expiresAt: parseEstDate(await rec(REC.expiry)),
    address: null, // the EstEID personal-data file carries no address
    photo: null,
  })
}

// Estonia — EstEID. Open-read personal-data file (records), no secret required.
export const ee: CardProfile = {
  countryCode: 'EE',
  access: { level: 'open' },
  read: readEstEid,
}
