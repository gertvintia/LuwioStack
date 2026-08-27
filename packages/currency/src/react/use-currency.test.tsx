import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Currency } from './currency-provider'
import { useCurrency } from './use-currency'

const eur = Currency.new({ code: 'EUR' })

describe('useCurrency', () => {
  it('exposes the provided currency as `currency`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Currency currency={eur}>{children}</Currency>
    )
    const { result } = renderHook(() => useCurrency(), { wrapper })
    const { currency } = result.current
    expect(currency.code).toBe('EUR')
    expect(currency.name).toBe('Euro')
    expect(currency.symbol).toBe('€')
    expect(currency.minor_units).toBe(2)
  })

  it('returns a stable `currency` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Currency currency={eur}>{children}</Currency>
    )
    const { result, rerender } = renderHook(() => useCurrency(), { wrapper })
    const first = result.current.currency
    rerender()
    expect(result.current.currency).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useCurrency())).toThrow(/<Currency>/)
  })
})
