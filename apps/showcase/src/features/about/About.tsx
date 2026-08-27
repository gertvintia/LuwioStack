import { useTranslations } from '@luwio/translations'

export function About() {
  const { translations } = useTranslations()
  return (
    <section className="card">
      <span className="eyebrow">{translations.t('about.title')}</span>
      <h1>{translations.t('about.title')}</h1>
      <p className="lead">{translations.t('about.body')}</p>
    </section>
  )
}
