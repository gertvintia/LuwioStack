import { type PropsWithChildren, useMemo } from 'react'
import { Locale as LocaleClass } from '../domain/locale'
import type { LocalePolicy } from '../types'
import { LocaleContext } from './locale-context'

export interface LocaleProps extends PropsWithChildren {
  /** A `language-country` string, e.g. `"en-US"`. */
  locale: string
  /** Optional matching policy applied when resolving the locale. */
  policy?: LocalePolicy
}

/** Resolves `locale` and provides it to descendants. Read it with {@link useLocale}. */
export function Locale({ locale, policy, children }: LocaleProps) {
  const value = useMemo(() => LocaleClass.fromLocale({ locale, policy }), [locale, policy])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
