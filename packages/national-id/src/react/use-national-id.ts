import { useContext } from 'react'
import type { INationalId } from '../types'
import { NationalIdContext } from './national-id-context'

export interface UseNationalIdResult {
  /**
   * The active national ID — the same object `NationalId.parse()` returns:
   * `nationalId.value`, `.countryCode`, `.details` (narrow on `details.countryCode`), `.country()`.
   */
  nationalId: INationalId
}

/**
 * Read the active national ID from context. The provider memoizes on `value`, so it's stable in
 * dependency arrays.
 */
export function useNationalId(): UseNationalIdResult {
  const context = useContext(NationalIdContext)
  if (context === undefined) {
    throw new Error('useNationalId must be used within a <NationalId> provider')
  }
  return { nationalId: context }
}
