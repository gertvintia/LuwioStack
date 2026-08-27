import { useContext } from 'react'
import type { IPhone } from '../types'
import { PhoneContext } from './phone-context'

export interface UsePhoneResult {
  /**
   * The active phone number — the same object `Phone.parse()` returns. Use it exactly like a
   * `Phone.parse(...)` result: `phone.countryCode`, `phone.dialCode`, `phone.nationalNumber`,
   * `phone.type`, `phone.country()`, `phone.format()`.
   */
  phone: IPhone
}

/**
 * Read the active phone number from context. `phone` is a full `Phone` (see {@link UsePhoneResult}).
 *
 * The provider memoizes on the number's identity, so `phone` is stable until it changes — safe to
 * use directly in dependency arrays.
 */
export function usePhone(): UsePhoneResult {
  const context = useContext(PhoneContext)
  if (context === undefined) {
    throw new Error('usePhone must be used within a <Phone> provider')
  }
  return { phone: context }
}
