import { type PropsWithChildren, useMemo } from 'react'
import { NationalId as NationalIdClass } from '../domain/national-id'
import type { INationalId } from '../types'
import { NationalIdContext } from './national-id-context'

export interface NationalIdProps extends PropsWithChildren {
  /** A parsed national ID, e.g. `NationalId.parse('85073003328', Country.new({ code: 'BE' }))`. */
  nationalId: INationalId
}

/**
 * Provides `nationalId` to descendants. Read it with {@link useNationalId}.
 *
 * `<NationalId>` takes an already-parsed {@link INationalId}; the same export carries
 * `NationalId.parse` / `NationalId.isValid` / `NationalId.isSupported` /
 * `NationalId.supportedCountries`, so one import from `@luwio/national-id/react` both parses and
 * provides. (The React-free domain class lives at `@luwio/national-id`.)
 */
export function NationalId({ nationalId, children }: NationalIdProps) {
  // Key on the normalized value, so a fresh-but-equal object passed each render stays stable.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on value, not identity
  const value = useMemo(() => nationalId, [nationalId.value])
  return <NationalIdContext.Provider value={value}>{children}</NationalIdContext.Provider>
}

/** Parse & validate a national ID — the domain factory, surfaced on the provider. */
NationalId.parse = NationalIdClass.parse
/** Non-throwing validity check — the domain helper, surfaced on the provider. */
NationalId.isValid = NationalIdClass.isValid
/** Whether a validator is registered for a country. */
NationalId.isSupported = NationalIdClass.isSupported
/** ISO codes with a registered validator. */
NationalId.supportedCountries = NationalIdClass.supportedCountries
