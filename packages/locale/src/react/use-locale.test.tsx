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
    expect(current.locale.code).toBe('nl-BE')
    expect(current.language.code).toBe('nl')
    expect(current.language.name).toBe('Dutch')
    expect(current.region.code).toBe('BE')
    expect(current.region.name).toBe('Belgium')
    expect(current.intl.language).toBe('nl')
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

  it('resolves gracefully when supported + overrides are given', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale="zz-ZZ" supported={['en-US', 'nl-BE']} overrides={{ '*': 'en-US' }}>
        {children}
      </Locale>
    )
    const { result } = renderHook(() => useLocale(), { wrapper })
    // Unknown 'zz-ZZ' falls back to the '*' catch-all rather than throwing.
    expect(result.current.current.locale.code).toBe('en-US')
  })

  it('keeps a supported locale as-is in resolve mode', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Locale locale="nl-BE" supported={['en-US', 'nl-BE']} overrides={{ '*': 'en-US' }}>
        {children}
      </Locale>
    )
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.current.locale.code).toBe('nl-BE')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/<Locale>/)
  })
})
