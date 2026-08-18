import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'consent', label: 'Consent-gated tracking' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'consent-mode', label: 'Consent Mode v2' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { useState } from 'react'
import { GoogleAnalytics, useAnalytics } from '@luwio/google-analytics'

function App() {
  // \`consent\` is a single prop: pass a boolean (on/off) or an object of
  // per-category booleans. Wire it to your cookie banner / CMP.
  const [consent, setConsent] = useState(false)
  return (
    <GoogleAnalytics measurementId="G-XXXXXXXXXX" consent={consent}>
      <button onClick={() => setConsent(true)}>Accept analytics</button>
      <SignUpButton />
    </GoogleAnalytics>
  )
}

function SignUpButton() {
  const { track } = useAnalytics()
  // No-op until consent is true — gtag.js isn't even loaded yet.
  return <button onClick={() => track('sign_up', { method: 'google' })}>Sign up</button>
}`

const HOOKS_CODE = `import { useAnalytics, useSuspenseAnalytics } from '@luwio/google-analytics'

// Load state under \`api\` (mirrors useGoogleMaps); actions alongside it.
const { api, track, pageview, identify, setUserProperties } = useAnalytics()
if (api.isError) return <button onClick={api.retry}>Retry</button>

track('purchase', { value: 42, currency: 'EUR' })
identify('u_123')                    // GA4 user_id (null to clear)
setUserProperties({ plan: 'pro' })   // gtag('set', 'user_properties', …)

// Suspense variant — suspends until gtag.js is ready, returns just the actions.
const { track: t } = useSuspenseAnalytics()`

const CONSENT_MODE_CODE = `import { GoogleAnalytics, useAnalytics } from '@luwio/google-analytics'

// Granular consent: pass an object of per-category booleans instead of a bool.
// gtag.js still loads, but storage is gated per Google Consent Mode v2 (booleans
// map to granted/denied). Google sends cookieless pings while denied and models
// the rest — recommended for EEA traffic with Google Ads.
function Root({ consent, children }) {
  return (
    <GoogleAnalytics
      measurementId="G-XXXXXXXXXX"
      consent={{
        ad_storage: consent.ads,
        ad_user_data: consent.ads,
        ad_personalization: consent.ads,
        analytics_storage: consent.analytics,
        wait_for_update: 500,
      }}
    >
      {children}
    </GoogleAnalytics>
  )
}

// Or update imperatively from the hook (e.g. in your banner's onAccept):
const { updateConsent } = useAnalytics()
updateConsent({ analytics_storage: true, ad_storage: true })`

export function GoogleAnalyticsPage() {
  return (
    <DocsLayout slug="google-analytics" sections={SECTIONS}>
      <DocHero slug="google-analytics" />

      <p>
        <code>@luwio/google-analytics</code> loads Google Analytics 4 (gtag.js) once per Measurement
        ID and queues events fired before it's ready. Load state lives under an <code>api</code>{' '}
        object (mirroring <code>useGoogleMaps</code>), with the tracking actions alongside it — plus
        a <code>useSuspenseAnalytics</code> variant that suspends until gtag.js is ready.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/google-analytics" />
      <p>React 18+ is a peer dependency.</p>

      <h2 id="consent">Consent-gated tracking</h2>
      <p>
        A single <code>consent</code> prop controls whether — and how — analytics runs (wire it to
        your own consent banner; consent management is out of scope). Pass <code>false</code> and
        gtag.js is never loaded; <code>track</code>, <code>pageview</code>, <code>identify</code>,{' '}
        <code>setUserProperties</code> and the raw <code>gtag</code> passthrough are all void
        no-ops. Flip it to <code>true</code> and the same calls start sending — no other changes.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="hooks">Hooks</h2>
      <p>
        <code>useAnalytics()</code> returns <code>{'{ api, ...actions }'}</code>;{' '}
        <code>useSuspenseAnalytics()</code> suspends until ready and returns just the actions.
      </p>
      <CodeBlock code={HOOKS_CODE} />

      <h2 id="consent-mode">Consent Mode v2 (granular)</h2>
      <p>
        A boolean <code>consent</code> is enough for analytics-only apps. When you need per-category
        consent — Google Ads, or EEA traffic where Google requires it — pass an{' '}
        <strong>object of per-category booleans</strong>: <code>analytics_storage</code>,{' '}
        <code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code> and the
        storage types. Booleans map to Consent Mode v2 signals, applied as{' '}
        <code>gtag('consent', 'default', …)</code> before config and re-sent as an{' '}
        <code>update</code> whenever they change; or call <code>updateConsent()</code>.
      </p>
      <CodeBlock code={CONSENT_MODE_CODE} />
      <Callout>
        Boolean vs. object: <code>consent={'{false}'}</code> is a hard gate (gtag.js never loads);
        an object keeps it loaded but tells Google what's allowed, so denied traffic still yields
        cookieless pings and modeling. One prop covers both.
      </Callout>

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'GoogleAnalytics',
            desc: 'Loads gtag.js + provides config (measurementId, consent, config, nonce).',
          },
          {
            sig: 'useAnalytics()',
            desc: 'Returns { api, ...actions } — api holds load state; track/pageview/identify/setUserProperties/updateConsent/gtag no-op when consent is off.',
          },
          {
            sig: 'useSuspenseAnalytics()',
            desc: 'Suspense variant → just the actions. Suspends until gtag.js is ready, throws on failure.',
          },
        ]}
      />
    </DocsLayout>
  )
}
