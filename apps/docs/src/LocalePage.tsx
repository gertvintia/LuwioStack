import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'react-usage', label: 'React usage' },
  { id: 'domain-model', label: 'Domain model' },
  { id: 'resolution', label: 'Locale resolution' },
  { id: 'policies', label: 'Matching policies' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const REACT_CODE = `import { LocaleProvider, useLocale } from '@luwio/locale'

function App() {
  return (
    <LocaleProvider locale="nl-BE">
      <Info />
    </LocaleProvider>
  )
}

function Info() {
  const { locale, country, language } = useLocale()
  return (
    <p>
      {language.name} in {country.name} ({locale.locale})
      — dial {country.direct_dialing_code}
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

// STRICT (default): the exact language-country combo must exist
createLocale({ languageOrLocale: 'nl-BE' })

// LOOSE: language and country must each exist, not necessarily together
createLocale({ languageOrLocale: 'en', country: 'BE', policy: MatchingPolicy.LOOSE })

// Per-pattern policy map
createLocale({
  languageOrLocale: 'en',
  country: 'BE',
  policy: { default: MatchingPolicy.STRICT, locales: { 'en-*': MatchingPolicy.LOOSE } },
})`

const EX_SWITCHER = `import { useState } from 'react'
import { LocaleProvider, useLocale } from '@luwio/locale'

const SUPPORTED = ['en-US', 'nl-BE', 'fr-FR', 'de-DE']

function App() {
  const [locale, setLocale] = useState('nl-BE')
  return (
    <LocaleProvider locale={locale}>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {SUPPORTED.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
      <ActiveLocale />
    </LocaleProvider>
  )
}

function ActiveLocale() {
  // useLocale() has no setter — switching is driven by the parent's state.
  const { language, country } = useLocale()
  return <p>{language.name} · {country.name}</p>
}`

const EX_PHONE = `import { Continent } from '@luwio/locale'

// Options for a phone-number country <select>, sorted by name.
const dialCodeOptions = Continent.europe()
  .countries()
  .toArray()
  .map((c) => ({
    value: c.alpha2,
    label: \`\${c.name} (\${c.direct_dialing_code})\`, // 'Belgium (+32)'
  }))
  .sort((a, b) => a.label.localeCompare(b.label))`

const EX_RESOLVE = `import type { ReactNode } from 'react'
import { LocaleProvider, resolveLocale, SystemLocale } from '@luwio/locale'

// Pick the best supported locale for the visitor, once, at boot.
const active = resolveLocale({
  detected: SystemLocale,
  supported: ['en-US', 'nl-BE', 'fr-FR'],
  overrides: { 'nl-*': 'nl-BE', '*': 'en-US' },
})

export function AppRoot({ children }: { children: ReactNode }) {
  return <LocaleProvider locale={active.locale}>{children}</LocaleProvider>
}`

const EX_COUNTRY = `import { useLocale } from '@luwio/locale'

// Regional-indicator flag emoji from an ISO alpha-2 code.
const flag = (alpha2: string) =>
  alpha2.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))

function CountryBadge() {
  const { country } = useLocale()
  const spoken = country.languages().toArray().map((l) => l.name)
  return (
    <div>
      <strong>{flag(country.alpha2)} {country.name}</strong>
      <small>Spoken: {spoken.join(', ')}</small>
    </div>
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
        Wrap your tree in <code>LocaleProvider</code> with a <code>language-country</code> string,
        then read the resolved locale anywhere with <code>useLocale</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <p>
        <code>useLocale</code> returns{' '}
        <code>{'{ locale, language, language_code, country, country_code }'}</code> and throws if
        used outside a provider.
      </p>

      <h2 id="domain-model">Domain model</h2>
      <p>
        Every entity is immutable and constructed from the dataset. Collections (
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
        A <code>MatchingPolicy</code> controls how strictly a locale must exist in the dataset. Pass
        a uniform policy, or a rule map resolved most-specific-first.
      </p>
      <CodeBlock code={POLICY_CODE} />

      <h2 id="examples">Examples</h2>
      <p>Practical recipes built from the exports above.</p>

      <h3>Language switcher</h3>
      <p>
        <code>useLocale</code> is read-only, so hold the locale string in parent state and feed it
        to <code>LocaleProvider</code>. Everything below re-resolves on change.
      </p>
      <CodeBlock code={EX_SWITCHER} />

      <h3>Phone-number country picker</h3>
      <p>
        Turn a continent's countries into sorted <code>&lt;select&gt;</code> options, each labelled
        with its international dialing code.
      </p>
      <CodeBlock code={EX_PHONE} />

      <h3>Resolve the visitor's locale on boot</h3>
      <p>
        Detect the runtime locale with <code>SystemLocale</code> and collapse it onto the locales
        your app actually ships, once, at the root.
      </p>
      <CodeBlock code={EX_RESOLVE} />
      <Callout>
        <code>resolveLocale</code> returns a full <code>ILocale</code> — pass its{' '}
        <code>.locale</code> string to the provider.
      </Callout>

      <h3>Country flag &amp; spoken languages</h3>
      <p>
        Derive a flag emoji from the country's alpha-2 code and list the languages spoken there
        straight from the dataset.
      </p>
      <CodeBlock code={EX_COUNTRY} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          { sig: 'LocaleProvider', desc: 'Provider taking a locale string + optional policy.' },
          { sig: 'useLocale()', desc: 'Hook → the active locale, language and country.' },
          {
            sig: 'createLocale()',
            desc: 'Build an ILocale from a code, locale string, or language + country.',
          },
          { sig: 'resolveLocale()', desc: 'Resolve a detected locale against a supported list.' },
          {
            sig: 'SystemLocale',
            desc: "The runtime's detected locale (region inferred if absent).",
          },
          {
            sig: 'Locale · Language · Country',
            desc: 'Domain entities with codes, names and relationships.',
          },
          { sig: 'Countries · Languages', desc: 'Immutable, de-duplicated collections.' },
          { sig: 'Continent', desc: 'Continent lookup with .countries().' },
          { sig: 'MatchingPolicy', desc: 'STRICT | LOOSE enum for resolution strictness.' },
        ]}
      />
    </DocsLayout>
  )
}
