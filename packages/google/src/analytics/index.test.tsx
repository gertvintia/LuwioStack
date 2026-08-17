import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { type ReactNode, useState } from 'react'
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

  it('is a no-op when disabled (track / set / gtag / pageview)', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-OFF', false) })
    expect(result.current.isDisabled).toBe(true)
    expect(result.current.enabled).toBe(false)
    act(() => {
      result.current.track('should_not_fire')
      result.current.set({ user_id: 'nope' })
      result.current.gtag('event', 'raw_should_not_fire')
      result.current.pageview('/secret')
    })
    // Nothing reached dataLayer at all — with consent off the script never even loads.
    expect(dataLayer()).toHaveLength(0)
  })

  it('set() and raw gtag() forward when enabled', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-ON') })
    act(() => {
      result.current.set({ currency: 'EUR' })
      result.current.gtag('event', 'raw_event', { ok: true })
    })
    const dl = dataLayer()
    expect(dl.some((e) => Array.isArray(e) && e[0] === 'set')).toBe(true)
    expect(dl.some((e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'raw_event')).toBe(true)
  })

  it('reacts to consent granted at runtime', () => {
    function TrackButton() {
      const { track, enabled } = useAnalytics()
      return (
        <button type="button" onClick={() => track('cta_click')}>
          {enabled ? 'on' : 'off'}
        </button>
      )
    }
    function App() {
      const [consent, setConsent] = useState(false)
      return (
        <GoogleAnalyticsProvider measurementId="G-FLIP" enabled={consent}>
          <TrackButton />
          <button type="button" onClick={() => setConsent(true)}>
            grant
          </button>
        </GoogleAnalyticsProvider>
      )
    }
    const { getByText } = render(<App />)
    const fired = () => dataLayer().some((e) => Array.isArray(e) && e[1] === 'cta_click')

    // Consent off: the tracking button is a no-op.
    fireEvent.click(getByText('off'))
    expect(fired()).toBe(false)

    // Grant consent, then track — now it fires.
    fireEvent.click(getByText('grant'))
    fireEvent.click(getByText('on'))
    expect(fired()).toBe(true)
  })
})
