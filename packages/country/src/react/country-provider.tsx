import { type PropsWithChildren, useMemo } from 'react'
import { Country as CountryClass } from '../domain/country'
import type { ICountry } from '../types'
import { CountryContext } from './country-context'

export interface CountryProps extends PropsWithChildren {
  /** A resolved country, e.g. `Country.new({ code: 'BE' })`. */
  country: ICountry
}

/**
 * Provides `country` to descendants. Read it with {@link useCountry}.
 *
 * `<Country>` takes an already-built {@link ICountry}; the same export carries `Country.new` /
 * `Country.from`, so one import from `@luwio/country/react` both builds and provides. (The React-free
 * domain class lives at `@luwio/country`.)
 */
export function Country({ country, children }: CountryProps) {
  // Key on the country's code, so a fresh-but-equal ICountry passed each render keeps a stable
  // identity — safe to use directly in dependency arrays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on code, not identity
  const value = useMemo(() => country, [country.code])
  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
}

/** Look up a country by ISO 3166-1 alpha-2 code — the domain factory, surfaced on the provider. */
Country.new = CountryClass.new
/** Look up by code in an explicit format (alpha-2 / alpha-3 / numeric). */
Country.from = CountryClass.from
