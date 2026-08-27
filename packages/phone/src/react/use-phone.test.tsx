import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Phone } from './phone-provider'
import { usePhone } from './use-phone'

const be = Phone.parse('+32470123456')

describe('usePhone', () => {
  it('exposes the provided phone number as `phone`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <Phone phone={be}>{children}</Phone>
    const { result } = renderHook(() => usePhone(), { wrapper })
    expect(result.current.phone.countryCode).toBe('BE')
    expect(result.current.phone.format()).toBe('+32470123456')
    expect(result.current.phone.country().name).toBe('Belgium')
  })

  it('returns a stable `phone` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <Phone phone={be}>{children}</Phone>
    const { result, rerender } = renderHook(() => usePhone(), { wrapper })
    const first = result.current.phone
    rerender()
    expect(result.current.phone).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => usePhone())).toThrow(/<Phone>/)
  })
})
