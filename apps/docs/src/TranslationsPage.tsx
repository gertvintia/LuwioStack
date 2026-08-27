import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'create', label: 'Create & provide' },
  { id: 'translate', label: 'useTranslations' },
  { id: 'add', label: 'Add & activate' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'route', label: 'With a route' },
  { id: 'api', label: 'API reference' },
]

const CREATE = `// translations.ts
import { createTranslations } from '@luwio/translations'

export const translations = createTranslations() // no config — add languages with add()`

const PROVIDER = `// App.tsx — hand the object to the provider, like <RouterProvider router={router} />
import { Translations } from '@luwio/translations'
import { translations } from './translations'

function App() {
  return (
    <Translations translations={translations}>
      <Site />
    </Translations>
  )
}`

const TRANSLATE = `import { Trans, useTranslations } from '@luwio/translations'

function Greeting() {
  const { translations } = useTranslations()  // re-renders when the active language changes
  return (
    <>
      <h1>{translations.t('greeting')}</h1>
      <p><Trans id="welcome" message="Welcome, {name}" values={{ name: 'Gert' }} /></p>
    </>
  )
}`

const ADD = `import { Language } from '@luwio/language'

// add / activate / isLoaded take an ILanguage — always a valid @luwio/language.
const nl = Language.new({ code: 'nl' })
const fr = Language.new({ code: 'fr' })

// A catalog is a flat message map (id -> string), as an API returns it:
await translations.add(nl, { greeting: 'Hallo' })                                       // inline
await translations.add(fr, () => import('./locales/fr').then((m) => m.messages))        // file import
await translations.add(fr, () => fetch(\`/api/i18n/\${fr.code}\`).then((r) => r.json())) // API

translations.activate(nl)      // switch to a loaded language
translations.isLoaded(fr)      // true
translations.languages         // the ILanguage[] added so far`

const TOKENS = `import { toMessages } from '@luwio/translations'

// tokens.ts — a local, typed id registry: { <name>: { key, defaultValue } }.
export const tokens = {
  help: { key: 'help', defaultValue: 'Help' },
  home: { key: 'home', defaultValue: 'Home' },
}

// Reference ids type-safely instead of magic strings — the whole point of tokens:
translations.t(tokens.help.key)          // 'Help' (or the loaded translation)
<Trans id={tokens.home.key} />

// Pass the whole token to t() to fall back to its defaultValue when the active
// catalog has no entry for that key:
translations.t(tokens.help)              // loaded translation, else 'Help'

// The API returns flat messages; tokens can also seed the source-language catalog:
await translations.add(en, toMessages(tokens))   // { help: 'Help', home: 'Home' }
await translations.add(nl, () => fetch(\`/api/i18n/nl\`).then((r) => r.json()))`

const PRELOAD = `// Preload = add() without activate(). Warm languages ahead of time so a later
// switch is instant (the catalog is already cached — no fetch, no fallback).
const nl = Language.new({ code: 'nl' })
const fr = Language.new({ code: 'fr' })

void Promise.all([
  translations.add(nl, () => fetch(\`/api/i18n/\${nl.code}\`).then((r) => r.json())),
  translations.add(fr, () => fetch(\`/api/i18n/\${fr.code}\`).then((r) => r.json())),
])

// …later, when the user switches — synchronous, no wait:
translations.activate(fr)`

const ROUTE = `// routes/shell.route.tsx — a @luwio/router layout route
import { createRoute } from '@luwio/router'
import { Shell } from '../components/Shell'
import { translations } from '../translations'

// @luwio/router resolved the locale into route context. Add + activate before children render —
// awaited, so translations are ready; cached, so navigating within the language never reloads.
export default createRoute({
  id: 'shell',
  layout: true,
  component: Shell,
  beforeLoad: async ({ context }) => {
    const language = context.locale.language() // an ILanguage from @luwio/language
    await translations.add(language, () => fetch(\`/api/i18n/\${language.code}\`).then((r) => r.json()))
    translations.activate(language)
  },
})`

const API = [
  {
    sig: 'createTranslations()',
    desc: 'Create the store — no config. Languages are added ad-hoc with add() (including any you want up front).',
  },
  {
    sig: 'translations.add(language, source)',
    desc: 'Add a catalog for an ILanguage from a CatalogSource — flat messages ({ id: string }, the API shape) or a token map ({ key, defaultValue }), delivered inline, via `() => import(…)`, `() => fetch(…)`, or a promise. Awaitable, cached and deduped (fetched at most once). The language must be a valid @luwio/language.',
  },
  {
    sig: 'translations.activate(language)',
    desc: 'Make an ILanguage the active one (must be a valid @luwio/language).',
  },
  {
    sig: 'translations.isLoaded(language) / .languages',
    desc: 'Whether an ILanguage’s catalog is loaded, and the languages added so far (ILanguage[]).',
  },
  {
    sig: 'translations.t(id | token, values?)',
    desc: 'Runtime translation by message id (e.g. tokens.help.key), or by a token (its defaultValue is the fallback when the key is not in the catalog). For JSX, prefer `<Trans>`.',
  },
  {
    sig: 'toMessages(catalog)',
    desc: 'Normalize a catalog to Lingui messages — a token map becomes { [key]: defaultValue }; flat messages pass through. Handy to seed a source-language catalog from tokens.',
  },
  {
    sig: 'Translations',
    desc: 'The provider: <Translations translations={…}> — like <RouterProvider router={…}> (named just Translations, the <Locale> convention).',
  },
  {
    sig: 'useTranslations()',
    desc: 'Returns { translations } (like useRouter → { router }) — access add / activate / t. Re-renders when the active language changes. Throws outside a provider.',
  },
  {
    sig: 'Trans · useLingui',
    desc: 'Re-exported from @lingui/react so everything comes from one place.',
  },
]

export function TranslationsPage() {
  return (
    <DocsLayout slug="translations" sections={SECTIONS}>
      <DocHero slug="translations" />

      <Callout>
        Built on <code>@lingui/core</code> and <code>@lingui/react</code> (peer dependencies).
        Create a <code>Translations</code> object, hand it to <code>&lt;Translations&gt;</code>, and
        reach it with <code>useTranslations()</code> to add catalogs at runtime (cached), switch
        language, or translate. It knows nothing about routing.
      </Callout>

      <p>
        Languages are added <strong>ad-hoc</strong> — no upfront list required. You <code>add</code>{' '}
        and <code>activate</code> an <code>ILanguage</code> from <code>@luwio/language</code>, so
        every language is valid by construction. Catalogs load at runtime (fetch an API, import a
        chunk) and are <strong>cached</strong>, so a language is fetched at most once and never
        re-loads on switch. The shape mirrors TanStack Router: build the object once, pass it to a
        provider, use it through a hook.
      </p>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/translations @lingui/core @lingui/react" />
      <p>
        <code>@lingui/core</code>, <code>@lingui/react</code> and <code>react</code> (18+) are peer
        dependencies. Use the Lingui CLI/config in your app to extract and compile catalogs.
      </p>

      <h2 id="create">Create &amp; provide</h2>
      <p>
        Create a <code>Translations</code> store — no config — and hand the object to the provider.
        Add languages with <code>add()</code>, including any you want up front.
      </p>
      <CodeBlock code={CREATE} lang="ts" />
      <CodeBlock code={PROVIDER} />

      <h2 id="translate">useTranslations</h2>
      <p>
        <code>useTranslations()</code> returns <code>{'{ translations }'}</code> — like{' '}
        <code>useRouter()</code> returns <code>{'{ router }'}</code> — and re-renders when the
        active language changes. Use <code>t()</code> or <code>&lt;Trans&gt;</code> to translate.
      </p>
      <CodeBlock code={TRANSLATE} />

      <h2 id="add">Add &amp; activate</h2>
      <p>
        <code>add</code>, <code>activate</code> and <code>isLoaded</code> take an{' '}
        <code>ILanguage</code> — so a language is always valid. Everything is cached and deduped: an
        already-added language is never fetched again, and concurrent adds of the same language
        share one request.
      </p>
      <CodeBlock code={ADD} lang="ts" />

      <p>
        <strong>Preload</strong> by calling <code>add()</code> without <code>activate()</code> —
        warm the languages a user is likely to switch to (after first paint, on idle, or on hover)
        so the switch itself is synchronous, with no fetch and no loading state.
      </p>
      <CodeBlock code={PRELOAD} lang="ts" />

      <h2 id="tokens">Tokens</h2>
      <p>
        Your API returns a flat message map, but string ids scattered through components are
        error-prone. Define a <strong>token map</strong> —{' '}
        <code>{'{ help: { key, defaultValue } }'}</code> — as a local, typed id registry and call{' '}
        <code>t(tokens.help.key)</code> instead of <code>t('help')</code>. Pass the whole token to{' '}
        <code>t()</code> to fall back to its <code>defaultValue</code> when the active catalog has
        no entry for that key, and use <code>toMessages(tokens)</code> to seed the source-language
        catalog (<code>add()</code> also accepts a token map directly).
      </p>
      <CodeBlock code={TOKENS} lang="ts" />

      <h2 id="route">With a route</h2>
      <p>
        <code>@luwio/translations</code> is routing-agnostic — this is just how you wire it. With{' '}
        <code>@luwio/router</code>, the locale is already in route context, so a layout route adds +
        activates the catalog in <code>beforeLoad</code>. Because it's awaited, the route waits for
        translations; because it's cached, moving between pages in the same language never
        re-fetches.
      </p>
      <CodeBlock code={ROUTE} />
      <Callout>
        The pattern layers cleanly: <code>@luwio/router</code>'s locale sub-tree provides the{' '}
        <code>&lt;Locale&gt;</code> context and puts the <code>ILocale</code> in context; a layout
        route adds + activates the matching catalog before its children render.
      </Callout>

      <h2 id="api">API reference</h2>
      <ApiTable rows={API} />
    </DocsLayout>
  )
}
