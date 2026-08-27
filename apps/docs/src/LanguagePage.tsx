import { Language, useLanguage } from '@luwio/language/react'
import { useState } from 'react'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { LANGUAGE_CATALOGS } from './data/name-catalogs'
import { LiveExample } from './LiveExample'
import { ApiTable, Callout, CodeBlock, DownloadButton, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'react-usage', label: 'React' },
  { id: 'localizing', label: 'Localizing names' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
]

const LOCALIZE_CODE = `import { Languages } from '@luwio/language'
import { useTranslations } from '@luwio/translations'

// Every language carries a stable machine_name — use it as the translation key.
// Load the downloaded catalog for the active language (keys are machine_names):
await translations.add(nl, () => import('./locales/languages.nl.json'))

function LanguageName({ language }) {
  const { translations } = useTranslations()
  return <span>{translations.t(language.machine_name)}</span>  // 'Nederlands' in nl, 'Dutch' in en
}

// A picker over every language, names shown in the active language:
function LanguagePicker() {
  const { translations } = useTranslations()
  return (
    <select>
      {Languages.all().toArray().map((l) => (
        <option key={l.code} value={l.code}>{translations.t(l.machine_name)}</option>
      ))}
    </select>
  )
}`

/**
 * Download ready `machine_name → name` catalogs shipped in @luwio/language's `translations/` dir.
 * English is provided; any other locale downloads the English catalog as a template to translate.
 */
function NameCatalogDownloads() {
  const [code, setCode] = useState('nl')
  const safe = code.trim().toLowerCase() || 'xx'
  const en = LANGUAGE_CATALOGS.en
  const translated = safe in LANGUAGE_CATALOGS
  const localeData = LANGUAGE_CATALOGS[safe] ?? en
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <DownloadButton
        filename="languages.en.json"
        data={en}
        label="Download languages.en.json (English)"
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
        filename={`languages.${safe}.json`}
        data={localeData}
        label={`Download languages.${safe}.json`}
      />
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        {translated ? '✓ provided' : 'template — English values to translate'}
      </span>
    </div>
  )
}

const REACT_CODE = `import { Language, useLanguage } from '@luwio/language/react'

function App() {
  return (
    <Language language={Language.new({ code: 'nl' })}>   {/* a resolved Language */}
      <Label />
    </Language>
  )
}

function Label() {
  const { language } = useLanguage()
  // language is the active Language — the same object Language.new() returns.
  return <p>{language.name} ({language.code} · {language.alpha3})</p>
}

// useLanguage() also works inside <Locale> from @luwio/locale, which provides the
// locale's language under the hood — no separate <Language> needed.`

const EX_REACT = `function Label() {
  const { language } = useLanguage()
  return <p><strong>{language.name}</strong> — {language.code} / {language.alpha3}</p>
}

render(
  <Language language={Language.new({ code: 'nl' })}>
    <Label />
  </Language>
)`

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
        list (639-1 / 639-2 / 639-3) — the foundation <code>@luwio/country</code> and{' '}
        <code>@luwio/locale</code> build on. It ships its own React coupling too: a{' '}
        <code>&lt;Language&gt;</code> provider and a <code>useLanguage</code> hook.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/language" />
      <Callout>
        Zero runtime dependencies. React is a peer dependency — needed for{' '}
        <code>&lt;Language&gt;</code> / <code>useLanguage</code>.
      </Callout>

      <h2 id="usage">Usage</h2>
      <p>
        Look up a language by ISO 639-1 code with <code>Language.new</code>, or by ISO 639-3 / 639-2
        with <code>Language.from</code>. An unknown code throws.
      </p>
      <CodeBlock code={USAGE_CODE} />

      <h2 id="react-usage">React usage</h2>
      <p>
        Wrap a subtree in <code>&lt;Language&gt;</code> with a resolved language, then read it below
        with <code>useLanguage</code> — the same standalone pattern as <code>&lt;Locale&gt;</code> /{' '}
        <code>useLocale</code>. <code>&lt;Locale&gt;</code> renders <code>&lt;Language&gt;</code>{' '}
        under the hood, so <code>useLanguage</code> works inside a locale too.
      </p>
      <CodeBlock code={REACT_CODE} />
      <LiveExample code={EX_REACT} scope={{ Language, useLanguage }} />

      <h2 id="localizing">Localizing language names</h2>
      <p>
        Every language has a stable <code>machine_name</code> slug (e.g. <code>dutch</code>) that
        never changes across translations — so it makes an ideal <strong>translation key</strong>.
        Pair it with <code>@luwio/translations</code> and translate a language's name with{' '}
        <code>t(language.machine_name)</code>.
      </p>
      <CodeBlock code={LOCALIZE_CODE} />
      <p>
        Download a ready catalog of <code>machine_name → name</code> for every language and drop it
        into your project. English is provided; any other locale downloads the English catalog as a
        template (same keys, English values) to translate. Keys are the language's{' '}
        <code>machine_name</code>, so a downloaded file works directly with{' '}
        <code>t(language.machine_name)</code>.
      </p>
      <NameCatalogDownloads />
      <Callout>
        These catalogs live in <code>@luwio/language</code>'s <code>translations/</code> folder —
        kept with the package but excluded from its published bundle, so they add nothing to your
        install. Download the ones you need and commit them in your app.
      </Callout>

      <h2 id="examples">Examples</h2>
      <p>A handful of languages resolved from their ISO 639-1 codes:</p>
      <LiveExample code={EX_LOOKUP} scope={{ Language }} />

      <h2 id="api">API reference</h2>
      <ApiTable
        rows={[
          {
            sig: '<Language language={…}>',
            desc: 'Provider taking a resolved Language (from Language.new / Language.from).',
          },
          {
            sig: 'useLanguage()',
            desc: (
              <>
                Returns <code>{'{ language }'}</code> — the active Language. Works inside{' '}
                <code>&lt;Language&gt;</code> or <code>&lt;Locale&gt;</code>.
              </>
            ),
          },
          {
            sig: 'Languages.all()',
            desc: 'Every language in the dataset as a Languages collection — e.g. to build a machine_name → name catalog or a language picker.',
          },
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
