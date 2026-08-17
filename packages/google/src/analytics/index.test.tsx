import { act, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { __resetAnalyticsForTests } from './gtag'
import { GoogleAnalyticsProvider, useAnalytics } from './index'

afterEach(() => __resetAnalyticsForTests())

const wrapper =
  (measurementId: string, enabled = true) =>
  ({ children }: { children: ReactNode }) => (
    <GoogleAnalyticsProvider measurementId={measurementId} enabled={enabled}>
      {children}
    </GoogleAnalyticsProvider>
  )

function dataLayer(): unknown[] {
  return ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []) as unknown[]
}

describe('@luwio/google/analytics', () => {
  it('renders the provider with its children', () => {
    const { getByText } = render(
      <GoogleAnalyticsProvider measurementId="G-TEST">
        <span>child</span>
      </GoogleAnalyticsProvider>,
    )
    expect(getByText('child')).toBeTruthy()
  })

  it('throws when the hook is used outside the provider', () => {
    expect(() => renderHook(() => useAnalytics())).toThrow(/GoogleAnalyticsProvider/)
  })

  it('queues events on dataLayer', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-TEST') })
    act(() => result.current.track('sign_up', { method: 'google' }))
    const queued = dataLayer().some(
      (entry) => Array.isArray(entry) && entry[0] === 'event' && entry[1] === 'sign_up',
    )
    expect(queued).toBe(true)
  })

  it('is a no-op when disabled', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-OFF', false) })
    expect(result.current.isDisabled).toBe(true)
    act(() => result.current.track('should_not_fire'))
    const fired = dataLayer().some(
      (entry) => Array.isArray(entry) && entry[1] === 'should_not_fire',
    )
    expect(fired).toBe(false)
  })
})
