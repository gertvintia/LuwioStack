import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Locale } from './locale-provider'
import { useLocale } from './use-locale'

describe('useLocale', () => {
  it('exposes the resolved locale as `current`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale="nl-BE">{children}</Locale>
    )
    const { result } = renderHook(() => useLocale(), { wrapper })
    const { current } = result.current
    // `current.locale` is the same shape `Locale.new()` returns.
    expect(current.locale.code).toBe('nl-BE')
    expect(current.locale.language().code).toBe('nl')
    expect(current.locale.language().name).toBe('Dutch')
    expect(current.locale.country().code).toBe('BE')
    expect(current.locale.country().name).toBe('Belgium')
    expect(current.locale.continent().name).toBe('Europe')
    expect(current.locale.toIntlLocale().language).toBe('nl')
  })

  it('returns a stable `current` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale="nl-BE">{children}</Locale>
    )
    const { result, rerender } = renderHook(() => useLocale(), { wrapper })
    const first = result.current.current
    rerender()
    expect(result.current.current).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/<Locale>/)
  })
})
