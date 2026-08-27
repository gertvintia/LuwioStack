import { HeadContent, Outlet, useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'
import type { MouseEvent } from 'react'
import { useFavorites } from '../shared/favorites'
import { useSession } from '../shared/session'
import { ConfigUpdateBanner } from './ConfigUpdateBanner'
import { LuwioWordmark } from './Logo'

// Nav labels live with their feature (vertical slice) — the Shell just references the message ids.
const NAV = [
  { id: 'explore', key: 'explore.nav' },
  { id: 'favorites', key: 'favorites.nav' },
  { id: 'about', key: 'about.nav' },
]

export function Shell() {
  const { router } = useRouter()
  const { translations } = useTranslations()
  const { favorites } = useFavorites()
  const user = useSession()
  const activeId = router.routeId ?? 'home'

  const locale = router.locale
  const available = new Set(router.availableLocales(activeId).map((l) => l.code))

  // Links carry a real href (SEO, middle-click, right-click) but plain left-clicks route in-app via
  // useRouter().navigate — no <Link> component needed. Let modified clicks fall through to the href.
  const go = (id: string) => (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    e.preventDefault()
    router.navigate({ to: id, locale })
  }

  return (
    <div className="app">
      {/* Writes each route's head() tags (localized <title>) into the document head. */}
      <HeadContent />
      {/* Shows a reload nudge when the backend publishes a new config to an already-open tab. */}
      <ConfigUpdateBanner />
      <div className="glow" />
      <header className="topbar">
        <div className="bar">
          <a
            href={router.href({ id: 'home', locale })}
            onClick={go('home')}
            className="wordmark"
            aria-label="Luwio Demo"
          >
            <LuwioWordmark className="logo" />
            <span className="suffix">Demo</span>
          </a>

          <nav className="tabs" aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={router.href({ id: item.id, locale })}
                onClick={go(item.id)}
                className={item.id === activeId ? 'tab active' : 'tab'}
              >
                {translations.t(item.key)}
                {item.id === 'favorites' && favorites.length > 0 && (
                  <span className="badge">{favorites.length}</span>
                )}
              </a>
            ))}
          </nav>

          {/* Language switch — imperative navigation via useRouter(); locales where the current page
              has no alias (router.availableLocales) are disabled. */}
          <nav className="seg" aria-label="Language">
            {router.locales.map((l) => (
              <button
                type="button"
                key={l.code}
                disabled={!available.has(l.code)}
                title={available.has(l.code) ? undefined : 'Not available for this page'}
                onClick={() => router.navigate({ to: activeId, locale: l })}
                className={l.code === locale.code ? 'seg-btn active' : 'seg-btn'}
              >
                {l.language_code}
              </button>
            ))}
          </nav>

          {/* Auth state, reflected in the chrome: the GitHub avatar when signed in (→ account),
              a Sign in pill otherwise (→ the public sign-in page). Both re-render via useSession()
              the instant the session changes — including sign-out from the account page. */}
          {user ? (
            <a
              href={router.href({ id: 'account', locale })}
              onClick={go('account')}
              className={activeId === 'account' ? 'avatar-link active' : 'avatar-link'}
              title={user.name}
              aria-label={user.name}
            >
              <img className="avatar sm" src={user.avatarUrl} alt="" />
            </a>
          ) : (
            <a
              href={router.href({ id: 'signin', locale })}
              onClick={go('signin')}
              className={activeId === 'signin' ? 'tab active' : 'tab'}
            >
              {translations.t('signin.nav')}
            </a>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="foot">
        <span>
          One app, seven complete <strong>@luwio</strong> packages — router, locale, country,
          language, config, storage, translations.
        </span>
      </footer>
    </div>
  )
}
