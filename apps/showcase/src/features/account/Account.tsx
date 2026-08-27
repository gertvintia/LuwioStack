import { useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'
import { signOut, useSession } from '../../shared/session'

export function Account() {
  const { router } = useRouter()
  const { translations } = useTranslations()
  const user = useSession()

  // The guard guarantees a session before this renders; this is a render-time fallback for the
  // brief window after signing out, before the guard redirects on the next navigation.
  if (!user) return null

  return (
    <section className="card">
      <span className="eyebrow">{translations.t('account.title')}</span>
      <div className="identity">
        <img className="avatar" src={user.avatarUrl} alt="" />
        <div>
          <h1>{user.name}</h1>
          <p className="lead">
            <code>@{user.login}</code>
          </p>
        </div>
      </div>

      <p className="lead">{translations.t('account.body')}</p>

      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          signOut()
          router.navigate({ to: 'home' })
        }}
      >
        {translations.t('account.signOut')}
      </button>
    </section>
  )
}
