import type { ICountry } from '@luwio/country'
import type { INationalId, Sex } from '@luwio/national-id'

export type { Sex }

/** A structured residential address as read from a card. */
export interface IdentityAddress {
  street: string
  zip: string
  municipality: string
  countryCode: string
}

/**
 * The normalized result of reading an eID card — the same shape regardless of country or transport.
 * A field is `null` when the card genuinely doesn't carry it, never as a "not parsed" placeholder.
 */
export interface IIdentityDocument {
  /** What kind of document was read. */
  documentType: 'id-card' | 'residence-permit' | 'passport'
  /** Issuing country, ISO 3166-1 alpha-2. */
  countryCode: string
  givenNames: string
  surname: string
  /** National number (e.g. a Belgian Rijksregisternummer); `null` when the card carries none. */
  nationalNumber: string | null
  birthDate: Date | null
  birthPlace: string | null
  sex: Sex | null
  /** Holder's nationality, ISO 3166-1 alpha-2; `null` when not encoded. */
  nationality: string | null
  documentNumber: string
  issuedAt: Date | null
  expiresAt: Date | null
  address: IdentityAddress | null
  /** The holder photo exactly as stored on the card (JPEG / JPEG 2000 bytes); `null` when absent. */
  photo: Uint8Array | null
  /** The issuing country as a `@luwio/country` {@link ICountry}. */
  country(): ICountry
  /** Validate `nationalNumber` via `@luwio/national-id`; `null` when there is none or it's invalid. */
  nationalId(): INationalId | null
  /** Whether the document is expired at `at` (default: now). */
  isExpired(at?: Date): boolean
}

/**
 * How readable a country's card is — the honest, per-country capability level. Reflects crypto/legal
 * reality, not library completeness: some cards are open, some need a secret to open a secure
 * channel, some are closed to third parties, some have no readable card at all.
 */
export type CardAccess =
  | { level: 'open' }
  | { level: 'secure-channel'; via: 'can' | 'mrz' | 'pin' }
  | { level: 'authorization-required' }
  | { level: 'online-only' }

/** Secrets a secure-channel card may require before it releases data. */
export interface CardSecrets {
  /** Card Access Number (printed on the card). */
  can?: string
  /** Machine-readable zone (from the document's MRZ). */
  mrz?: string
  /** Card PIN. */
  pin?: string
}

/** Options for a read. */
export interface EidReadOptions {
  /** Secrets for a secure-channel card. */
  secrets?: CardSecrets
  /** Called once a card is present (after `waitForCard`), before reading starts. */
  onCardPresent?: (session: CardSession) => void
}

/**
 * A live connection to a card in a reader. Implemented by a transport (e.g. a future
 * `@luwio/eid/node` PC/SC binding or `@luwio/eid/bridge` localhost client) — never in this package.
 */
export interface CardSession {
  /** The card's Answer To Reset. */
  atr: Uint8Array
  /** Send one APDU command and resolve with the raw response bytes. */
  transmit(apdu: Uint8Array): Promise<Uint8Array>
  /** Release the card/reader. */
  close(): Promise<void>
}

/** The pluggable hardware transport. Apps supply an implementation; this package defines the shape. */
export interface CardReader {
  /** Names of the connected readers. */
  listReaders(): Promise<string[]>
  /** Resolve once a card is present in `reader` (or any reader), yielding a session. */
  waitForCard(reader?: string): Promise<CardSession>
}

/**
 * A per-country card plug-in. Add a country by adding one of these under `countries/<code>.ts` and
 * registering it — purely additive, mirroring `@luwio/national-id`.
 */
export interface CardProfile {
  countryCode: string
  /** How readable this country's card is. */
  access: CardAccess
  /** Optional ATR byte patterns that identify this card. */
  atrHints?: Uint8Array[]
  /**
   * Turn a live card into the normalized model. Not implemented in the framework skeleton — country
   * profiles throw {@link NotImplementedError} until the real APDU/parse work is added.
   */
  read(session: CardSession, secrets?: CardSecrets): Promise<IIdentityDocument>
}

/** Thrown when no card profile is registered for a country — distinct from an unreadable card. */
export class UnsupportedCountryError extends Error {
  public readonly countryCode: string
  constructor(countryCode: string) {
    super(`eID is not supported for country: ${countryCode}`)
    this.name = 'UnsupportedCountryError'
    this.countryCode = countryCode
  }
}

/** Thrown by a registered profile whose card-reading isn't implemented yet. */
export class NotImplementedError extends Error {
  public readonly countryCode: string
  constructor(countryCode: string, detail?: string) {
    super(
      `eID card reading is not yet implemented for ${countryCode}${detail ? `: ${detail}` : ''}`,
    )
    this.name = 'NotImplementedError'
    this.countryCode = countryCode
  }
}

/** Thrown when a card needs a secret or a secure channel could not be established. */
export class CardAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CardAccessError'
  }
}
