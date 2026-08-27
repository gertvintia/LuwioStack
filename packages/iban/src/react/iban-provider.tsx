import { type PropsWithChildren, useMemo } from 'react'
import { Iban as IbanClass } from '../domain/iban'
import type { IIban } from '../types'
import { IbanContext } from './iban-context'

export interface IbanProps extends PropsWithChildren {
  /** A parsed IBAN, e.g. `Iban.parse('BE68539007547034')`. */
  iban: IIban
}

/**
 * Provides `iban` to descendants. Read it with {@link useIban}.
 *
 * `<Iban>` takes an already-parsed {@link IIban}; the same export carries `Iban.parse` /
 * `Iban.isValid`, so one import from `@luwio/iban/react` both parses and provides. (The React-free
 * domain class lives at `@luwio/iban`.)
 */
export function Iban({ iban, children }: IbanProps) {
  // Key on the canonical value, so a fresh-but-equal IIban passed each render stays stable.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on value, not identity
  const value = useMemo(() => iban, [iban.value])
  return <IbanContext.Provider value={value}>{children}</IbanContext.Provider>
}

/** Parse & validate an IBAN — the domain factory, surfaced on the provider. */
Iban.parse = IbanClass.parse
/** Non-throwing validity check — the domain helper, surfaced on the provider. */
Iban.isValid = IbanClass.isValid
