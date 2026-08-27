import { Country } from '@luwio/country'
import { Phone, usePhone } from '@luwio/phone/react'
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

const USAGE_CODE = `import { Phone, PhoneNumberType } from '@luwio/phone'
import { Country } from '@luwio/country'

// E.164 input needs no country; a national-format string needs the Country it belongs to.
const p = Phone.parse('+32470123456')
// const p = Phone.parse('0470 12 34 56', Country.new({ code: 'BE' }))

p.countryCode      // 'BE'        (ISO region)
p.dialCode         // 32          (country calling code)
p.nationalNumber   // 470123456
p.type             // PhoneNumberType.MOBILE
p.country()        // a @luwio/country Country — p.country().name === 'Belgium'

p.format()                // '+32470123456'      (E.164, default)
p.format('INTERNATIONAL') // '+32 470 12 34 56'
p.format('NATIONAL')      // '0470 12 34 56'

// Invalid instances never exist — parse() throws:
Phone.parse('nope')             // throws 'Invalid phone number: nope'
Phone.isValid('+32470123456')   // true  (non-throwing check)`

const REACT_CODE = `import { Phone, usePhone } from '@luwio/phone/react'

function App() {
  return (
    <Phone phone={Phone.parse('+32470123456')}>   {/* one import: parse + provide */}
      <Line />
    </Phone>
  )
}

function Line() {
  const { phone } = usePhone()
  // phone is the active number — the same object Phone.parse() returns.
  return <span>{phone.format('INTERNATIONAL')} — {phone.type} ({phone.country().name})</span>
}`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the provided
// number through usePhone, exactly as an app would.
const EX_REACT = `function Line() {
  const { phone } = usePhone()
  return (
    <p>
      <strong>{phone.format('INTERNATIONAL')}</strong> — {phone.type}
      {' '}· {phone.country().name} (+{phone.dialCode})
    </p>
  )
}

render(
  <Phone phone={Phone.parse('+16502530000')}>
    <Line />
  </Phone>
)`

// A validator: national numbers parse with their Country; E.164 needs none.
const EX_VALIDATE = `const be = Country.new({ code: 'BE' })
const inputs = [
  ['+32470123456'],
  ['0470 12 34 56', be],
  ['+81312345678'],
  ['+3212'],
  ['nope'],
]

function Check() {
  return (
    <ul>
      {inputs.map(([num, country]) => {
        try {
          const p = Phone.parse(num, country)
          return <li key={num}>✓ {num} → {p.format()} ({p.type}, {p.country().name})</li>
        } catch {
          return <li key={num}>✗ {num} — invalid</li>
        }
      })}
    </ul>
  )
}

render(<Check />)`

export function PhonePage() {
  return (
    <DocsLayout slug="phone" sections={SECTIONS}>
      <DocHero slug="phone" />

      <p>
        <code>@luwio/phone</code> parses, validates, classifies and formats phone numbers — a typed
        domain model over Google's{' '}
        <a href="https://github.com/ruimarinho/google-libphonenumber">libphonenumber</a>. Everything
        lives on one <code>Phone</code> object: <code>Phone.parse(...)</code> to build,{' '}
        <code>phone.format()</code> / <code>phone.country()</code> to read, and{' '}
        <code>&lt;Phone&gt;</code> / <code>usePhone</code> for React — mirroring{' '}
        <a href="#/docs/country">@luwio/country</a> and{' '}
        <a href="#/docs/currency">@luwio/currency</a>.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/phone" />
      <Callout>
        <code>@luwio/country</code> and <code>google-libphonenumber</code> are dependencies
        (installed automatically); React 18+ is a peer dependency, needed only for{' '}
        <code>&lt;Phone&gt;</code> / <code>usePhone</code>. Validity and line-type classification
        match libphonenumber exactly.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Build a number with <code>Phone.parse</code>. E.164 input (<code>+32…</code>) needs no
        country; a national-format string takes the <a href="#/docs/country">Country</a> it belongs
        to. It throws on anything invalid, so an instance is always valid — use{' '}
        <code>Phone.isValid</code> for a non-throwing check, and <code>phone.country()</code> to get
        the rich country back.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Phone&gt;</code> with a parsed number, then read it anywhere
        below with <code>usePhone</code> — the same standalone pattern as{' '}
        <code>&lt;Locale&gt;</code> / <code>useLocale</code>. One <code>Phone</code> import both
        parses (<code>Phone.parse</code>) and provides (<code>&lt;Phone&gt;</code>).
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Phone, usePhone }} />

      <h2 id="examples">Examples</h2>
      <p>Validation across E.164, national (with a Country) and invalid inputs:</p>
      <LiveExample code={EX_VALIDATE} scope={{ Phone, Country }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Phone.parse(phone, country?)',
            desc: 'Parse & validate. E.164 needs no country; a national string needs the @luwio/country Country. Throws on invalid input.',
          },
          {
            sig: 'Phone.isValid(phone, country?)',
            desc: 'Non-throwing validity check — true / false.',
          },
          {
            sig: 'phone.countryCode / .dialCode',
            desc: 'ISO region (e.g. BE) and country calling code (e.g. 32).',
          },
          { sig: 'phone.nationalNumber', desc: 'The subscriber number, without the dial code.' },
          {
            sig: 'phone.country()',
            desc: 'The number’s country as a @luwio/country Country (name, currency, borders, …).',
          },
          {
            sig: 'phone.type',
            desc: 'PhoneNumberType — MOBILE, FIXED_LINE, TOLL_FREE, VOIP, … (UNKNOWN if unclassified).',
          },
          {
            sig: 'phone.format(format?)',
            desc: 'E164 (default) · INTERNATIONAL · NATIONAL · RFC3966.',
          },
          {
            sig: '<Phone phone={…}> / usePhone()',
            desc: 'Provider taking a parsed Phone, and the hook returning { phone }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
