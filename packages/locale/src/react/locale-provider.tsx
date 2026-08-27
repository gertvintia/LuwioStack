import { Country } from '@luwio/country/react'
import { Language } from '@luwio/language/react'
import { type PropsWithChildren, useMemo } from 'react'
import { SystemLocale } from '../domain/system-locale'
import type { ILocale } from '../types'
import { createLocale } from '../utils/create-locale'
import { resolveLocale } from '../utils/resolve-locale'
import { LocaleContext } from './locale-context'

export interface LocaleProps extends PropsWithChildren {
  /** A resolved locale, e.g. `Locale.new({ languageOrLocale: 'nl-BE' })` or `Locale.resolve(...)`. */
  locale: ILocale
}

/**
 * Provides `locale` to descendants. Read it with {@link useLocale}.
 *
 * `<Locale>` takes an already-built {@link ILocale}; the same export carries `Locale.new` /
 * `Locale.resolve` / `Locale.system`, so one import from `@luwio/locale/react` both builds and
 * provides. (The React-free factory lives at `@luwio/locale`.) It also composes `<Country>` +
 * `<Language>` under the hood, so `useCountry` / `useLanguage` resolve to this locale.
 */
export function Locale({ locale, children }: LocaleProps) {
  // Key on the locale's code, so a fresh-but-equal ILocale passed each render keeps a stable
  // identity — safe to use directly in dependency arrays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on code, not identity
  const value = useMemo(() => locale, [locale.code])
  return (
    <LocaleContext.Provider value={value}>
      <Country country={value.country()}>
        <Language language={value.language()}>{children}</Language>
      </Country>
    </LocaleContext.Provider>
  )
}

/** Build an exact locale — the domain factory, surfaced on the provider. */
Locale.new = createLocale
/** Resolve a detected locale against a supported set — the domain helper, surfaced on the provider. */
Locale.resolve = resolveLocale
/** The runtime's detected locale. */
Locale.system = SystemLocale
