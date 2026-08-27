import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Timezone } from './timezone-provider'
import { useTimezone } from './use-timezone'

const brussels = Timezone.new({ name: 'Europe/Brussels' })

describe('useTimezone', () => {
  it('exposes the provided timezone as `timezone`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Timezone timezone={brussels}>{children}</Timezone>
    )
    const { result } = renderHook(() => useTimezone(), { wrapper })
    expect(result.current.timezone.name).toBe('Europe/Brussels')
    expect(result.current.timezone.offset(new Date('2024-01-15T12:00:00Z'))).toBe(60)
  })

  it('returns a stable `timezone` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Timezone timezone={brussels}>{children}</Timezone>
    )
    const { result, rerender } = renderHook(() => useTimezone(), { wrapper })
    const first = result.current.timezone
    rerender()
    expect(result.current.timezone).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useTimezone())).toThrow(/<Timezone>/)
  })
})
