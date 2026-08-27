import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Iban } from './iban-provider'
import { useIban } from './use-iban'

const be = Iban.parse('BE68539007547034')

describe('useIban', () => {
  it('exposes the provided IBAN as `iban`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <Iban iban={be}>{children}</Iban>
    const { result } = renderHook(() => useIban(), { wrapper })
    expect(result.current.iban.countryCode).toBe('BE')
    expect(result.current.iban.format()).toBe('BE68 5390 0754 7034')
    expect(result.current.iban.country().name).toBe('Belgium')
  })

  it('returns a stable `iban` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <Iban iban={be}>{children}</Iban>
    const { result, rerender } = renderHook(() => useIban(), { wrapper })
    const first = result.current.iban
    rerender()
    expect(result.current.iban).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useIban())).toThrow(/<Iban>/)
  })
})
