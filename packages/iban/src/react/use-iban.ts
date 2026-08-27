import { useContext } from 'react'
import type { IIban } from '../types'
import { IbanContext } from './iban-context'

export interface UseIbanResult {
  /**
   * The active IBAN — the same object `Iban.parse()` returns. Use it like a `Iban.parse(...)` result:
   * `iban.value`, `iban.countryCode`, `iban.bban`, `iban.country()`, `iban.format()`.
   */
  iban: IIban
}

/**
 * Read the active IBAN from context. `iban` is a full `Iban` (see {@link UseIbanResult}). The
 * provider memoizes on `value`, so it's stable in dependency arrays.
 */
export function useIban(): UseIbanResult {
  const context = useContext(IbanContext)
  if (context === undefined) {
    throw new Error('useIban must be used within a <Iban> provider')
  }
  return { iban: context }
}
