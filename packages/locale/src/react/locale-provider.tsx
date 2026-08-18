import { type PropsWithChildren, useMemo } from 'react'
import { Locale as LocaleClass } from '../domain/locale'
import type { LocaleOverrides, LocalePolicy } from '../types'
import { resolveLocale } from '../utils/resolve-locale'
import { LocaleContext } from './locale-context'

export interface LocaleProps extends PropsWithChildren {
  /** A `language-country` string, e.g. `"en-US"`. */
  locale: string
  /** Optional matching policy applied when resolving the locale. */
  policy?: LocalePolicy
  /**
   * Locales your app supports. When set (together with {@link LocaleProps.overrides}), `locale` is
   * resolved against them exactly like `resolveLocale` — an unsupported or unknown `locale` falls
   * back instead of throwing. Omit both to use `locale` strictly.
   */
  supported?: string[]
  /**
   * Fallback map used when `locale` isn't supported — the same shape as `resolveLocale` overrides,
   * with a required `'*'` catch-all. Only used when {@link LocaleProps.supported} is set.
   */
  overrides?: LocaleOverrides
}

/**
 * Resolves `locale` and provides it to descendants. Read it with {@link useLocale}.
 *
 * By default `locale` is used strictly (an unknown value throws). Pass `supported` + `overrides`
 * to resolve gracefully instead — the provider then behaves like `resolveLocale`.
 */
export function Locale({ locale, policy, supported, overrides, children }: LocaleProps) {
  const value = useMemo(
    () =>
      supported && overrides
        ? resolveLocale({ detected: locale, supported, overrides, policy })
        : LocaleClass.fromLocale({ locale, policy }),
    [locale, policy, supported, overrides],
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
