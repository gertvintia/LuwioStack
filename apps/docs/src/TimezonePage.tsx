import { Timezone } from '@luwio/timezone'
import { Timezone as TimezoneProvider, useTimezone } from '@luwio/timezone/react'
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

const USAGE_CODE = `import { Timezone, Timezones } from '@luwio/timezone'

const tz = Timezone.new({ name: 'Europe/Brussels' })  // unknown names throw
tz.name             // 'Europe/Brussels'
tz.machine_name     // 'europe_brussels'

// Offsets are DST-aware, computed from the runtime's Intl tz database:
tz.offset(new Date('2024-01-15')) // 60   (CET, minutes east of UTC)
tz.offset(new Date('2024-07-15')) // 120  (CEST)
tz.abbreviation(new Date('2024-01-15')) // 'CET' (or 'GMT+1' where unabbreviated)

Timezone.system                   // the runtime's timezone
Timezones.all().toArray().length  // every IANA zone the runtime knows`

const REACT_CODE = `import { Timezone, useTimezone } from '@luwio/timezone/react'

function App() {
  return (
    <Timezone timezone={Timezone.system}>   {/* or Timezone.new({ name: 'Asia/Tokyo' }) */}
      <Clock />
    </Timezone>
  )
}

function Clock() {
  const { timezone } = useTimezone()
  const hours = timezone.offset() / 60
  return <span>{timezone.name} — UTC{hours >= 0 ? '+' : ''}{hours} ({timezone.abbreviation()})</span>
}`

// Live snippet runs in noInline mode: ends with render(<…/>). Reads the provided
// timezone through useTimezone, exactly as an app would.
const EX_REACT = `function Clock() {
  const { timezone } = useTimezone()
  const hours = timezone.offset() / 60
  return (
    <p>
      <strong>{timezone.name}</strong> — UTC{hours >= 0 ? '+' : ''}{hours}
      {' '}({timezone.abbreviation()})
    </p>
  )
}

render(
  <Timezone timezone={Timezone.new({ name: 'Asia/Tokyo' })}>
    <Clock />
  </Timezone>
)`

// A table of a few zones with their winter/summer offsets.
const EX_TABLE = `const names = ['Europe/Brussels', 'America/New_York', 'Asia/Tokyo', 'UTC']
const winter = new Date('2024-01-15T12:00:00Z')
const summer = new Date('2024-07-15T12:00:00Z')

function Table() {
  return (
    <table>
      <tbody>
        {names.map((name) => {
          const tz = Timezone.new({ name })
          return (
            <tr key={name}>
              <td>{name}</td>
              <td>{tz.abbreviation(winter)} {tz.offset(winter) / 60}h</td>
              <td>{tz.abbreviation(summer)} {tz.offset(summer) / 60}h</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

render(<Table />)`

export function TimezonePage() {
  return (
    <DocsLayout slug="timezone" sections={SECTIONS}>
      <DocHero slug="timezone" />

      <p>
        <code>@luwio/timezone</code> is a typed domain model over the IANA timezone list — each
        zone's name, a stable <code>machine_name</code>, and DST-aware <code>offset()</code> /{' '}
        <code>abbreviation()</code> computed from the runtime's <code>Intl</code> database. It
        mirrors <a href="#/docs/country">@luwio/country</a> and{' '}
        <a href="#/docs/currency">@luwio/currency</a>, ships a <code>&lt;Timezone&gt;</code>{' '}
        provider + <code>useTimezone</code> hook, and is the base{' '}
        <a href="#/docs/datetime">@luwio/datetime</a> builds on.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/timezone" />
      <Callout>
        Zero runtime dependencies (offsets come from the platform's <code>Intl</code>). React is a
        peer dependency — needed only for <code>&lt;Timezone&gt;</code> / <code>useTimezone</code>,
        imported from <code>@luwio/timezone/react</code>.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a zone by IANA <code>name</code> with <code>Timezone.new</code> (unknown names
        throw), or take the runtime's with <code>Timezone.system</code>. <code>offset(at?)</code>{' '}
        returns minutes east of UTC at that instant — DST-aware — and <code>abbreviation(at?)</code>{' '}
        the short name.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Timezone&gt;</code> with a resolved zone, then read it anywhere
        below with <code>useTimezone</code> — the same standalone pattern as{' '}
        <code>&lt;Locale&gt;</code> / <code>useLocale</code>. The domain (React-free) lives at{' '}
        <code>@luwio/timezone</code>; the provider + hook at <code>@luwio/timezone/react</code>.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Timezone: TimezoneProvider, useTimezone }} />

      <h2 id="examples">Examples</h2>
      <p>Winter vs summer offsets for a few zones — DST handled by the runtime:</p>
      <LiveExample code={EX_TABLE} scope={{ Timezone }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: 'Timezone.new({ name })',
            desc: 'Look up by IANA name (e.g. Europe/Brussels). Unknown names throw.',
          },
          { sig: 'Timezone.system', desc: 'The runtime’s timezone (from Intl).' },
          {
            sig: 'timezone.offset(at?)',
            desc: 'Minutes east of UTC at `at` (DST-aware); defaults to now. 60 = CET, 120 = CEST, -300 = US Eastern.',
          },
          {
            sig: 'timezone.abbreviation(at?)',
            desc: 'Short zone name at `at`, e.g. EST / EDT (or GMT+1 where unabbreviated).',
          },
          { sig: 'timezone.name / .machine_name', desc: 'IANA identifier and a stable slug.' },
          {
            sig: 'Timezones.all() / .empty().add(…)',
            desc: 'The whole zone list, or an immutable collection.',
          },
          {
            sig: '<Timezone timezone={…}> / useTimezone()',
            desc: 'From @luwio/timezone/react — the provider and the hook returning { timezone }.',
          },
        ]}
      />
    </DocsLayout>
  )
}
