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
      {current.language.name} in {current.region.name} ({current.locale.code})
      — dial {current.region.direct_dialing_code}
    </p>
  )
}`

const DOMAIN_CODE = `import { createLocale, Country, Continent } from '@luwio/locale'

const locale = createLocale({ languageOrLocale: 'nl-BE' })
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

const POLICY_CODE = `import { createLocale, MatchingPolicy } from '@luwio/locale'

// LOOSE (default): language and country must each exist, not necessarily together
createLocale({ languageOrLocale: 'en', country: 'BE' }) // 'en-BE' — accepted

// STRICT: the exact language-country combination must exist in the dataset
createLocale({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.STRICT }) // throws

// Per-pattern policy map (its \`default\` applies where no pattern matches)
createLocale({
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
    <p>{current.language.name} · {current.region.name} · dial {current.region.direct_dialing_code}</p>
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
  const spoken = current.region.languages().toArray().map((l) => l.name)
  return (
    <div>
      <strong>{flag(current.region.code)} {current.region.name}</strong>
      <div>Spoken: {spoken.join(', ')}</div>
    </div>
  )
}

render(
  <Locale locale="nl-BE">
    <Badge />
  </Locale>,
)`

const ROUTER_CODE = `import { Locale, resolveLocale, SystemLocale } from '@luwio/locale'
import { redirect, useRouteLocale } from '@luwio/router'

const SUPPORTED = ['nl-BE', 'fr-FR', 'en-US']
const OVERRIDES = { 'en-*': 'en-US', '*': 'nl-BE' } // '*' catch-all → default
const DEFAULT = 'nl-BE'

function App() {
  const { locale } = useRouteLocale() // string, or null when the URL has no locale

  // No locale in the URL → look at the visitor's system locale.
  if (locale == null) {
    if (SUPPORTED.includes(SystemLocale.locale)) {
      return redirect('/' + SystemLocale.locale) // supported → send them there
    }
    return ( // unsupported system locale → render the default language
      <Locale locale={DEFAULT}>
        <Site />
      </Locale>
    )
  }

  // A locale in the URL → resolve it ('pt-PT' → '*' catch-all → default) and render.
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
        <code>current.locale.code</code>, <code>current.language</code>, <code>current.region</code>
        , <code>current.languages</code> and <code>current.intl</code> — and throws if used outside
        a provider. <code>Locale</code> takes just <code>locale</code> + <code>policy</code>; to map
        an untrusted value onto what you support, resolve it first with <code>resolveLocale</code>{' '}
        (see below).
      </p>

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
        A <code>MatchingPolicy</code> controls how strictly a locale must exist in the dataset. The
        default is <code>LOOSE</code> (language and country each exist); pass{' '}
        <code>MatchingPolicy.STRICT</code> for exact combinations, or a rule map resolved
        most-specific-first.
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
        The router hands you the locale from the URL via <code>useRouteLocale()</code> — a string,
        or <code>null</code> when the route has no locale segment.
      </p>
      <ul>
        <li>
          <strong>With a locale</strong> — map it onto what you support with{' '}
          <code>resolveLocale</code>: an unsupported <code>/pt-PT</code> falls to the <code>*</code>{' '}
          catch-all (your default). Render the result via <code>Locale</code>.
        </li>
        <li>
          <strong>Without one</strong> — fall back to <code>SystemLocale</code>: if the visitor's
          system locale is supported, <code>redirect</code> to it; otherwise render the default
          language.
        </li>
      </ul>
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
            sig: 'createLocale()',
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
