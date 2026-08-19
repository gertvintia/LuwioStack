import { type PropsWithChildren, useMemo } from 'react'
import { Locale as LocaleClass } from '../domain/locale'
import { createLocale } from '../utils/create-locale'
import { LocaleContext } from './locale-context'

export interface LocaleProps extends PropsWithChildren {
  /** A `language-country` string, e.g. `"en-US"`. */
  locale: string
}

/**
 * Resolves `locale` and provides it to descendants. Read it with {@link useLocale}.
 *
 * `<Locale>` expects a locale it can resolve (a known language + known country); to map an
 * untrusted/optional value (e.g. from the router) onto what you support first, run it through
 * `resolveLocale` and pass the result here.
 */
export function Locale({ locale, children }: LocaleProps) {
  const value = useMemo(() => LocaleClass.fromLocale({ locale }), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

/**
 * Build an {@link ILocale} imperatively (outside React) — the same factory the provider uses under
 * the hood, mirroring `Country.new` / `Language.new`.
 *
 * @example
 * Locale.new({ languageOrLocale: 'nl-BE' })
 * Locale.new({ languageOrLocale: 'en', country: 'BE' })
 */
Locale.new = createLocale
