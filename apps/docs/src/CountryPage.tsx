import { Country } from '@luwio/country'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'continents', label: 'Continents' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { Country } from '@luwio/country'

const be = Country.new({ code: 'BE' })   // ISO 3166-1 alpha-2
be.name                 // 'Belgium'
be.alpha3               // 'BEL'
be.numeric              // '056'
be.capital              // 'Brussels'
be.direct_dialing_code  // '+32'
be.currency_code        // 'EUR'   (formatting lives in @luwio/money)
be.currency_symbol      // '€'
be.flag                 // '🇧🇪'

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

// Live snippet runs in noInline mode: ends with render(<…/>). Avoids template
// literals so it can live inside this template-string constant.
const EX_BORDERS = `const flag = (a) =>
  a.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))

function Neighbours() {
  const be = Country.new({ code: 'BE' })
  return (
    <div>
      <strong>{be.flag} {be.name}</strong> borders:
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
        continents, land borders, dialing codes, currencies, flags and the languages each country
        speaks. It has no framework dependency and pulls in <code>@luwio/language</code> so{' '}
        <code>Country.languages()</code> returns rich <code>Language</code> objects.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/country" />
      <Callout>
        Installing <code>@luwio/country</code> also installs <code>@luwio/language</code>{' '}
        automatically. Both work without React.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a country by ISO 3166-1 <code>alpha-2</code> code with <code>Country.new</code>, or
        by <code>alpha-3</code> / <code>numeric</code> with <code>Country.from</code>. An unknown
        code throws.
      </p>
      <CodeBlock code={USAGE_CODE} />

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
