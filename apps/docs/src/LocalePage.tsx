import { Continent, Locale, useLocale } from '@luwio/locale'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'react-usage', label: 'React usage' },
  { id: 'domain-model', label: 'Domain model' },
  { id: 'resolution', label: 'Locale resolution' },
  { id: 'examples', label: 'Examples' },
  { id: 'routing', label: 'Locale routing' },
  { id: 'api', label: 'API reference' },
]

const REACT_CODE = `import { Locale, useLocale } from '@luwio/locale'

function App() {
  return (
    <Locale locale="nl-BE">   {/* the 'language-country' string */}
      <Info />
    </Locale>
  )
}

function Info() {
  const { current } = useLocale()
  // current.locale is the active Locale — the same object Locale.new() returns.
  return (
    <p>
      {current.locale.language().name} in {current.locale.country().name} ({current.locale.code})
      — dial {current.locale.country().direct_dialing_code}
    </p>
  )
}`

const DOMAIN_CODE = `// Country/Language/Continent are re-exported from @luwio/country + @luwio/language,
// so you can import them straight from @luwio/locale — or from their own packages.
import { Locale, Country, Language, Continent } from '@luwio/locale'

const locale = Locale.new({ languageOrLocale: 'nl-BE' })
locale.language().name        // 'Dutch'
locale.country().alpha3       // 'BEL'
locale.country().borders()    // Countries → FR, DE, LU, NL
locale.continent().name       // 'Europe'

Country.new({ code: 'BE' }).direct_dialing_code   // '+32'
Country.new({ code: 'BE' }).currency_code         // 'EUR'  (formatting → @luwio/money)
Country.new({ code: 'BE' }).continent().code      // 'EU'
Language.new({ code: 'nl' }).name                 // 'Dutch'
Continent.new({ code: 'EU' }).name                // 'Europe'
Continent.europe().countries().size               // European countries`

const RESOLVE_CODE = `import { Locale } from '@luwio/locale'

const locale = Locale.resolve({
  detected: Locale.system,                // the runtime's locale
  supported: ['nl-BE', 'fr-FR', 'en-US'],
  overrides: {
    'en-*': 'en-US',                       // any English → en-US
    '*': 'nl-BE',                          // catch-all (required)
  },
})`

const VALIDITY_CODE = `import { Locale } from '@luwio/locale'

// A locale is valid when its language and country are each known — there's no
// "must be a listed pair" check. 'en-BE' works even though it isn't a common pairing:
Locale.new({ languageOrLocale: 'nl-BE' })              // 'nl-BE'
Locale.new({ languageOrLocale: 'en', country: 'BE' })  // 'en-BE'

// An unknown language or country throws (fail fast):
Locale.new({ languageOrLocale: 'zz', country: 'BE' })  // 'zz' isn't a language → throws
Locale.new({ languageOrLocale: 'nl', country: 'ZZ' })  // 'ZZ' isn't a country  → throws`

// Live snippets run in noInline mode: each ends with render(<…/>). They avoid
// template literals so they can live inside these template-string constants.

const EX_SWITCHER = `const SUPPORTED = ['en-US', 'nl-BE', 'fr-FR', 'de-DE', 'ja-JP']

function Info() {
  // useLocale() has no setter — switching is driven by the parent's state.
  const { current } = useLocale()
  return (
    <p>{current.locale.language().name} · {current.locale.country().name} · dial {current.locale.country().direct_dialing_code}</p>
  )
}

function Switcher() {
  const [locale, setLocale] = useState('nl-BE')
  return (
    <Locale locale={locale}>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {SUPPORTED.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
      <Info />
    </Locale>
  )
}

render(<Switcher />)`

const EX_PHONE = `// Real European countries, each labelled with its dialing code.
const options = Continent.europe()
  .countries()
  .toArray()
  .map((c) => ({ value: c.alpha2, label: c.name + ' (' + c.direct_dialing_code + ')' }))
  .sort((a, b) => a.label.localeCompare(b.label))

render(
  <select size={6} style={{ minWidth: 260, padding: 4 }}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>,
)`

const EX_RESOLVE = `// Collapse the runtime's locale onto the ones this app supports.
const active = Locale.resolve({
  detected: Locale.system,
  supported: ['en-US', 'nl-BE', 'fr-FR'],
  overrides: { 'nl-*': 'nl-BE', '*': 'en-US' },
})

render(
  <p>
    Detected <code>{Locale.system.locale}</code> → resolved <strong>{active.locale}</strong>
  </p>,
)`

const EX_COUNTRY = `const flag = (a) =>
  a.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))

function Badge() {
  const { current } = useLocale()
  const country = current.locale.country()
  const spoken = country.languages().toArray().map((l) => l.name)
  return (
    <div>
      <strong>{flag(country.code)} {country.name}</strong>
      <div>Spoken: {spoken.join(', ')}</div>
    </div>
  )
}

render(
  <Locale locale="nl-BE">
    <Badge />
  </Locale>,
)`

const ROUTER_CODE = `import { Locale } from '@luwio/locale'
import { useRouteLocale } from '@luwio/router'

const SUPPORTED = ['nl-BE', 'fr-FR', 'en-US']
const OVERRIDES = { 'en-*': 'en-US', '*': 'nl-BE' } // '*' catch-all → default

function App() {
  // The router always returns a locale: the one in the URL, or its own
  // configured default when the URL has none — so this never sees null.
  const { locale } = useRouteLocale()

  // Resolve it onto what you support — an unsupported '/pt-PT' falls to '*' → default.
  const active = Locale.resolve({ detected: locale, supported: SUPPORTED, overrides: OVERRIDES })
  return (
    <Locale locale={active.locale}>
      <Site />
    </Locale>
  )
}`

export function LocalePage() {
  return (
    <DocsLayout slug="locale" sections={SECTIONS}>
      <DocHero slug="locale" />

      <p>
        <code>@luwio/locale</code> ties a <em>language</em> and a <em>country</em> together into an
        active locale. It composes <a href="#/docs/country">@luwio/country</a> and{' '}
        <a href="#/docs/language">@luwio/language</a> (installed automatically), so a locale is
        valid whenever its language and country are each known. Resolve a locale, inspect the
        country and language behind it, and expose the active locale through a provider and hook —
        the domain layer works with or without React.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/locale" />
      <p>
        React 18+ is a peer dependency. The domain and utility exports have no React dependency.
      </p>

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap your tree in <code>Locale</code> with a <code>language-country</code> string, then read
        the resolved locale anywhere with <code>useLocale</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <p>
        <code>useLocale</code> returns <code>{'{ current }'}</code>, where{' '}
        <code>current.locale</code> is the active locale — the same object <code>Locale.new()</code>{' '}
        returns, so use it the same way: <code>current.locale.code</code>,{' '}
        <code>current.locale.language()</code>, <code>current.locale.country()</code>,{' '}
        <code>current.locale.continent()</code> and <code>current.locale.toIntlLocale()</code>. It
        throws if used outside a provider. Give <code>Locale</code> a locale you control; for
        untrusted values (the URL, storage, an API) resolve them first with{' '}
        <code>Locale.resolve</code> (see below) so an unsupported locale falls back instead of
        throwing.
      </p>

      <Callout>
        <strong>Untrusted locales.</strong> A hardcoded locale that can't be resolved (a typo like{' '}
        <code>en-XX</code>) throws while rendering — a fail-fast signal you want in development. But
        never hand <code>Locale</code> a locale from the URL, storage or an API raw: run it through{' '}
        <code>Locale.resolve</code> first, which maps it onto one you support (via the required{' '}
        <code>*</code> catch-all) so user data can't crash the app.
      </Callout>

      <h2 id="domain-model">Domain model</h2>
      <p>
        Every entity is immutable. <code>Country</code>, <code>Language</code> and{' '}
        <code>Continent</code> live in <a href="#/docs/country">@luwio/country</a> and{' '}
        <a href="#/docs/language">@luwio/language</a> and are re-exported here, so a single{' '}
        <code>@luwio/locale</code> import gets you everything. Collections (<code>Countries</code>,{' '}
        <code>Languages</code>) return new instances on every change.
      </p>
      <CodeBlock code={DOMAIN_CODE} />

      <h2 id="resolution">Locale resolution</h2>
      <p>
        <code>Locale.resolve</code> maps a detected locale onto the ones your app supports. It
        tries, in order: exact match → exact override → wildcard override (<code>en-*</code>,{' '}
        <code>*-BE</code>) → first supported locale with the same language → the required{' '}
        <code>*</code> catch-all.
      </p>
      <p>
        <code>supported</code> is optional — omit it to accept <em>any</em> valid locale (a known
        language + known country), i.e. the whole dataset. A detected locale that's valid is then
        returned as-is; only an unknown or missing one falls through to the overrides and{' '}
        <code>*</code> catch-all.
      </p>
      <CodeBlock code={RESOLVE_CODE} />

      <p>
        A locale is valid whenever its <em>language</em> and its <em>country</em> are each known —
        there's no "must be a listed pair" rule to configure. An unknown language or country throws,
        so mistakes surface immediately.
      </p>
      <CodeBlock code={VALIDITY_CODE} />

      <h2 id="examples">Examples</h2>
      <p>
        Live and editable — each snippet runs against the real package. Change the code and the
        result updates instantly.
      </p>

      <h3>Language switcher</h3>
      <p>
        <code>useLocale</code> is read-only, so hold the locale string in parent state and feed it
        to <code>Locale</code>. Pick a locale and watch it re-resolve.
      </p>
      <LiveExample code={EX_SWITCHER} scope={{ useState, Locale, useLocale }} />

      <h3>Phone-number country picker</h3>
      <p>
        Turn a continent's countries into sorted <code>&lt;select&gt;</code> options, each labelled
        with its international dialing code.
      </p>
      <LiveExample code={EX_PHONE} scope={{ Continent }} />

      <h3>Resolve the visitor's locale on boot</h3>
      <p>
        Detect the runtime locale with <code>Locale.system</code> and collapse it onto the locales
        your app actually ships. The result below is resolved from <em>your</em> browser.
      </p>
      <LiveExample code={EX_RESOLVE} scope={{ Locale }} />
      <Callout>
        <code>Locale.resolve</code> returns a full <code>ILocale</code> — pass its{' '}
        <code>.locale</code> string to the provider.
      </Callout>

      <h3>Country flag &amp; spoken languages</h3>
      <p>
        Derive a flag emoji from the country's alpha-2 code and list the languages spoken there
        straight from the dataset.
      </p>
      <LiveExample code={EX_COUNTRY} scope={{ Locale, useLocale }} />

      <h2 id="routing">Locale routing with @luwio/router</h2>
      <Callout>
        <strong>Planned.</strong> <code>@luwio/router</code> is a skeleton today — this is the
        intended integration for the most common locale task: taking the locale from the URL.
      </Callout>
      <p>
        <code>useRouteLocale()</code> always returns a locale — the one in the URL, or the router's
        configured default when the URL has none — so you never handle <code>null</code>. Map it
        onto what you support with <code>Locale.resolve</code>: an unsupported <code>/pt-PT</code>{' '}
        falls to the <code>*</code> catch-all (your default), everything else through the usual
        rules (same-language → per-pattern → catch-all). Render the result via <code>Locale</code>.
      </p>
      <CodeBlock code={ROUTER_CODE} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Locale',
            desc: 'Provider taking a language-country string.',
          },
          {
            sig: 'useLocale()',
            desc: 'Hook → { current }; current.locale is the active Locale (same as Locale.new()).',
          },
          {
            sig: 'Locale.new()',
            desc: 'Build an ILocale from a code, locale string, or language + country.',
          },
          {
            sig: 'Locale.resolve()',
            desc: 'Resolve a detected locale against a supported list (optional — omit for any valid locale).',
          },
          {
            sig: 'Locale.system',
            desc: "The runtime's detected locale (region inferred if absent).",
          },
          {
            sig: 'Language · Country',
            desc: (
              <>
                Re-exported from <a href="#/docs/language">@luwio/language</a> ·{' '}
                <a href="#/docs/country">@luwio/country</a>.
              </>
            ),
          },
          { sig: 'Countries · Languages', desc: 'Immutable, de-duplicated collections.' },
          { sig: 'Continent', desc: 'Continent lookup with .countries().' },
        ]}
      />
    </DocsLayout>
  )
}
