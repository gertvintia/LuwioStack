import { useContext } from 'react'
import type { ICountry } from '../types'
import { CountryContext } from './country-context'

export interface UseCountryResult {
  /**
   * The active country — the same object `Country.new()` returns. Use it exactly like a
   * `Country.new(...)` result: `country.code`, `country.name`, `country.currency_code`,
   * `country.languages()`, `country.continent()`.
   */
  country: ICountry
}

/**
 * Read the active country from context. `country` is a full `Country` (see
 * {@link UseCountryResult}).
 *
 * Works inside a `<Country>` provider, or inside `<Locale>` (which provides the locale's country
 * under the hood). The provider memoizes on `code`, so `country`'s identity is stable until it
 * changes — safe to use directly in dependency arrays.
 */
export function useCountry(): UseCountryResult {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a <Country> (or <Locale>) provider')
  }
  return { country: context }
}
