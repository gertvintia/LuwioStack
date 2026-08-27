import { Country, useCountry } from '@luwio/country/react'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { COUNTRY_CATALOGS } from './data/name-catalogs'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, DownloadButton, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'react-usage', label: 'React' },
  { id: 'localizing', label: 'Localizing names' },
  { id: 'continents', label: 'Continents' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const LOCALIZE_CODE = `import { Countries } from '@luwio/country'
import { useTranslations } from '@luwio/translations'

// Every country carries a stable machine_name — use it as the translation key.
// Load the downloaded catalog for the active language (keys are machine_names):
await translations.add(nl, () => import('./locales/countries.nl.json'))

function CountryName({ country }) {
  const { translations } = useTranslations()
  return <span>{translations.t(country.machine_name)}</span>  // 'België' in nl, 'Belgium' in en
}

// A picker over every country, names shown in the active language:
function CountryPicker() {
  const { translations } = useTranslations()
  return (
    <select>
      {Countries.all().toArray().map((c) => (
        <option key={c.code} value={c.code}>{translations.t(c.machine_name)}</option>
      ))}
    </select>
  )
}`

/**
 * Download ready `machine_name → name` catalogs shipped in @luwio/country's `translations/` dir.
 * English and Dutch are provided; any other locale downloads the English catalog as a template
 * (same keys, English values) to translate.
 */
function NameCatalogDownloads() {
  const [code, setCode] = useState('nl')
  const safe = code.trim().toLowerCase() || 'xx'
  const en = COUNTRY_CATALOGS.en
  const translated = safe in COUNTRY_CATALOGS
  const localeData = COUNTRY_CATALOGS[safe] ?? en
  const translatedCount = Object.keys(localeData).filter((k) => localeData[k] !== en[k]).length
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <DownloadButton
        filename="countries.en.json"
        data={en}
        label="Download countries.en.json (English)"
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
        filename={`countries.${safe}.json`}
        data={localeData}
        label={`Download countries.${safe}.json`}
      />
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {translated
          ? `✓ ${translatedCount}/${Object.keys(en).length} translated`
          : 'template — English values to translate'}
      </span>
    </div>
  )
}

const REACT_CODE = `import { Country, useCountry } from '@luwio/country/react'

function App() {
  return (
    <Country country={Country.new({ code: 'BE' })}>   {/* a resolved Country */}
      <Facts />
    </Country>
  )
}

function Facts() {
  const { country } = useCountry()
  // country is the active Country — the same object Country.new() returns.
  return <p>{country.name} — dial {country.dialing_code}, pay in {country.currency_code}</p>
}

// useCountry() also works inside <Locale> from @luwio/locale, which provides the
// locale's country under the hood — no separate <Country> needed.`

const USAGE_CODE = `import { Country } from '@luwio/country'

const be = Country.new({ code: 'BE' })   // ISO 3166-1 alpha-2
be.name                 // 'Belgium'
be.alpha3               // 'BEL'
be.numeric              // '056'
be.capital              // 'Brussels'
be.dialing_code         // '+32'
be.currency_code        // 'EUR'   (symbol + formatting live in @luwio/money)

be.languages().toArray().map((l) => l.name) // ['Dutch', 'French', 'German']
be.borders().toArray().map((c) => c.code)   // ['FR', 'DE', 'LU', 'NL']
be.continent().name                          // 'Europe'

// Look up by alpha-3 or numeric too:
Country.from({ code: 'BEL', format: 'alpha3' }).code // 'BE'`

const CONTINENT_CODE = `import { Continent, Countries } from '@luwio/country'

Continent.europe().code            // 'EU'
Continent.europe().countries().size // European countries

// Curated collections, immutable and de-duplicated:
Countries.benelux().toArray().map((c) => c.code) // ['BE', 'NL', 'LU']`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the provided
// country through useCountry, exactly as an app would.
const EX_REACT = `function Facts() {
  const { country } = useCountry()
  return (
    <p>
      <strong>{country.name}</strong> — pay in {country.currency_code}, dial {country.dialing_code}
    </p>
  )
}

render(
  <Country country={Country.new({ code: 'BE' })}>
    <Facts />
  </Country>
)`

// Live snippet runs in noInline mode: ends with render(<…/>). Avoids template
// literals so it can live inside this template-string constant.
const EX_BORDERS = `const flag = (a) =>
  a.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))

function Neighbours() {
  const be = Country.new({ code: 'BE' })
  return (
    <div>
      <strong>{flag(be.code)} {be.name}</strong> borders:
      <ul>
        {be.borders().toArray().map((c) => (
          <li key={c.code}>{flag(c.code)} {c.name} ({c.currency_code})</li>
        ))}
      </ul>
    </div>
  )
}

render(<Neighbours />)`

export function CountryPage() {
  return (
    <DocsLayout slug="country" sections={SECTIONS}>
      <DocHero slug="country" />

      <p>
        <code>@luwio/country</code> is a typed domain model over the ISO 3166 country list —
        continents, land borders, dialing codes, currencies and the languages each country speaks.
        It pulls in <code>@luwio/language</code> so <code>Country.languages()</code> returns rich{' '}
        <code>Language</code> objects, and ships its own React coupling: a{' '}
        <code>&lt;Country&gt;</code> provider and a <code>useCountry</code> hook.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/country" />
      <Callout>
        Installing <code>@luwio/country</code> also installs <code>@luwio/language</code>{' '}
        automatically. React is a peer dependency — needed for <code>&lt;Country&gt;</code> /{' '}
        <code>useCountry</code>.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a country by ISO 3166-1 <code>alpha-2</code> code with <code>Country.new</code>, or
        by <code>alpha-3</code> / <code>numeric</code> with <code>Country.from</code>. An unknown
        code throws.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Country&gt;</code> with a resolved country, then read it
        anywhere below with <code>useCountry</code> — the same standalone pattern as{' '}
        <code>&lt;Locale&gt;</code> / <code>useLocale</code>. <code>&lt;Locale&gt;</code> renders{' '}
        <code>&lt;Country&gt;</code> under the hood, so <code>useCountry</code> works inside a
        locale too.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Country, useCountry }} />

      <h2 id="localizing">Localizing country names</h2>
      <p>
        Every country has a stable <code>machine_name</code> slug (e.g. <code>belgium</code>) that
        never changes across translations — so it makes an ideal <strong>translation key</strong>.
        Pair it with <code>@luwio/translations</code> and translate a country's name with{' '}
        <code>t(country.machine_name)</code>.
      </p>
      <CodeBlock code={LOCALIZE_CODE} />
      <p>
        Download a ready catalog of <code>machine_name → name</code> for every country and drop it
        into your project. English and Dutch are provided; any other locale downloads the English
        catalog as a template (same keys, English values) to translate. Keys are the country's{' '}
        <code>machine_name</code> — generated with <code>toMachineName</code>, the same function the
        dataset uses — so a downloaded file works directly with <code>t(country.machine_name)</code>
        .
      </p>
      <NameCatalogDownloads />
      <Callout>
        These catalogs live in <code>@luwio/country</code>'s <code>translations/</code> folder —
        kept with the package but excluded from its published bundle, so they add nothing to your
        install. Download the ones you need and commit them in your app.
      </Callout>

      <h2 id="continents">Continents &amp; collections</h2>
      <p>
        <code>Continent</code> groups countries; <code>Countries</code> is an immutable,
        de-duplicated collection with lookups and set-style operations.
      </p>
      <CodeBlock code={CONTINENT_CODE} />

      <h2 id="examples">Examples</h2>
      <p>Belgium and its neighbours — every value below comes straight from the dataset.</p>
      <LiveExample code={EX_BORDERS} scope={{ Country }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: '<Country country={…}>',
            desc: 'Provider taking a resolved Country (from Country.new / Country.from).',
          },
          {
            sig: 'useCountry()',
            desc: (
              <>
                Returns <code>{'{ country }'}</code> — the active Country. Works inside{' '}
                <code>&lt;Country&gt;</code> or <code>&lt;Locale&gt;</code>.
              </>
            ),
          },
          {
            sig: 'Countries.all()',
            desc: 'Every country in the dataset as a Countries collection — e.g. to build a machine_name → name catalog or a country picker.',
          },
          { sig: 'Country.new({ code })', desc: 'Look up by ISO 3166-1 alpha-2 code.' },
          {
            sig: 'Country.from({ code, format })',
            desc: 'Look up by alpha-2 (default), alpha-3 or numeric.',
          },
          {
            sig: 'country.languages()',
            desc: (
              <>
                The spoken languages as a <code>Languages</code> collection (via{' '}
                <code>@luwio/language</code>).
              </>
            ),
          },
          { sig: 'country.borders()', desc: 'Bordering countries as a Countries collection.' },
          { sig: 'country.continent()', desc: 'The Continent this country belongs to.' },
          {
            sig: 'Continent.new({ code }) / .europe() …',
            desc: 'A continent by two-letter code, or a named helper.',
          },
          { sig: 'continent.countries()', desc: 'Every country on the continent.' },
          {
            sig: 'Countries.benelux() / .fromAlpha2(…)',
            desc: 'Immutable, de-duplicated country collections.',
          },
        ]}
      />
    </DocsLayout>
  )
}
