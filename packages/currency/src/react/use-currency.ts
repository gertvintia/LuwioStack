import { useContext } from 'react'
import type { ICurrency } from '../types'
import { CurrencyContext } from './currency-context'

export interface UseCurrencyResult {
  /**
   * The active currency — the same object `Currency.new()` returns. Use it exactly like a
   * `Currency.new(...)` result: `currency.code`, `currency.name`, `currency.symbol`,
   * `currency.minor_units`.
   */
  currency: ICurrency
}

/**
 * Read the active currency from context. `currency` is a full `Currency` (see
 * {@link UseCurrencyResult}).
 *
 * The provider memoizes on `code`, so `currency`'s identity is stable until it changes — safe to use
 * directly in dependency arrays.
 */
export function useCurrency(): UseCurrencyResult {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a <Currency> provider')
  }
  return { currency: context }
}
