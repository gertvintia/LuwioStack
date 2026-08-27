import { type PropsWithChildren, useMemo } from 'react'
import { Currency as CurrencyClass } from '../domain/currency'
import type { ICurrency } from '../types'
import { CurrencyContext } from './currency-context'

export interface CurrencyProps extends PropsWithChildren {
  /** A resolved currency, e.g. `Currency.new({ code: 'EUR' })`. */
  currency: ICurrency
}

/**
 * Provides `currency` to descendants. Read it with {@link useCurrency}.
 *
 * `<Currency>` takes an already-built {@link ICurrency}; the same export carries the `Currency.new`
 * factory, so one import from `@luwio/currency/react` both builds and provides. (The React-free
 * domain class lives at `@luwio/currency`.)
 */
export function Currency({ currency, children }: CurrencyProps) {
  // Key on the currency's code, so a fresh-but-equal ICurrency passed each render keeps a stable
  // identity — safe to use directly in dependency arrays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on code, not identity
  const value = useMemo(() => currency, [currency.code])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

/** Look up a currency by ISO 4217 code — the domain factory, surfaced on the provider. */
Currency.new = CurrencyClass.new
