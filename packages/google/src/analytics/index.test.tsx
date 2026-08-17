import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { type ReactNode, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { __resetAnalyticsForTests } from './gtag'
import { GoogleAnalytics, useAnalytics } from './index'

afterEach(() => __resetAnalyticsForTests())

const wrapper =
  (measurementId: string, consent: boolean = true) =>
  ({ children }: { children: ReactNode }) => (
    <GoogleAnalytics measurementId={measurementId} consent={consent}>
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

  it('is a no-op when consent is false (every action)', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-OFF', false) })
    expect(result.current.status).toBe('disabled')
    expect(result.current.enabled).toBe(false)
    act(() => {
      result.current.track('should_not_fire')
      result.current.identify('nope')
      result.current.setUserProperties({ plan: 'pro' })
      result.current.gtag('event', 'raw_should_not_fire')
      result.current.pageview('/secret')
    })
    // Nothing reached dataLayer at all — with consent off the script never even loads.
    expect(dataLayer()).toHaveLength(0)
  })

  it('identify / setUserProperties / raw gtag forward when enabled', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-ON') })
    act(() => {
      result.current.identify('user_123')
      result.current.setUserProperties({ plan: 'pro' })
      result.current.gtag('event', 'raw_event', { ok: true })
    })
    const dl = dataLayer()
    expect(
      dl.some(
        (e) =>
          Array.isArray(e) &&
          e[0] === 'set' &&
          typeof e[1] === 'object' &&
          (e[1] as { user_id?: string }).user_id === 'user_123',
      ),
    ).toBe(true)
    expect(dl.some((e) => Array.isArray(e) && e[0] === 'set' && e[1] === 'user_properties')).toBe(
      true,
    )
    expect(dl.some((e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'raw_event')).toBe(true)
  })

  it('maps boolean consent to granted/denied defaults, before config', () => {
    render(
      <GoogleAnalytics
        measurementId="G-CM"
        consent={{ analytics_storage: false, ad_storage: false }}
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
    const payload = (dl[consentIdx] as unknown[])[2] as Record<string, unknown>
    expect(payload.analytics_storage).toBe('denied')
  })

  it('updateConsent() maps booleans and pushes a consent update', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper: wrapper('G-UPD') })
    act(() => result.current.updateConsent({ analytics_storage: true }))
    const update = dataLayer().find(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update',
    )
    expect(update).toBeTruthy()
    expect(((update as unknown[])[2] as Record<string, unknown>).analytics_storage).toBe('granted')
  })

  it('issues a consent update when the consent prop changes', () => {
    function App() {
      const [granted, setGranted] = useState(false)
      return (
        <GoogleAnalytics measurementId="G-PROP" consent={{ analytics_storage: granted }}>
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
        <GoogleAnalytics measurementId="G-FLIP" consent={consent}>
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
