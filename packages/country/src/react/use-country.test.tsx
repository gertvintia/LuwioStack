import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Country } from './country-provider'
import { useCountry } from './use-country'

const be = Country.new({ code: 'BE' })

describe('useCountry', () => {
  it('exposes the provided country as `country`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Country country={be}>{children}</Country>
    )
    const { result } = renderHook(() => useCountry(), { wrapper })
    expect(result.current.country.code).toBe('BE')
    expect(result.current.country.name).toBe('Belgium')
    expect(result.current.country.continent().name).toBe('Europe')
  })

  it('returns a stable `country` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Country country={be}>{children}</Country>
    )
    const { result, rerender } = renderHook(() => useCountry(), { wrapper })
    const first = result.current.country
    rerender()
    expect(result.current.country).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useCountry())).toThrow(/<Country>/)
  })
})
