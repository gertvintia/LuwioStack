import { readBinary, selectByAid, selectFid } from './apdu'
import { CardAccessError, type CardSession, type Sex } from './types'

// ICAO Doc 9303 eMRTD (passports and eID cards). The chip exposes the holder's data as Data Groups;
// DG1 holds the MRZ. This module reads DG1 and parses the MRZ — reusable by any eMRTD-based country
// (NL, and later FR/ES/IT passports). Reading DG1 on a real chip requires a BAC/PACE secure channel
// (derived from the MRZ or CAN) — that secure-messaging handshake is a separate, future step; this
// parser runs over an already-secured session.

const EMRTD_AID = [0xa0, 0x00, 0x00, 0x02, 0x47, 0x10, 0x01] as const
const EF_DG1 = 0x0101

export interface MrzData {
  documentCode: string
  issuingCountry: string // ISO 3166-1 alpha-3
  documentNumber: string
  nationality: string // ISO 3166-1 alpha-3
  birthDate: Date | null
  sex: Sex | null
  expiryDate: Date | null
  surname: string
  givenNames: string
}

const ALPHA3_TO_ALPHA2: Record<string, string> = {
  NLD: 'NL',
  BEL: 'BE',
  DEU: 'DE',
  FRA: 'FR',
  ESP: 'ES',
  ITA: 'IT',
  PRT: 'PT',
  EST: 'EE',
  GBR: 'GB',
  LUX: 'LU',
}

/** Best-effort ISO 3166-1 alpha-3 → alpha-2 for the nationalities eMRTDs commonly carry. */
export function alpha3ToAlpha2(alpha3: string): string | null {
  return ALPHA3_TO_ALPHA2[alpha3.toUpperCase()] ?? null
}

/** Select the eMRTD application, read EF.DG1 and return the raw MRZ string. */
export async function readEmrtdMrz(session: CardSession): Promise<string> {
  await selectByAid(session, EMRTD_AID)
  await selectFid(session, EF_DG1, 0x02)
  return extractMrz(await readBinary(session))
}

// DG1 is BER-TLV: 0x61 { 0x5F1F { MRZ } }. Pull out the MRZ (tag 5F1F) directly.
function extractMrz(dg1: Uint8Array): string {
  for (let i = 0; i + 2 < dg1.length; i++) {
    if (dg1[i] === 0x5f && dg1[i + 1] === 0x1f) {
      const len = dg1[i + 2] ?? 0
      return new TextDecoder('utf-8').decode(dg1.slice(i + 3, i + 3 + len))
    }
  }
  throw new CardAccessError('eMRTD: MRZ (DG1 tag 5F1F) not found')
}

function mapSex(char: string): Sex | null {
  const c = char.trim().toUpperCase()
  if (c === 'M') return 'male'
  if (c === 'F') return 'female'
  return null
}

// MRZ dates are YYMMDD with no century. Expiry is always 20xx; birth date picks the century so it
// isn't in the future.
function mrzDate(yymmdd: string, isExpiry: boolean): Date | null {
  if (!/^\d{6}$/.test(yymmdd)) return null
  const yy = Number(yymmdd.slice(0, 2))
  const mm = Number(yymmdd.slice(2, 4))
  const dd = Number(yymmdd.slice(4, 6))
  const year = isExpiry
    ? 2000 + yy
    : 2000 + yy > new Date().getUTCFullYear()
      ? 1900 + yy
      : 2000 + yy
  const date = new Date(Date.UTC(year, mm - 1, dd))
  return date.getUTCMonth() === mm - 1 && date.getUTCDate() === dd ? date : null
}

function parseName(field: string): { surname: string; givenNames: string } {
  const [primary = '', secondary = ''] = field.split('<<')
  const clean = (s: string) => s.replace(/</g, ' ').trim().replace(/\s+/g, ' ')
  return { surname: clean(primary), givenNames: clean(secondary) }
}

/** Parse a raw MRZ (TD1 3×30, TD2 2×36 or TD3 2×44) into structured fields. */
export function parseMrz(mrz: string): MrzData {
  const s = mrz.replace(/\n/g, '')
  if (s.length === 90) return parseTd1(s)
  if (s.length === 72) return parseTd2(s)
  if (s.length === 88) return parseTd3(s)
  throw new CardAccessError(`eMRTD: unrecognized MRZ length ${s.length}`)
}

const code = (v: string) => v.replace(/</g, '')

// TD1 — ID cards (3 lines of 30).
function parseTd1(s: string): MrzData {
  const l1 = s.slice(0, 30)
  const l2 = s.slice(30, 60)
  const l3 = s.slice(60, 90)
  return {
    documentCode: code(l1.slice(0, 2)),
    issuingCountry: code(l1.slice(2, 5)),
    documentNumber: code(l1.slice(5, 14)),
    birthDate: mrzDate(l2.slice(0, 6), false),
    sex: mapSex(l2.charAt(7)),
    expiryDate: mrzDate(l2.slice(8, 14), true),
    nationality: code(l2.slice(15, 18)),
    ...parseName(l3),
  }
}

// TD2 — 2 lines of 36.
function parseTd2(s: string): MrzData {
  const l1 = s.slice(0, 36)
  const l2 = s.slice(36, 72)
  return {
    documentCode: code(l1.slice(0, 2)),
    issuingCountry: code(l1.slice(2, 5)),
    ...parseName(l1.slice(5, 36)),
    documentNumber: code(l2.slice(0, 9)),
    nationality: code(l2.slice(10, 13)),
    birthDate: mrzDate(l2.slice(13, 19), false),
    sex: mapSex(l2.charAt(20)),
    expiryDate: mrzDate(l2.slice(21, 27), true),
  }
}

// TD3 — passports (2 lines of 44).
function parseTd3(s: string): MrzData {
  const l1 = s.slice(0, 44)
  const l2 = s.slice(44, 88)
  return {
    documentCode: code(l1.slice(0, 2)),
    issuingCountry: code(l1.slice(2, 5)),
    ...parseName(l1.slice(5, 44)),
    documentNumber: code(l2.slice(0, 9)),
    nationality: code(l2.slice(10, 13)),
    birthDate: mrzDate(l2.slice(13, 19), false),
    sex: mapSex(l2.charAt(20)),
    expiryDate: mrzDate(l2.slice(21, 27), true),
  }
}
