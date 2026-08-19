import { Continent, Locale, resolveLocale, SystemLocale, useLocale } from '@luwio/locale'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'react-usage', label: 'React usage' },
  { id: 'domain-model', label: 'Domain model' },
  { id: 'resolution', label: 'Locale resolution' },
  { id: 'policies', label: 'Matching policies' },
  { id: 'examples', label: 'Examples' },
  { id: 'routing', label: 'Locale routing' },
  { id: 'api', label: 'API reference' },
]

const REACT_CODE = `import { Locale, MatchingPolicy, useLocale } from '@luwio/locale'

function App() {
  return (
    <Locale
      locale="nl-BE"                 // required — the 'language-country' string
      policy={MatchingPolicy.STRICT} // optional — overrides the default (LOOSE)
    >
      <Info />
    </Locale>
  )
}

function Info() {
  const { current } = useLocale()
  return (
    <p>
      {current.language.name} in {current.country.name} ({current.locale.code})
      — dial {current.country.direct_dialing_code}
    </p>
  )
}`

const DOMAIN_CODE = `import { Locale, Country, Continent } from '@luwio/locale'

const locale = Locale.new({ languageOrLocale: 'nl-BE' })
locale.language().name        // 'Dutch'
locale.country().alpha3       // 'BEL'
locale.country().borders()    // Countries → FR, DE, LU, NL

Country.new({ code: 'BE' }).direct_dialing_code   // '+32'
Continent.europe().countries().size               // European countries`

const RESOLVE_CODE = `import { resolveLocale, SystemLocale } from '@luwio/locale'

const locale = resolveLocale({
  detected: SystemLocale,                 // the runtime's locale
  supported: ['nl-BE', 'fr-FR', 'en-US'],
  overrides: {
    'en-*': 'en-US',                       // any English → en-US
    '*': 'nl-BE',                          // catch-all (required)
  },
})`

const POLICY_CODE = `import { Locale, MatchingPolicy } from '@luwio/locale'

// 'nl-BE' is a real dataset entry → both policies accept it.
Locale.new({ languageOrLocale: 'nl-BE' })

// 'en-BE': English and Belgium each exist, but not together as a dataset entry.
Locale.new({ languageOrLocale: 'en', country: 'BE' })                                 // LOOSE (default) → 'en-BE'
Locale.new({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.STRICT })  // STRICT → throws

// Either policy throws when the language or the country itself is unknown.
Locale.new({ languageOrLocale: 'zz', country: 'BE' })  // 'zz' isn't a language → throws

// Per-pattern map: its \`default\` applies where no pattern matches.
Locale.new({
  languageOrLocale: 'nl-BE',
  policy: { default: MatchingPolicy.LOOSE, locales: { 'en-*': MatchingPolicy.STRICT } },
})`

// Live snippets run in noInline mode: each ends with render(<…/>). They avoid
// template literals so they can live inside these template-string constants.

const EX_SWITCHER = `const SUPPORTED = ['en-US', 'nl-BE', 'fr-FR', 'de-DE', 'ja-JP']

function Info() {
  // useLocale() has no setter — switching is driven by the parent's state.
  const { current } = useLocale()
  return (
    <p>{current.language.name} · {current.country.name} · dial {current.country.direct_dialing_code}</p>
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
const active = resolveLocale({
  detected: SystemLocale,
  supported: ['en-US', 'nl-BE', 'fr-FR'],
  overrides: { 'nl-*': 'nl-BE', '*': 'en-US' },
})

render(
  <p>
    Detected <code>{SystemLocale.locale}</code> → resolved <strong>{active.locale}</strong>
  </p>,
)`

const EX_COUNTRY = `const flag = (a) =>
  a.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))

function Badge() {
  const { current } = useLocale()
  const spoken = current.country.languages().toArray().map((l) => l.name)
  return (
    <div>
      <strong>{flag(current.country.code)} {current.country.name}</strong>
      <div>Spoken: {spoken.join(', ')}</div>
    </div>
  )
}

render(
  <Locale locale="nl-BE">
    <Badge />
  </Locale>,
)`

const ROUTER_CODE = `import { Locale, resolveLocale } from '@luwio/locale'
import { useRouteLocale } from '@luwio/router'

const SUPPORTED = ['nl-BE', 'fr-FR', 'en-US']
const OVERRIDES = { 'en-*': 'en-US', '*': 'nl-BE' } // '*' catch-all → default

function App() {
  // The router always returns a locale: the one in the URL, or its own
  // configured default when the URL has none — so this never sees null.
  const { locale } = useRouteLocale()

  // Resolve it onto what you support — an unsupported '/pt-PT' falls to '*' → default.
  const active = resolveLocale({ detected: locale, supported: SUPPORTED, overrides: OVERRIDES })
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
        <code>@luwio/locale</code> gives you a typed domain model over a built-in ISO dataset — 377
        language-country combinations. Resolve a locale, inspect the country and language behind it,
        and expose the active locale through a provider and hook. The domain layer works with or
        without React.
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
        <code>useLocale</code> returns <code>{'{ current }'}</code> with{' '}
        <code>current.locale.code</code>, <code>current.language</code>,{' '}
        <code>current.country</code>, <code>current.languages</code> and <code>current.intl</code> —
        and throws if used outside a provider. Give <code>Locale</code> a locale you control; for
        untrusted values (the URL, storage, an API) resolve them first with{' '}
        <code>resolveLocale</code> (see below) so an unsupported locale falls back instead of
        throwing.
      </p>

      <Callout>
        <strong>Untrusted locales.</strong> A hardcoded locale that can't be resolved (a typo like{' '}
        <code>en-XX</code>) throws while rendering — a fail-fast signal you want in development. But
        never hand <code>Locale</code> a locale from the URL, storage or an API raw: run it through{' '}
        <code>resolveLocale</code> first, which maps it onto one you support (via the required{' '}
        <code>*</code> catch-all) so user data can't crash the app.
      </Callout>

      <h2 id="domain-model">Domain model</h2>
      <p>
        Every entity is immutable and constructed from the built-in dataset. Collections (
        <code>Countries</code>, <code>Languages</code>) return new instances on every change.
      </p>
      <CodeBlock code={DOMAIN_CODE} />

      <h2 id="resolution">Locale resolution</h2>
      <p>
        <code>resolveLocale</code> maps a detected locale onto the ones your app supports. It tries,
        in order: exact match → exact override → wildcard override (<code>en-*</code>,{' '}
        <code>*-BE</code>) → first supported locale with the same language → the required{' '}
        <code>*</code> catch-all.
      </p>
      <CodeBlock code={RESOLVE_CODE} />

      <h2 id="policies">Matching policies</h2>
      <p>
        A <code>MatchingPolicy</code> controls how strictly a locale must exist in the dataset —
        take <code>en-BE</code> (English spoken in Belgium):
      </p>
      <ul>
        <li>
          <strong>LOOSE</strong> (default) — the <em>language</em> and the <em>country</em> must
          each exist, not necessarily together. <code>en-BE</code> is accepted (both <code>en</code>{' '}
          and <code>BE</code> exist), even though it isn't a listed pair.
        </li>
        <li>
          <strong>STRICT</strong> — the exact <code>language-country</code> pair must be a dataset
          entry. <code>en-BE</code> throws; <code>nl-BE</code> (a real entry) passes.
        </li>
      </ul>
      <p>
        Either way, an unknown language or country (e.g. <code>zz-BE</code>) throws. Pass a uniform
        policy, or a rule map resolved most-specific-first.
      </p>
      <CodeBlock code={POLICY_CODE} />

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
        Detect the runtime locale with <code>SystemLocale</code> and collapse it onto the locales
        your app actually ships. The result below is resolved from <em>your</em> browser.
      </p>
      <LiveExample code={EX_RESOLVE} scope={{ resolveLocale, SystemLocale }} />
      <Callout>
        <code>resolveLocale</code> returns a full <code>ILocale</code> — pass its{' '}
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
        onto what you support with <code>resolveLocale</code>: an unsupported <code>/pt-PT</code>{' '}
        falls to the <code>*</code> catch-all (your default), everything else through the usual
        rules (same-language → per-pattern → catch-all). Render the result via <code>Locale</code>.
      </p>
      <CodeBlock code={ROUTER_CODE} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Locale',
            desc: 'Provider taking a locale string + optional policy (default LOOSE).',
          },
          {
            sig: 'useLocale()',
            desc: 'Hook → { current } with the active locale, language and country.',
          },
          {
            sig: 'Locale.new()',
            desc: 'Build an ILocale from a code, locale string, or language + country.',
          },
          {
            sig: 'resolveLocale()',
            desc: 'Resolve a detected locale (ILocale or string) against a supported list.',
          },
          {
            sig: 'SystemLocale',
            desc: "The runtime's detected locale (region inferred if absent).",
          },
          {
            sig: 'Language · Country',
            desc: 'Domain entities with codes, names and relationships.',
          },
          { sig: 'Countries · Languages', desc: 'Immutable, de-duplicated collections.' },
          { sig: 'Continent', desc: 'Continent lookup with .countries().' },
          {
            sig: 'MatchingPolicy',
            desc: 'STRICT | LOOSE enum for match strictness (default LOOSE).',
          },
        ]}
      />
    </DocsLayout>
  )
}
