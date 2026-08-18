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
    expect(current.locale).toBe('nl-BE')
    expect(current.language_code).toBe('nl')
    expect(current.country_code).toBe('BE')
    expect(current.country.name).toBe('Belgium')
    expect(current.language.name).toBe('Dutch')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/<Locale>/)
  })
})
