import { packageBySlug } from './content'
import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

interface SkeletonDoc {
  /** One line on what the package is for and what's still coming. */
  intro: string
  /** Dependency note shown under Installation. */
  dependency: string
  /** Language tag for the usage code block. */
  lang: string
  /** A short, real usage example against the current (minimal) API. */
  code: string
  /** The exports that exist today. */
  api: { sig: string; desc: string }[]
}

const DOCS: Record<string, SkeletonDoc> = {
  router: {
    intro:
      'Typed routing primitives for React. Today it ships a single type-preserving helper; a matcher, a <Router> component and navigation hooks are on the roadmap.',
    dependency: 'React 18+ is a peer dependency.',
    lang: 'tsx',
    code: `import { defineRoutes } from '@luwio/router'

export const routes = defineRoutes([
  { path: '/', render: () => <Home /> },
  { path: '/users/:id', render: (params) => <User id={params.id} /> },
])`,
    api: [
      {
        sig: 'defineRoutes(routes)',
        desc: 'Identity helper that preserves the literal route types.',
      },
      { sig: 'RouteDefinition', desc: 'The shape of a single route: { path, render }.' },
      { sig: 'version', desc: 'Current package version string.' },
    ],
  },
  ui: {
    intro:
      'Headless UI helpers and components for React. It starts with a couple of primitives and will grow into a small, unstyled component set.',
    dependency: 'React 18+ is a peer dependency.',
    lang: 'tsx',
    code: `import { cn, VisuallyHidden } from '@luwio/ui'

function SaveButton({ active }: { active: boolean }) {
  return (
    <button className={cn('btn', active && 'btn--active')}>
      Save
      <VisuallyHidden> your changes</VisuallyHidden>
    </button>
  )
}`,
    api: [
      { sig: 'cn(...classes)', desc: 'Join truthy class names into one string.' },
      { sig: '<VisuallyHidden>', desc: 'Hide content visually but keep it for screen readers.' },
    ],
  },
  datetime: {
    intro:
      'Small, dependency-free date & time helpers built on the platform Intl APIs. Parsing and relative-time formatting are planned.',
    dependency: 'No dependencies, no framework required.',
    lang: 'ts',
    code: `import { formatDate, daysBetween, toISO } from '@luwio/datetime'

formatDate('2026-08-12', 'en-US')        // 'Aug 12, 2026'
daysBetween('2026-08-12', '2026-08-15')  // 3
toISO(Date.now())                        // '2026-08-12T…Z'`,
    api: [
      {
        sig: 'formatDate(date, locale?, options?)',
        desc: 'Locale-aware formatting via Intl.DateTimeFormat.',
      },
      { sig: 'daysBetween(a, b)', desc: 'Whole-day difference b − a.' },
      { sig: 'toISO(date)', desc: 'ISO-8601 string for any date input.' },
    ],
  },
  money: {
    intro:
      'Currency formatting and safe minor-unit math. Money is stored as integer cents to avoid floating-point drift. Allocation and rounding helpers are planned.',
    dependency: 'No dependencies, no framework required.',
    lang: 'ts',
    code: `import { money, add, formatMoney } from '@luwio/money'

const price = money(1999, 'EUR')            // €19.99, stored as 1999
const total = add(price, money(200, 'EUR'))

formatMoney(total, 'nl-BE')                 // '€ 21,99'
formatMoney(money(1999, 'USD'), 'en-US')    // '$19.99'`,
    api: [
      { sig: 'money(cents, currency)', desc: 'Construct a Money value from integer minor units.' },
      { sig: 'add(a, b)', desc: 'Add two amounts of the same currency.' },
      { sig: 'formatMoney(value, locale?)', desc: 'Format via Intl.NumberFormat.' },
    ],
  },
  theme: {
    intro:
      'Light / dark / system theme management for React. Today it ships a provider + hook that reflect the resolved theme on <html>; design tokens and an SSR no-flash script are planned.',
    dependency: 'React 18+ is a peer dependency.',
    lang: 'tsx',
    code: `import { ThemeProvider, useTheme } from '@luwio/theme'

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      {theme} ({resolvedTheme})
    </button>
  )
}`,
    api: [
      {
        sig: '<ThemeProvider defaultTheme? attribute?>',
        desc: 'Provides + applies the theme; writes <html data-theme>.',
      },
      { sig: 'useTheme()', desc: 'Returns { theme, resolvedTheme, setTheme }.' },
    ],
  },
}

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API reference' },
]

export function SkeletonPage({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug)
  const doc = DOCS[slug]
  if (!pkg || !doc) return null

  return (
    <DocsLayout slug={slug} sections={SECTIONS}>
      <DocHero slug={slug} />

      <Callout>
        <strong>Skeleton package.</strong> The API below is intentionally minimal and will grow. It
        is published to reserve the <code>{pkg.name}</code> name on npm — expect changes before{' '}
        <code>1.0</code>.
      </Callout>

      <p>{doc.intro}</p>

      <h2 id="installation">Installation</h2>
      <InstallBar command={pkg.install} />
      <p>{doc.dependency}</p>

      <h2 id="usage">Usage</h2>
      <CodeBlock code={doc.code} lang={doc.lang} />

      <h2 id="api">API reference</h2>
      <ApiTable rows={doc.api} />
    </DocsLayout>
  )
}
