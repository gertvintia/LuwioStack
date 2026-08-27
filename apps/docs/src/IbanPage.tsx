import { Iban, useIban } from '@luwio/iban/react'
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

const USAGE_CODE = `import { Iban } from '@luwio/iban'

const iban = Iban.parse('BE68 5390 0754 7034')  // spaces & case ignored; invalid input throws
iban.value        // 'BE68539007547034'  (canonical, compact)
iban.countryCode  // 'BE'
iban.checkDigits  // '68'
iban.bban         // '539007547034'
iban.format()     // 'BE68 5390 0754 7034'  (print groups of four)
iban.country()    // a @luwio/country Country — iban.country().name === 'Belgium'

Iban.isValid('DE89370400440532013000') // true  (non-throwing)
Iban.supportedCountries().length       // every ISO code with a defined IBAN format`

const REACT_CODE = `import { Iban, useIban } from '@luwio/iban/react'

function App() {
  return (
    <Iban iban={Iban.parse('BE68539007547034')}>
      <Account />
    </Iban>
  )
}

function Account() {
  const { iban } = useIban()
  return <span>{iban.format()} — {iban.country().name}</span>
}`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the IBAN through useIban.
const EX_REACT = `function Account() {
  const { iban } = useIban()
  return (
    <p>
      <strong>{iban.format()}</strong> — {iban.country().name} (BBAN {iban.bban})
    </p>
  )
}

render(
  <Iban iban={Iban.parse('DE89 3704 0044 0532 0130 00')}>
    <Account />
  </Iban>
)`

// A validator across valid and invalid inputs.
const EX_VALIDATE = `const inputs = [
  'BE68 5390 0754 7034',
  'NL91 ABNA 0417 1643 00',
  'GB82 WEST 1234 5698 7654 32',
  'BE68 5390 0754 7035', // bad check digit
  'ZZ00 1234',           // unknown country
]

function Check() {
  return (
    <ul>
      {inputs.map((raw) => {
        try {
          const iban = Iban.parse(raw)
          return <li key={raw}>✓ {iban.format()} — {iban.country().name}</li>
        } catch {
          return <li key={raw}>✗ {raw} — invalid</li>
        }
      })}
    </ul>
  )
}

render(<Check />)`

export function IbanPage() {
  return (
    <DocsLayout slug="iban" sections={SECTIONS}>
      <DocHero slug="iban" />

      <p>
        <code>@luwio/iban</code> validates and formats IBANs — one global algorithm (ISO 13616,
        MOD-97) over a per-country length registry, so it covers <strong>every IBAN country</strong>{' '}
        out of the box. It mirrors <a href="#/docs/phone">@luwio/phone</a>: build with{' '}
        <code>Iban.parse</code> (throws on invalid), read the parts and <code>iban.country()</code>,
        and use <code>&lt;Iban&gt;</code> / <code>useIban</code> for React.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/iban" />
      <Callout>
        <code>@luwio/country</code> is a dependency (installed automatically); React 18+ is a peer
        dependency, needed only for <code>&lt;Iban&gt;</code> / <code>useIban</code>, imported from{' '}
        <code>@luwio/iban/react</code>. No per-country code to maintain — just a length table plus
        the checksum.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Parse with <code>Iban.parse</code> (spaces and case are ignored). It checks the country's
        length and the MOD-97 checksum, and throws on anything invalid — so an instance is always
        valid. Use <code>Iban.isValid</code> for a non-throwing check, and{' '}
        <code>iban.country()</code> for the rich country.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Iban&gt;</code> with a parsed IBAN, then read it anywhere below
        with <code>useIban</code> — the same standalone pattern as <code>&lt;Locale&gt;</code> /{' '}
        <code>useLocale</code>. The React-free domain lives at <code>@luwio/iban</code>; the
        provider + hook at <code>@luwio/iban/react</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Iban, useIban }} />

      <h2 id="examples">Examples</h2>
      <p>Validation across valid IBANs and common mistakes:</p>
      <LiveExample code={EX_VALIDATE} scope={{ Iban }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Iban.parse(value)',
            desc: 'Parse & validate (spaces/case ignored). Throws on an invalid IBAN.',
          },
          { sig: 'Iban.isValid(value)', desc: 'Non-throwing validity check — true / false.' },
          {
            sig: 'Iban.supportedCountries()',
            desc: 'ISO 3166-1 alpha-2 codes with a defined IBAN format.',
          },
          {
            sig: 'iban.value / .countryCode / .checkDigits / .bban',
            desc: 'Canonical compact IBAN, country code, check digits, and the BBAN.',
          },
          { sig: 'iban.country()', desc: 'The IBAN’s country as a @luwio/country Country.' },
          {
            sig: 'iban.format()',
            desc: 'Print format — groups of four, e.g. BE68 5390 0754 7034.',
          },
          {
            sig: '<Iban iban={…}> / useIban()',
            desc: 'From @luwio/iban/react — the provider and the hook returning { iban }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
