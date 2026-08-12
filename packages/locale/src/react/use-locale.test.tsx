import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from './locale-provider'
import { useLocale } from './use-locale'

describe('useLocale', () => {
  it('exposes the resolved locale from the provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider locale="nl-BE">{children}</LocaleProvider>
    )
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.locale.locale).toBe('nl-BE')
    expect(result.current.language_code).toBe('nl')
    expect(result.current.country_code).toBe('BE')
    expect(result.current.country.name).toBe('Belgium')
    expect(result.current.language.name).toBe('Dutch')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/LocaleProvider/)
  })
})
