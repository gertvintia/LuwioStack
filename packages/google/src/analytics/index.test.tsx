import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { type ReactNode, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { __resetAnalyticsForTests } from './gtag'
import { GoogleAnalytics, useAnalytics } from './index'

afterEach(() => __resetAnalyticsForTests())

const wrapper =
  (measurementId: string, enabled = true) =>
  ({ children }: { children: ReactNode }) => (
    <GoogleAnalytics measurementId={measurementId} enabled={enabled}>
      {children}
    </GoogleAnalytics>
  )

function dataLayer(): unknown[] {
  return ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []) as unknown[]
}

describe('@luwio/google/analytics', () => {
  it('renders the provider with its children', () => {
    const { getByText } = render(
      <GoogleAnalytics measurementId="G-TEST">
        <span>child</span>
      </GoogleAnalytics>,
    )
    expect(getByText('child')).toBeTruthy()
  })

  it('throws when the hook is used outside the provider', () => {
    expect(() => renderHook(() => useAnalytics())).toThrow(/GoogleAnalytics/)
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

  it('applies Consent Mode defaults before the config command', () => {
    render(
      <GoogleAnalytics
        measurementId="G-CM"
        consent={{ analytics_storage: 'denied', ad_storage: 'denied' }}
      >
        <span>x</span>
      </GoogleAnalytics>,
    )
    const dl = dataLayer()
    const consentIdx = dl.findIndex(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'default',
    )
    const configIdx = dl.findIndex((e) => Array.isArray(e) && e[0] === 'config')
    expect(consentIdx).toBeGreaterThanOrEqual(0)
    expect(consentIdx).toBeLessThan(configIdx)
  })

  it('updateConsent() pushes a consent update', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-UPD') })
    act(() => result.current.updateConsent({ analytics_storage: 'granted' }))
    const updated = dataLayer().some(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update',
    )
    expect(updated).toBe(true)
  })

  it('issues a consent update when the consent prop changes', () => {
    function App() {
      const [granted, setGranted] = useState(false)
      return (
        <GoogleAnalytics
          measurementId="G-PROP"
          consent={{ analytics_storage: granted ? 'granted' : 'denied' }}
        >
          <button type="button" onClick={() => setGranted(true)}>
            accept
          </button>
        </GoogleAnalytics>
      )
    }
    const updates = () =>
      dataLayer().filter((e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update')
    const { getByText } = render(<App />)
    expect(updates()).toHaveLength(0) // only the default so far
    fireEvent.click(getByText('accept'))
    expect(updates().length).toBeGreaterThanOrEqual(1)
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
        <GoogleAnalytics measurementId="G-FLIP" enabled={consent}>
          <TrackButton />
          <button type="button" onClick={() => setConsent(true)}>
            grant
          </button>
        </GoogleAnalytics>
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
