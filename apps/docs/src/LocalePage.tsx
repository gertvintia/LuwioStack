import { Continent } from '@luwio/locale'
import { Locale, useLocale } from '@luwio/locale/react'
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

const REACT_CODE = `import { Locale, useLocale } from '@luwio/locale/react'

function App() {
  return (
    <Locale locale={Locale.new({ languageOrLocale: 'nl-BE' })}>   {/* a resolved Locale */}
      <Info />
    </Locale>
  )
}

function Info() {
  const { locale } = useLocale()
  // locale is the active Locale — the same object Locale.new() returns.
  return (
    <p>
      {locale.language().name} in {locale.country().name} ({locale.code})
      — dial {locale.country().dialing_code}
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

Country.new({ code: 'BE' }).dialing_code   // '+32'
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
  const { locale } = useLocale()
  return (
    <p>{locale.language().name} · {locale.country().name} · dial {locale.country().dialing_code}</p>
  )
}

function Switcher() {
  const [locale, setLocale] = useState('nl-BE')
  return (
    <Locale locale={Locale.new({ languageOrLocale: locale })}>
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
  .map((c) => ({ value: c.alpha2, label: c.name + ' (' + c.dialing_code + ')' }))
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
  const { locale } = useLocale()
  const country = locale.country()
  const spoken = country.languages().toArray().map((l) => l.name)
  return (
    <div>
      <strong>{flag(country.code)} {country.name}</strong>
      <div>Spoken: {spoken.join(', ')}</div>
    </div>
  )
}

render(
  <Locale locale={Locale.new({ languageOrLocale: 'nl-BE' })}>
    <Badge />
  </Locale>,
)`

const ROUTER_CODE = `// router.ts — build the router with the locales you support.
import { createRouter, routeRegistry } from '@luwio/router'
import { Locale, useLocale } from '@luwio/locale/react'

export const router = createRouter(routeRegistry, {
  locales: ['nl-BE', 'fr-BE', 'en-BE'].map((l) => Locale.new({ languageOrLocale: l })),
  defaultLocale: Locale.new({ languageOrLocale: 'nl-BE' }),
})

// The router mounts one subtree per locale and wraps each in <Locale> for you —
// so you never mount <Locale> by hand. Read the active locale anywhere below:
function Badge() {
  const { locale } = useLocale() // the locale from the URL (or the default)
  return <span>{locale.language().name} · {locale.country().name}</span>
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
        Wrap your tree in <code>Locale</code> with a resolved locale (a <code>Locale.new</code> or{' '}
        <code>Locale.resolve</code> result), then read it anywhere with <code>useLocale</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <p>
        <code>useLocale</code> returns <code>{'{ locale }'}</code>, where <code>locale</code> is the
        active locale — the same object <code>Locale.new()</code> returns, so use it the same way:{' '}
        <code>locale.code</code>, <code>locale.language()</code>, <code>locale.country()</code>,{' '}
        <code>locale.continent()</code> and <code>locale.toIntlLocale()</code>. It throws if used
        outside a provider. Give <code>Locale</code> a locale you control; for untrusted values (the
        URL, storage, an API) resolve them first with <code>Locale.resolve</code> (see below) so an
        unsupported locale falls back instead of throwing.
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
        <code>Locale.resolve</code> returns a full <code>ILocale</code> — pass it straight to the{' '}
        <code>Locale</code> provider.
      </Callout>

      <h3>Country flag &amp; spoken languages</h3>
      <p>
        Derive a flag emoji from the country's alpha-2 code and list the languages spoken there
        straight from the dataset.
      </p>
      <LiveExample code={EX_COUNTRY} scope={{ Locale, useLocale }} />

      <h2 id="routing">Locale routing with @luwio/router</h2>
      <p>
        <code>@luwio/router</code> builds on this package: you give <code>createRouter</code> the{' '}
        <code>locales</code> you support (each a <code>Locale</code>) and a{' '}
        <code>defaultLocale</code>, and it mounts a real subtree per locale — <code>/nl-BE/…</code>,{' '}
        <code>/fr-BE/…</code>, with the default optionally unprefixed. Each subtree is wrapped in{' '}
        <code>&lt;Locale&gt;</code> and the resolved <code>ILocale</code> is put in route context,
        so <code>useLocale()</code> just works in every component — no manual{' '}
        <code>&lt;Locale&gt;</code> wiring, no <code>null</code> to handle.
      </p>
      <CodeBlock code={ROUTER_CODE} />
      <Callout>
        See the <a href="#/docs/router">@luwio/router</a> docs for defining localized routes (
        <code>createRoute().alias()</code>), the Vite plugin, and per-locale slugs.
      </Callout>

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Locale',
            desc: 'Provider taking a resolved Locale (from Locale.new / Locale.resolve).',
          },
          {
            sig: 'useLocale()',
            desc: 'Hook → { locale }; locale is the active Locale (same as Locale.new()).',
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
