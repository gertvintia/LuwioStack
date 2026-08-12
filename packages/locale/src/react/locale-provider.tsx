import { type PropsWithChildren, useMemo } from 'react'
import { Locale } from '../domain/locale'
import type { LocalePolicy } from '../types'
import { LocaleContext } from './locale-context'

export interface LocaleProviderProps extends PropsWithChildren {
  /** A `language-country` string, e.g. `"en-US"`. */
  locale: string
  /** Optional matching policy applied when resolving the locale. */
  policy?: LocalePolicy
}

export function LocaleProvider({ locale, policy, children }: LocaleProviderProps) {
  const value = useMemo(() => Locale.fromLocale({ locale, policy }), [locale, policy])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
