import { type PropsWithChildren, useMemo } from 'react'
import { Phone as PhoneClass } from '../domain/phone'
import type { IPhone } from '../types'
import { PhoneContext } from './phone-context'

export interface PhoneProps extends PropsWithChildren {
  /** A parsed phone number, e.g. `Phone.parse('+32470123456')`. */
  phone: IPhone
}

/**
 * Provides `phone` to descendants. Read it with {@link usePhone}.
 *
 * `<Phone>` takes an already-parsed {@link IPhone}; the same export carries `Phone.parse` /
 * `Phone.isValid`, so one import from `@luwio/phone/react` both parses and provides. (The React-free
 * domain class lives at `@luwio/phone`.)
 */
export function Phone({ phone, children }: PhoneProps) {
  // Key on the number's identity (dial + national), so a fresh-but-equal Phone passed each render
  // keeps a stable value — safe to use directly in dependency arrays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on identity, not reference
  const value = useMemo(() => phone, [phone.dialCode, phone.nationalNumber])
  return <PhoneContext.Provider value={value}>{children}</PhoneContext.Provider>
}

/** Parse & validate a phone number — the domain factory, surfaced on the provider. */
Phone.parse = PhoneClass.parse
/** Non-throwing validity check — the domain helper, surfaced on the provider. */
Phone.isValid = PhoneClass.isValid
