import { Language } from '@luwio/language'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const USAGE_CODE = `import { Language, Languages } from '@luwio/language'

const nl = Language.new({ code: 'nl' })  // ISO 639-1
nl.name        // 'Dutch'
nl.code        // 'nl'  (alias of alpha2)
nl.alpha2      // 'nl'
nl.alpha3      // 'nld' (ISO 639-3, falls back to 639-2)

// Look up by ISO 639-3 too:
Language.from({ code: 'nld', format: 'alpha3' }).name // 'Dutch'

// Immutable, de-duplicated collections:
Languages.empty()
  .add(Language.new({ code: 'nl' }))
  .add(Language.new({ code: 'fr' }))
  .size // 2`

// Live snippet runs in noInline mode: ends with render(<…/>). Avoids template
// literals so it can live inside this template-string constant.
const EX_LOOKUP = `function Lookup() {
  const codes = ['nl', 'fr', 'de', 'ja', 'ar']
  return (
    <ul>
      {codes.map((c) => {
        const l = Language.new({ code: c })
        return <li key={c}>{l.code} → {l.name} ({l.alpha3})</li>
      })}
    </ul>
  )
}

render(<Lookup />)`

export function LanguagePage() {
  return (
    <DocsLayout slug="language" sections={SECTIONS}>
      <DocHero slug="language" />

      <p>
        <code>@luwio/language</code> is a small, immutable domain model over the ISO 639 language
        list (639-1 / 639-2 / 639-3). It has no dependencies and no framework requirement — it's the
        foundation <code>@luwio/country</code> and <code>@luwio/locale</code> build on.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/language" />
      <Callout>
        Dependency-free and framework-agnostic — usable in any JavaScript or TypeScript project.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a language by ISO 639-1 code with <code>Language.new</code>, or by ISO 639-3 / 639-2
        with <code>Language.from</code>. An unknown code throws.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="examples">Examples</h2>
      <p>A handful of languages resolved from their ISO 639-1 codes:</p>
      <LiveExample code={EX_LOOKUP} scope={{ Language }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          { sig: 'Language.new({ code })', desc: 'Look up by ISO 639-1 (alpha-2) code.' },
          {
            sig: 'Language.from({ code, format })',
            desc: 'Look up by alpha-2 (default) or alpha-3.',
          },
          {
            sig: 'language.code / .alpha2 / .alpha3',
            desc: 'ISO 639-1 (code = alpha2) and the ISO 639-3/2 code.',
          },
          { sig: 'language.name / .machine_name', desc: 'Display name and a stable slug.' },
          {
            sig: 'Languages.empty().add(…)',
            desc: 'An immutable, de-duplicated language collection.',
          },
        ]}
      />
    </DocsLayout>
  )
}
