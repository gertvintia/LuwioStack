import { Country, type ICountry } from '@luwio/country'
import { type INationalId, NationalId } from '@luwio/national-id'
import type { IdentityAddress, IIdentityDocument, Sex } from '../types'

/** Plain parsed fields — what a country profile extracts before wrapping in an IdentityDocument. */
export interface IdentityDocumentFields {
  documentType: IIdentityDocument['documentType']
  countryCode: string
  givenNames: string
  surname: string
  nationalNumber: string | null
  birthDate: Date | null
  birthPlace: string | null
  sex: Sex | null
  nationality: string | null
  documentNumber: string
  issuedAt: Date | null
  expiresAt: Date | null
  address: IdentityAddress | null
  photo: Uint8Array | null
}

/** The normalized identity read from a card. Built by country profiles; consumed by apps. */
export class IdentityDocument implements IIdentityDocument {
  readonly documentType: IIdentityDocument['documentType']
  readonly countryCode: string
  readonly givenNames: string
  readonly surname: string
  readonly nationalNumber: string | null
  readonly birthDate: Date | null
  readonly birthPlace: string | null
  readonly sex: Sex | null
  readonly nationality: string | null
  readonly documentNumber: string
  readonly issuedAt: Date | null
  readonly expiresAt: Date | null
  readonly address: IdentityAddress | null
  readonly photo: Uint8Array | null

  constructor(fields: IdentityDocumentFields) {
    this.documentType = fields.documentType
    this.countryCode = fields.countryCode
    this.givenNames = fields.givenNames
    this.surname = fields.surname
    this.nationalNumber = fields.nationalNumber
    this.birthDate = fields.birthDate
    this.birthPlace = fields.birthPlace
    this.sex = fields.sex
    this.nationality = fields.nationality
    this.documentNumber = fields.documentNumber
    this.issuedAt = fields.issuedAt
    this.expiresAt = fields.expiresAt
    this.address = fields.address
    this.photo = fields.photo
  }

  country(): ICountry {
    return Country.new({ code: this.countryCode })
  }

  nationalId(): INationalId | null {
    if (!this.nationalNumber) return null
    try {
      return NationalId.parse(this.nationalNumber, this.country())
    } catch {
      return null
    }
  }

  isExpired(at: Date = new Date()): boolean {
    return this.expiresAt ? at.getTime() > this.expiresAt.getTime() : false
  }
}
