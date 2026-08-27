import { BootstrapPage } from './BootstrapPage'
import { PRODUCT_NAME, REPO_URL, SUITE_NAME } from './brand'
import { CliPage } from './CliPage'
import { ConfigPage } from './ConfigPage'
import { CountryPage } from './CountryPage'
import { CurrencyPage } from './CurrencyPage'
import { EidPage } from './EidPage'
import { GoogleAnalyticsPage } from './GoogleAnalyticsPage'
import { GoogleMapsPage } from './GoogleMapsPage'
import { HomePage } from './HomePage'
import { IbanPage } from './IbanPage'
import { GitHubIcon, LuwioWordmark } from './icons'
import { LanguagePage } from './LanguagePage'
import { LocalePage } from './LocalePage'
import { NationalIdPage } from './NationalIdPage'
import { PhonePage } from './PhonePage'
import { RouterPage } from './RouterPage'
import { useHashRoute } from './router'
import { SkeletonPage } from './SkeletonPage'
import { StoragePage } from './StoragePage'
import { TimezonePage } from './TimezonePage'
import { TranslationsPage } from './TranslationsPage'

function Wordmark() {
  return (
    <a className="brand" href="#/" aria-label={SUITE_NAME}>
      <LuwioWordmark className="logo" />
      <span className="stack">Stack</span>
    </a>
  )
}

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap">
        <Wordmark />
        <div className="nav-links">
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
      case 'cli':
        return <CliPage />
      case 'bootstrap':
        return <BootstrapPage />
      case 'router':
        return <RouterPage />
      case 'locale':
        return <LocalePage />
      case 'country':
        return <CountryPage />
      case 'language':
        return <LanguagePage />
      case 'currency':
        return <CurrencyPage />
      case 'timezone':
        return <TimezonePage />
      case 'phone':
        return <PhonePage />
      case 'iban':
        return <IbanPage />
      case 'national-id':
        return <NationalIdPage />
      case 'eid':
        return <EidPage />
      case 'translations':
        return <TranslationsPage />
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
      <Nav />
      {renderRoute(route)}
      <Footer />
    </div>
  )
}
