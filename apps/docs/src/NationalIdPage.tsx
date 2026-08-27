import { Country } from '@luwio/country'
import { NationalId, useNationalId } from '@luwio/national-id/react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'react-usage', label: 'React' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { NationalId } from '@luwio/national-id'
import { Country } from '@luwio/country'

const be = Country.new({ code: 'BE' })

const id = NationalId.parse('85.07.30-033.28', be) // separators & case ignored; invalid input throws
id.value       // '85073003328'  (normalized)
id.countryCode // 'BE'
id.country()   // a @luwio/country Country — id.country().name === 'Belgium'

// Scheme-specific data lives on id.details, discriminated by countryCode — you only see fields the
// number actually encodes (no properties that are silently null half the time). Narrow to read them:
if (id.details.countryCode === 'BE') {
  id.details.birthDate // Date 1985-07-30 (null when unknown)
  id.details.sex       // 'male'
  id.details.isBis     // false — true for a Belgian BIS (non-resident) number
}

NationalId.isValid('111222333', Country.new({ code: 'NL' })) // true (non-throwing)
NationalId.supportedCountries() // ['BE','DE','ES','FR','GB','IT','NL','PT']`

const REACT_CODE = `import { NationalId, useNationalId } from '@luwio/national-id/react'
import { Country } from '@luwio/country'

function App() {
  const be = Country.new({ code: 'BE' })
  return (
    <NationalId nationalId={NationalId.parse('85073003328', be)}>
      <Citizen />
    </NationalId>
  )
}

function Citizen() {
  const { nationalId } = useNationalId()
  const { details } = nationalId
  const sex = details.countryCode === 'BE' ? details.sex : null
  return <span>{nationalId.country().name} — {sex}</span>
}`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the ID through useNationalId.
const EX_REACT = `function Citizen() {
  const { nationalId } = useNationalId()
  const { details } = nationalId
  const be = details.countryCode === 'BE' ? details : null
  const dob = be?.birthDate?.toISOString().slice(0, 10) ?? '—'
  return (
    <p>
      <strong>{nationalId.value}</strong> — {nationalId.country().name}, {be?.sex}
      , born {dob} {be?.isBis ? '(BIS)' : ''}
    </p>
  )
}

const be = Country.new({ code: 'BE' })
render(
  <NationalId nationalId={NationalId.parse('90.21.01-001.66', be)}>
    <Citizen />
  </NationalId>
)`

// A validator across countries, valid and invalid inputs, plus an unsupported country.
const EX_VALIDATE = `const cases = [
  ['BE', '85.07.30-033.28'],       // Rijksregisternummer
  ['BE', '90.21.01-001.66'],       // BIS number (non-resident)
  ['NL', '111222333'],             // BSN
  ['FR', '1 84 12 76 451 089 46'], // NIR
  ['DE', '11234567890'],           // Steuer-ID
  ['ES', '12345678Z'],             // DNI
  ['IT', 'RSSMRA85T10A562S'],      // Codice Fiscale
  ['GB', 'AB123456C'],             // National Insurance no.
  ['BE', '85.07.30-033.29'],       // bad check digit
  ['US', '123456789'],             // not supported yet
]

function Check() {
  return (
    <ul>
      {cases.map(([code, raw]) => {
        const country = Country.new({ code })
        if (!NationalId.isSupported(country)) {
          return <li key={raw}>… {code} {raw} — not supported yet</li>
        }
        try {
          const id = NationalId.parse(raw, country)
          const bis = id.details.countryCode === 'BE' && id.details.isBis ? ' (BIS)' : ''
          return <li key={raw}>✓ {code} {id.value}{bis} — {id.country().name}</li>
        } catch {
          return <li key={raw}>✗ {code} {raw} — invalid</li>
        }
      })}
    </ul>
  )
}

render(<Check />)`

export function NationalIdPage() {
  return (
    <DocsLayout slug="national-id" sections={SECTIONS}>
      <DocHero slug="national-id" />

      <p>
        <code>@luwio/national-id</code> validates national identification numbers. Unlike{' '}
        <a href="#/docs/iban">@luwio/iban</a>, there's no single global algorithm — each country has
        its own scheme, so this is an <strong>incremental per-country registry</strong>. It ships
        with eight countries — Belgium (Rijksregisternummer <em>and</em> BIS numbers), Germany
        (Steuer-ID), Spain (DNI/NIE), France (NIR), the UK (National Insurance number), Italy
        (Codice Fiscale), the Netherlands (BSN) and Portugal (NIF) — and more are added one at a
        time. Build with <code>NationalId.parse</code> (throws on invalid), then read
        scheme-specific data from <code>id.details</code> — a union discriminated by{' '}
        <code>countryCode</code>, so you only see the fields a country's number actually encodes.
        Use <code>&lt;NationalId&gt;</code> / <code>useNationalId</code> for React.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/national-id" />
      <Callout>
        <code>@luwio/country</code> is a dependency (installed automatically) — you pass a{' '}
        <code>Country</code> to <code>parse</code> so the right scheme is used. React 18+ is a peer
        dependency, needed only for <code>&lt;NationalId&gt;</code> / <code>useNationalId</code>,
        imported from <code>@luwio/national-id/react</code>. "Not supported yet" throws{' '}
        <code>UnsupportedCountryError</code> — distinct from an invalid value.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Parse with <code>NationalId.parse(value, country)</code> (separators and case are ignored).
        It runs the country's checksum and throws on anything invalid — so an instance is always
        valid. Belgian numbers expose the birth date and sex on <code>id.details</code>, and BIS
        (non-resident) numbers validate too, flagged by <code>details.isBis</code>. Use{' '}
        <code>NationalId.isValid</code> for a non-throwing check.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;NationalId&gt;</code> with a parsed ID, then read it anywhere
        below with <code>useNationalId</code> — the same standalone pattern as{' '}
        <code>&lt;Iban&gt;</code> / <code>useIban</code>. The React-free domain lives at{' '}
        <code>@luwio/national-id</code>; the provider + hook at{' '}
        <code>@luwio/national-id/react</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Country, NationalId, useNationalId }} />

      <h2 id="examples">Examples</h2>
      <p>
        Validation across countries — including a BIS number and a country that isn't supported yet:
      </p>
      <LiveExample code={EX_VALIDATE} scope={{ Country, NationalId }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'NationalId.parse(value, country)',
            desc: 'Parse & validate for a Country (separators/case ignored). Throws UnsupportedCountryError for an unsupported country, else Error if invalid.',
          },
          {
            sig: 'NationalId.isValid(value, country)',
            desc: 'Non-throwing validity check for a supported country (throws UnsupportedCountryError otherwise).',
          },
          {
            sig: 'NationalId.isSupported(country)',
            desc: 'Whether a validator is registered for the country.',
          },
          {
            sig: 'NationalId.supportedCountries()',
            desc: 'ISO codes with a registered validator — BE, DE, ES, FR, GB, IT, NL, PT.',
          },
          {
            sig: 'id.value / .countryCode',
            desc: 'Normalized identifier and its ISO 3166-1 alpha-2 country code.',
          },
          {
            sig: 'id.details',
            desc: 'Scheme-specific data, discriminated by details.countryCode — only fields the number encodes: birthDate/sex/isBis for BE, sex for FR & IT, nothing extra for DE/ES/GB/NL/PT.',
          },
          { sig: 'id.country()', desc: 'The ID’s country as a @luwio/country Country.' },
          {
            sig: '<NationalId nationalId={…}> / useNationalId()',
            desc: 'From @luwio/national-id/react — the provider and the hook returning { nationalId }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
