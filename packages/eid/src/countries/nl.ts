import { IdentityDocument } from '../domain/identity-document'
import { alpha3ToAlpha2, parseMrz, readEmrtdMrz } from '../emrtd'
import { CardAccessError, type CardProfile, type CardSecrets, type CardSession } from '../types'

// The Netherlands has no open-read civic card (identity online is DigiD), but the Dutch ID card and
// passport carry an ICAO eMRTD chip. Its MRZ (DG1) is readable after a BAC/PACE secure channel
// opened from the document's MRZ or CAN — so NL reads via the shared eMRTD parser.
async function readDutchEmrtd(
  session: CardSession,
  secrets?: CardSecrets,
): Promise<IdentityDocument> {
  if (!secrets?.mrz && !secrets?.can) {
    throw new CardAccessError(
      'NL (ICAO eMRTD) needs the document MRZ or CAN to open a secure channel — pass it via secrets',
    )
  }
  // NOTE: a real chip requires BAC/PACE secure messaging derived from the MRZ/CAN before DG1 is
  // readable; that handshake is a future step. The MRZ parsing below runs over a secured session.
  const mrz = parseMrz(await readEmrtdMrz(session))

  return new IdentityDocument({
    documentType: mrz.documentCode.startsWith('P') ? 'passport' : 'id-card',
    countryCode: 'NL',
    givenNames: mrz.givenNames,
    surname: mrz.surname,
    nationalNumber: null, // the eMRTD MRZ carries no BSN
    birthDate: mrz.birthDate,
    birthPlace: null,
    sex: mrz.sex,
    nationality: alpha3ToAlpha2(mrz.nationality),
    documentNumber: mrz.documentNumber,
    issuedAt: null,
    expiresAt: mrz.expiryDate,
    address: null,
    photo: null, // DG2 face-image parsing is a future step
  })
}

// Netherlands — ICAO eMRTD (ID card / passport). Secure channel via the document MRZ.
export const nl: CardProfile = {
  countryCode: 'NL',
  access: { level: 'secure-channel', via: 'mrz' },
  read: readDutchEmrtd,
}
