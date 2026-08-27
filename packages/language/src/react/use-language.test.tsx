import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { Language } from './language-provider'
import { useLanguage } from './use-language'

const nl = Language.new({ code: 'nl' })

describe('useLanguage', () => {
  it('exposes the provided language as `language`', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Language language={nl}>{children}</Language>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.language.code).toBe('nl')
    expect(result.current.language.name).toBe('Dutch')
  })

  it('returns a stable `language` across renders', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Language language={nl}>{children}</Language>
    )
    const { result, rerender } = renderHook(() => useLanguage(), { wrapper })
    const first = result.current.language
    rerender()
    expect(result.current.language).toBe(first)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useLanguage())).toThrow(/<Language>/)
  })
})
