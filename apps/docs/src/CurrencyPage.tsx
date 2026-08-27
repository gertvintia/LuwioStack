import { Currency, useCurrency } from '@luwio/currency/react'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { CURRENCY_CATALOGS } from './data/name-catalogs'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, DownloadButton, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'react-usage', label: 'React' },
  { id: 'localizing', label: 'Localizing names' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const LOCALIZE_CODE = `import { Currencies } from '@luwio/currency'
import { useTranslations } from '@luwio/translations'

// Every currency carries a stable machine_name — use it as the translation key.
// Load the downloaded catalog for the active language (keys are machine_names):
await translations.add(nl, () => import('./locales/currencies.nl.json'))

function CurrencyName({ currency }) {
  const { translations } = useTranslations()
  return <span>{translations.t(currency.machine_name)}</span>  // 'Amerikaanse dollar' in nl
}

// A picker over every currency, names shown in the active language:
function CurrencyPicker() {
  const { translations } = useTranslations()
  return (
    <select>
      {Currencies.all().toArray().map((c) => (
        <option key={c.code} value={c.code}>{translations.t(c.machine_name)}</option>
      ))}
    </select>
  )
}`

/**
 * Download ready `machine_name → name` catalogs shipped in @luwio/currency's `translations/` dir.
 * English is provided; any other locale downloads the English catalog as a template to translate.
 */
function NameCatalogDownloads() {
  const [code, setCode] = useState('nl')
  const safe = code.trim().toLowerCase() || 'xx'
  const en = CURRENCY_CATALOGS.en
  const translated = safe in CURRENCY_CATALOGS
  const localeData = CURRENCY_CATALOGS[safe] ?? en
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <DownloadButton
        filename="currencies.en.json"
        data={en}
        label="Download currencies.en.json (English)"
      />
      <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>or for locale</span>
      <input
        aria-label="Locale code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="nl"
        style={{
          width: 64,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          fontFamily: 'var(--mono)',
          fontSize: 13,
        }}
      />
      <DownloadButton
        filename={`currencies.${safe}.json`}
        data={localeData}
        label={`Download currencies.${safe}.json`}
      />
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {translated ? '✓ provided' : 'template — English values to translate'}
      </span>
    </div>
  )
}

const USAGE_CODE = `import { Currency, Currencies } from '@luwio/currency'

const eur = Currency.new({ code: 'EUR' })  // ISO 4217, case-insensitive
eur.name           // 'Euro'
eur.symbol         // '€'
eur.minor_units    // 2   (0 for JPY, 3 for BHD)
eur.machine_name   // 'euro'

// Unknown codes throw:
Currency.new({ code: 'ZZZ' }) // throws 'Unknown currency: ZZZ'

// Every currency as an immutable, de-duplicated collection:
Currencies.all().toArray().length // every ISO 4217 currency in use`

const REACT_CODE = `import { Currency, useCurrency } from '@luwio/currency/react'

function App() {
  return (
    <Currency currency={Currency.new({ code: 'EUR' })}>   {/* a resolved Currency */}
      <Price amount={19.99} />
    </Currency>
  )
}

function Price({ amount }) {
  const { currency } = useCurrency()
  // currency is the active Currency — the same object Currency.new() returns.
  return <span>{currency.symbol}{amount.toFixed(currency.minor_units)}</span>
}`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the provided
// currency through useCurrency, exactly as an app would.
const EX_REACT = `function Price({ amount }) {
  const { currency } = useCurrency()
  return (
    <p>
      <strong>{currency.name}</strong> — {currency.symbol}{amount.toFixed(currency.minor_units)}{' '}
      ({currency.code}, {currency.minor_units} minor units)
    </p>
  )
}

render(
  <Currency currency={Currency.new({ code: 'JPY' })}>
    <Price amount={1999} />
  </Currency>
)`

// A table of a few currencies straight from the dataset.
const EX_TABLE = `const codes = ['EUR', 'USD', 'JPY', 'GBP', 'BHD', 'INR']

function Table() {
  return (
    <table>
      <tbody>
        {codes.map((code) => {
          const c = Currency.new({ code })
          return (
            <tr key={code}>
              <td>{c.code}</td>
              <td>{c.symbol}</td>
              <td>{c.name}</td>
              <td>{c.minor_units} digits</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

render(<Table />)`

export function CurrencyPage() {
  return (
    <DocsLayout slug="currency" sections={SECTIONS}>
      <DocHero slug="currency" />

      <p>
        <code>@luwio/currency</code> is a typed domain model over the ISO 4217 currency list — each
        currency's <code>code</code>, display <code>name</code>, <code>symbol</code> and{' '}
        <code>minor_units</code> (decimal places). It mirrors{' '}
        <a href="#/docs/country">@luwio/country</a> and{' '}
        <a href="#/docs/language">@luwio/language</a>, and ships its own React coupling: a{' '}
        <code>&lt;Currency&gt;</code> provider and a <code>useCurrency</code> hook.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/currency" />
      <Callout>
        Zero runtime dependencies. React is a peer dependency — needed for{' '}
        <code>&lt;Currency&gt;</code> / <code>useCurrency</code>. Full formatting of amounts lives
        in <code>@luwio/money</code>; this package is the currency data model.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a currency by ISO 4217 <code>code</code> with <code>Currency.new</code> (an unknown
        code throws). <code>minor_units</code> is the number of decimal places — 2 for most, 0 for
        JPY, 3 for BHD — so you can round and format amounts correctly.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Currency&gt;</code> with a resolved currency, then read it
        anywhere below with <code>useCurrency</code> — the same standalone pattern as{' '}
        <code>&lt;Locale&gt;</code> / <code>useLocale</code>. The provider memoizes on{' '}
        <code>code</code>, so the value is stable in dependency arrays.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Currency, useCurrency }} />

      <h2 id="localizing">Localizing currency names</h2>
      <p>
        Every currency has a stable <code>machine_name</code> slug (e.g. <code>us_dollar</code>)
        that never changes across translations — so it makes an ideal{' '}
        <strong>translation key</strong>. Pair it with <code>@luwio/translations</code> and
        translate a currency's name with <code>t(currency.machine_name)</code>.
      </p>
      <CodeBlock code={LOCALIZE_CODE} />
      <p>
        Download a ready catalog of <code>machine_name → name</code> for every currency and drop it
        into your project. English is provided; any other locale downloads the English catalog as a
        template (same keys, English values) to translate. Keys are the currency's{' '}
        <code>machine_name</code>, so a downloaded file works directly with{' '}
        <code>t(currency.machine_name)</code>.
      </p>
      <NameCatalogDownloads />
      <Callout>
        These catalogs live in <code>@luwio/currency</code>'s <code>translations/</code> folder —
        kept with the package but excluded from its published bundle, so they add nothing to your
        install. Download the ones you need and commit them in your app.
      </Callout>

      <h2 id="examples">Examples</h2>
      <p>A handful of currencies resolved straight from the ISO 4217 dataset:</p>
      <LiveExample code={EX_TABLE} scope={{ Currency }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: '<Currency currency={…}>',
            desc: 'Provider taking a resolved Currency (from Currency.new).',
          },
          {
            sig: 'useCurrency()',
            desc: (
              <>
                Returns <code>{'{ currency }'}</code> — the active Currency. Throws outside a{' '}
                <code>&lt;Currency&gt;</code> provider.
              </>
            ),
          },
          { sig: 'Currency.new({ code })', desc: 'Look up by ISO 4217 code (case-insensitive).' },
          {
            sig: 'currency.code / .name / .symbol',
            desc: 'ISO 4217 code, English name, and symbol (e.g. EUR / Euro / €).',
          },
          {
            sig: 'currency.minor_units',
            desc: 'Decimal digits: 2 (EUR), 0 (JPY), 3 (BHD).',
          },
          {
            sig: 'currency.machine_name',
            desc: 'A stable slug of the name (e.g. us_dollar).',
          },
          {
            sig: 'Currencies.all() / .empty().add(…)',
            desc: 'The whole dataset, or an immutable, de-duplicated collection.',
          },
        ]}
      />
    </DocsLayout>
  )
}
