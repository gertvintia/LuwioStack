import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'commands', label: 'Commands' },
  { id: 'template', label: 'What you get' },
]

const USAGE = `# no install needed
pnpm dlx @luwio/cli create my-app
# or: npx @luwio/cli create my-app

cd my-app
pnpm install
pnpm dev`

const WORKSPACE = `# from the monorepo root
luwio create apps/demo --modules config,storage --workspace
pnpm install        # links workspace:* deps
pnpm --filter demo dev`

const ADD = `# in your app directory
luwio add                 # interactive — pick from what you don't have yet
luwio add phone theme     # or name the modules directly
pnpm install`

const TREE = `my-app/                        # vertical slice — grouped by feature, not by layer
├─ index.html
├─ vite.config.ts              # react() + luwioRouter({ routesDir: 'src' })
├─ src/
│  ├─ main.tsx                 # async bootstrap: await localeConfig.load() → build router → mount
│  ├─ app/                     # cross-cutting wiring
│  │  ├─ router.ts             # createAppRouter(config) — built at runtime from the config
│  │  ├─ locale-config.ts      # runtime config loader (locales + default), via @luwio/bootstrap
│  │  ├─ ConfigUpdateBanner.tsx  # "new configuration available — Reload" nudge
│  │  ├─ translations.ts       # createTranslations() + merges every feature's messages.ts
│  │  ├─ translations.route.tsx  # loads + activates the catalog (layout)
│  │  ├─ shell.route.tsx       # shared chrome (layout)
│  │  └─ Shell.tsx             # language switcher via useRouter()
│  └─ features/
│     └─ home/                 # one folder per slice
│        ├─ home.route.tsx     # the locale index, aliased per locale
│        ├─ Home.tsx           # useTranslations().t(…)
│        └─ messages.ts        # this slice's strings, per language
└─ package.json`

const COMMANDS = [
  {
    sig: 'luwio create <dir>',
    desc: 'Scaffold a new app into <dir>. Prompts for a directory and extra modules if omitted.',
  },
  { sig: 'luwio <dir>', desc: 'Shorthand for create.' },
  {
    sig: 'luwio add [modules]',
    desc: 'Add @luwio modules to the app in the current directory. Prompts with the not-yet-installed modules to pick from if none are given.',
  },
  { sig: '-t, --template <name>', desc: 'Template to scaffold (default: app).' },
  {
    sig: '-m, --modules <list>',
    desc: 'Extra @luwio modules to add (comma-separated), e.g. config,storage — skips the prompt.',
  },
  {
    sig: '-w, --workspace',
    desc: 'Use workspace:* for @luwio deps so a generated app resolves against this monorepo (smoke-testing).',
  },
  { sig: '-y, --yes', desc: 'Accept defaults; don’t prompt.' },
  { sig: '-h, --help / -v, --version', desc: 'Show help / version.' },
]

export function CliPage() {
  return (
    <DocsLayout slug="cli" sections={SECTIONS}>
      <DocHero slug="cli" />

      <Callout>
        <code>@luwio/cli</code> is a tiny, dependency-free scaffolder (Node built-ins only). One
        command gives you a runnable, locale-routed React app wired with <code>@luwio/router</code>,{' '}
        <code>@luwio/locale</code> and <code>@luwio/translations</code>.
      </Callout>

      <h2 id="usage">Usage</h2>
      <InstallBar command="pnpm dlx @luwio/cli create my-app" />
      <CodeBlock code={USAGE} lang="bash" />

      <h2 id="commands">Commands</h2>
      <ApiTable rows={COMMANDS} />
      <Callout>
        Running interactively, <code>luwio</code> asks which optional <code>@luwio</code> modules to
        add (config, storage, country, datetime, money, phone, theme, google-maps,
        google-analytics). Pass <code>--modules</code> to skip the prompt, or <code>--yes</code> for
        none.
      </Callout>

      <h3 id="add">Add modules later</h3>
      <p>
        Already scaffolded? Run <code>luwio add</code> from your app directory to pull in more
        modules. It reads your <code>package.json</code> and offers only the ones you don’t already
        have — the same catalog the bootstrap prompt uses:
      </p>
      <CodeBlock code={ADD} lang="bash" />
      <Callout>
        <code>luwio add</code> writes the new <code>@luwio/*</code> entries to{' '}
        <code>package.json</code> (matching <code>workspace:*</code> if your app already uses it) —
        run your package manager’s install afterwards. Names already present or unknown are reported
        and skipped.
      </Callout>
      <p>
        <strong>Testing inside this monorepo:</strong> scaffold into <code>apps/</code> with{' '}
        <code>--workspace</code> so the app uses <code>workspace:*</code> instead of published
        versions, then install from the repo root:
      </p>
      <CodeBlock code={WORKSPACE} lang="bash" />

      <h2 id="template">What you get</h2>
      <p>
        The <code>app</code> template is a small but complete Luwio app in a{' '}
        <strong>vertical-slice</strong> layout — code grouped by feature, with cross-cutting wiring
        in <code>app/</code>:
      </p>
      <CodeBlock code={TREE} lang="text" />
      <Callout>
        <code>/</code> redirects to the default locale; each locale gets its own sub-tree (
        <code>/en-US</code>, <code>/nl-NL</code>). Add a feature by dropping a{' '}
        <code>src/features/&lt;name&gt;/</code> folder with a <code>*.route.tsx</code>, its
        component, and a <code>messages.ts</code> — the route is auto-discovered and its strings
        auto-merged, no central files to touch.
      </Callout>
      <p>
        The locale set isn't hard-coded — it's loaded from an API at boot via{' '}
        <a href="#/docs/bootstrap">
          <code>@luwio/bootstrap</code>
        </a>{' '}
        (that's what <code>main.tsx</code> and <code>locale-config.ts</code> wire up), so the same
        build serves different markets without a rebuild.
      </p>
    </DocsLayout>
  )
}
