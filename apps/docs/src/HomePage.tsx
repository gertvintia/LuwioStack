import type { CSSProperties, ReactNode } from 'react'
import { PRODUCT_NAME, SUITE_NAME } from './brand'
import { VISIBLE_PACKAGES } from './content'
import { BoxIcon, FeatherIcon, ServerIcon, TypeIcon } from './icons'
import { LiveDemo } from './LiveDemo'
import { CodeBlock, InstallBar } from './ui'

const FEATURES = [
  {
    icon: <BoxIcon />,
    title: 'Standalone',
    text: 'Each package installs on its own. No meta-package, no forced dependencies.',
  },
  {
    icon: <TypeIcon />,
    title: 'Fully typed',
    text: 'Written in TypeScript with inference-first APIs. Types ship in every package.',
  },
  {
    icon: <FeatherIcon />,
    title: 'Tiny & tree-shakeable',
    text: 'ESM + CJS builds, marked side-effect-free. Ship only what you import.',
  },
  {
    icon: <ServerIcon />,
    title: 'SSR-safe',
    text: 'Guards around browser APIs mean the hooks render on the server without a fuss.',
  },
]

const DEMO_CODE = `// one app, three packages
const { ConfigProvider } = createConfig({ appName: 'Luwio Demo' })

<ConfigProvider>
  <Locale locale={Locale.new({ languageOrLocale: 'nl-BE' })}>
    const { locale } = useLocale()         // locale.country() → Belgium · +32
    const [n, setN] = useLocalStorage('count', 0)  // persisted
  </Locale>
</ConfigProvider>`

function Section({
  id,
  title,
  lead,
  children,
}: {
  id?: string
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <section className="section" id={id}>
      <div className="wrap">
        <div className="section-head">
          <h2>{title}</h2>
          <p>{lead}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Composable React tools
          </span>
          <h1>
            Solve common React problems.
            <br />
            <span className="grad">Standalone, better together.</span>
          </h1>
          <p className="lead">
            {SUITE_NAME} is the family of small, focused React packages that powers {PRODUCT_NAME} —
            locale, config, storage and more. Use one, or compose them into a toolkit that fits your
            app.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#packages">
              Explore packages
            </a>
            <a className="btn btn-ghost" href="#demo">
              See it live
            </a>
          </div>
          <InstallBar command="pnpm dlx @luwio/cli create my-app" />
          <p className="hero-note">
            Scaffold a locale-routed app, then pick the <code>@luwio/*</code> modules you want — or
            add more later with <code>luwio add</code>.
          </p>
        </div>
      </header>

      <Section
        id="packages"
        title="One problem each"
        lead="Every package is published independently to npm. React packages list it only as a peer dependency; some are still skeletons taking shape."
      >
        <div className="pkg-grid">
          {VISIBLE_PACKAGES.map((p) => (
            <a
              className={`pkg-card${p.status === 'skeleton' ? ' is-skeleton' : ''}`}
              key={p.slug}
              href={`#/docs/${p.slug}`}
              style={{ '--accent': p.accent } as CSSProperties}
            >
              <div className="pkg-icon">{p.icon}</div>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <div className="pkg-foot">
                {p.status === 'skeleton' ? (
                  <span className="badge badge-skeleton">Skeleton</span>
                ) : p.status === 'done' ? (
                  <span className="badge badge-done">Stable ✓</span>
                ) : (
                  <span className="badge">{p.gzip} gzip</span>
                )}
                <span className="go">Read docs →</span>
              </div>
            </a>
          ))}
        </div>
      </Section>

      <Section
        id="demo"
        title="Better together"
        lead="This live widget composes all three packages — config names it, locale resolves the country, storage remembers your choices across reloads."
      >
        <div className="demo-grid">
          <LiveDemo />
          <CodeBlock code={DEMO_CODE} lang="tsx" />
        </div>
        <p className="hint">
          Tip: change the locale or counter, then refresh — @luwio/storage keeps both.
        </p>
      </Section>

      <Section
        id="why"
        title={`Why ${SUITE_NAME}`}
        lead="Small building blocks, shared conventions, zero lock-in."
      >
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat" key={f.title}>
              <div className="ic">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
