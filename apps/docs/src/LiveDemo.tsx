import { createConfig } from '@luwio/config'
import { Locale, useLocale } from '@luwio/locale'
import { useLocalStorage } from '@luwio/storage'

// @luwio/config — typed runtime config, defined once.
const { ConfigProvider, useConfigValue } = createConfig({
  appName: 'Luwio Demo',
})

const LOCALES = ['nl-BE', 'en-US', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'pt-BR', 'zh-CN']

/** Turn an ISO 3166 alpha-2 code into its flag emoji. */
function flagOf(alpha2: string): string {
  return alpha2.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

function DemoWindow({
  current,
  onChange,
}: {
  current: string
  onChange: (locale: string) => void
}) {
  const appName = useConfigValue('appName') // @luwio/config
  const { current: active } = useLocale() // @luwio/locale
  const [count, setCount] = useLocalStorage('luwio:demo:count', 0) // @luwio/storage

  return (
    <div className="window">
      <div className="window-bar">
        <span className="b" />
        <span className="b" />
        <span className="b" />
        <span className="t">{appName}</span>
      </div>
      <div className="window-body">
        <div className="field">
          <span className="label">Locale (@luwio/locale)</span>
          <select className="sel" value={current} onChange={(e) => onChange(e.target.value)}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="label">Country</span>
          <span className="value">
            <span className="flag">{flagOf(active.country.code)}</span> {active.country.name}
          </span>
        </div>
        <div className="field">
          <span className="label">Language</span>
          <span className="value">{active.language.name}</span>
        </div>
        <div className="field">
          <span className="label">Dialing code</span>
          <span className="value">{active.country.direct_dialing_code}</span>
        </div>
        <div className="field">
          <span className="label">ISO codes</span>
          <span className="value">
            {active.locale.code} · {active.country.alpha3} · {active.country.numeric}
          </span>
        </div>
        <div className="field">
          <span className="label">Persisted count (@luwio/storage)</span>
          <span className="counter">
            <button type="button" onClick={() => setCount((n) => n - 1)} aria-label="decrement">
              −
            </button>
            <span className="value">{count}</span>
            <button type="button" onClick={() => setCount((n) => n + 1)} aria-label="increment">
              +
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

export function LiveDemo() {
  // The chosen locale is itself persisted with @luwio/storage — reload and it sticks.
  const [locale, setLocale] = useLocalStorage('luwio:demo:locale', 'nl-BE')

  return (
    <ConfigProvider>
      <Locale locale={locale}>
        <DemoWindow current={locale} onChange={setLocale} />
      </Locale>
    </ConfigProvider>
  )
}
