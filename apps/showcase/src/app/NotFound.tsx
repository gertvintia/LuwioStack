import { useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'

/** Shown when a route has no alias for the active language and its beforeLoad throws notFound(). */
export function NotFound() {
  const { router } = useRouter()
  const { translations } = useTranslations()

  return (
    <section className="card">
      <span className="eyebrow">404</span>
      <h1>{translations.t('notfound.title')}</h1>
      <p className="lead">{translations.t('notfound.body')}</p>
      <button type="button" className="btn" onClick={() => router.navigate({ to: 'home' })}>
        {translations.t('notfound.home')}
      </button>
    </section>
  )
}
