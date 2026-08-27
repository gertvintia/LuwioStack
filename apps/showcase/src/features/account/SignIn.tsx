import { useRouteQuery, useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'
import { useState } from 'react'
import { signInWithGitHub, useSession } from '../../shared/session'

// GitHub's mark, inlined so the button is self-contained (no asset/network dependency).
function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function SignIn() {
  const { router } = useRouter()
  const { translations } = useTranslations()
  const { redirect } = useRouteQuery<{ redirect?: string }>()
  const user = useSession()
  const [busy, setBusy] = useState(false)

  // Already signed in — nothing to do here but offer the way through.
  if (user) {
    return (
      <section className="card">
        <span className="eyebrow">{translations.t('signin.title')}</span>
        <h1>{translations.t('signin.already')}</h1>
        <button type="button" className="btn" onClick={() => router.navigate({ to: 'account' })}>
          {translations.t('signin.toAccount')}
        </button>
      </section>
    )
  }

  const onSignIn = async () => {
    setBusy(true)
    await signInWithGitHub()
    // One protected page here, so we return to `account`; a larger app would map the captured
    // `redirect` URL back to a route and navigate there instead.
    router.navigate({ to: 'account' })
  }

  return (
    <section className="card">
      <span className="eyebrow">{translations.t('signin.title')}</span>
      <h1>{translations.t('signin.heading')}</h1>
      <p className="lead">{translations.t('signin.body')}</p>

      {redirect && (
        <p className="lead">
          {translations.t('signin.return')} <code>{redirect}</code>
        </p>
      )}

      <button type="button" className="btn gh" disabled={busy} onClick={onSignIn}>
        <GitHubMark />
        {busy ? translations.t('signin.busy') : translations.t('signin.button')}
      </button>
    </section>
  )
}
