import { useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'
import { useConfig } from '../../app/config'

export function Home() {
  const { appName, tagline } = useConfig()
  const { router } = useRouter()
  const { translations } = useTranslations()

  return (
    <section>
      <div className="hero">
        <span className="eyebrow">Showcase</span>
        <h1>{appName}</h1>
        <p className="lead">{tagline}</p>
        <p>{translations.t('home.intro')}</p>
        {/* Imperative navigation via useRouter(). */}
        <button type="button" className="btn" onClick={() => router.navigate({ to: 'explore' })}>
          {translations.t('home.cta')}
        </button>
      </div>
    </section>
  )
}
