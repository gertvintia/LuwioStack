import { useCountry } from '@luwio/country/react'
import { useLanguage } from '@luwio/language/react'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Locale } from './locale-provider'
import { useLocale } from './use-locale'

const nlBE = Locale.new({ languageOrLocale: 'nl-BE' })

describe('useLocale', () => {
  it('exposes the resolved locale as `locale`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale={nlBE}>{children}</Locale>
    )
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.locale.code).toBe('nl-BE')
    expect(result.current.locale.language().name).toBe('Dutch')
    expect(result.current.locale.country().name).toBe('Belgium')
  })

  it('returns a stable `locale` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale={nlBE}>{children}</Locale>
    )
    const { result, rerender } = renderHook(() => useLocale(), { wrapper })
    const first = result.current.locale
    rerender()
    expect(result.current.locale).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/<Locale>/)
  })

  it('also provides the locale country and language under the hood', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale={nlBE}>{children}</Locale>
    )
    const { result } = renderHook(() => ({ ...useCountry(), ...useLanguage() }), { wrapper })
    expect(result.current.country.code).toBe('BE')
    expect(result.current.language.code).toBe('nl')
  })
})
