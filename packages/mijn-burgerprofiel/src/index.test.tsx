import { act, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { MijnBurgerprofielProvider, useBurgerprofiel } from './index'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MijnBurgerprofielProvider clientId="test-client">{children}</MijnBurgerprofielProvider>
)

describe('@luwio/mijn-burgerprofiel', () => {
  it('renders the provider with its children', () => {
    const { getByText } = render(
      <MijnBurgerprofielProvider clientId="test-client">
        <span>child</span>
      </MijnBurgerprofielProvider>,
    )
    expect(getByText('child')).toBeTruthy()
  })

  it('starts anonymous with no profile', () => {
    const { result } = renderHook(() => useBurgerprofiel(), { wrapper })
    expect(result.current.status).toBe('anonymous')
    expect(result.current.profile).toBeNull()
  })

  it('moves to loading on signIn', () => {
    const { result } = renderHook(() => useBurgerprofiel(), { wrapper })
    act(() => result.current.signIn())
    expect(result.current.status).toBe('loading')
  })

  it('throws outside a provider', () => {
    expect(() => renderHook(() => useBurgerprofiel())).toThrow(/MijnBurgerprofielProvider/)
  })
})
