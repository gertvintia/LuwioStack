import { PRODUCT_NAME, REPO_URL, SUITE_NAME } from './brand'
import { ConfigPage } from './ConfigPage'
import { PACKAGES } from './content'
import { GoogleAnalyticsPage } from './GoogleAnalyticsPage'
import { GoogleMapsPage } from './GoogleMapsPage'
import { HomePage } from './HomePage'
import { GitHubIcon, LuwioWordmark } from './icons'
import { LocalePage } from './LocalePage'
import { useHashRoute } from './router'
import { SkeletonPage } from './SkeletonPage'
import { StoragePage } from './StoragePage'

function Wordmark() {
  return (
    <a className="brand" href="#/" aria-label={SUITE_NAME}>
      <LuwioWordmark className="logo" />
      <span className="stack">Stack</span>
    </a>
  )
}

function Nav({ route }: { route: string }) {
  return (
    <nav className="nav">
      <div className="wrap">
        <Wordmark />
        <div className="nav-links">
          {PACKAGES.filter((p) => p.status !== 'skeleton').map((p) => (
            <a
              key={p.slug}
              className={`pkg-link${route === `/docs/${p.slug}` ? ' active' : ''}`}
              href={`#/docs/${p.slug}`}
            >
              {p.slug}
              {p.status === 'done' && (
                <span className="nav-done" title="Complete">
                  ✓
                </span>
              )}
            </a>
          ))}
          <a className="btn btn-ghost" href={REPO_URL}>
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <Wordmark />
        <span className="muted">
          MIT licensed · the composable React toolkit behind {PRODUCT_NAME}
        </span>
        <a href={REPO_URL} style={{ color: 'var(--text-dim)' }} aria-label="GitHub">
          <GitHubIcon />
        </a>
      </div>
    </footer>
  )
}

function renderRoute(route: string) {
  if (route.startsWith('/docs/')) {
    const slug = route.slice('/docs/'.length)
    switch (slug) {
      case 'locale':
        return <LocalePage />
      case 'config':
        return <ConfigPage />
      case 'storage':
        return <StoragePage />
      case 'google-maps':
        return <GoogleMapsPage />
      case 'google-analytics':
        return <GoogleAnalyticsPage />
      default:
        // router, ui, datetime, money — driven by shared skeleton page.
        return <SkeletonPage slug={slug} />
    }
  }
  return <HomePage />
}

export function App() {
  const route = useHashRoute()
  return (
    <div className="page">
      <Nav route={route} />
      {renderRoute(route)}
      <Footer />
    </div>
  )
}
