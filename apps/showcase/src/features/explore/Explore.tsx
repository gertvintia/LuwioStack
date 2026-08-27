import { useLocale } from '@luwio/locale/react'
import { useTranslations } from '@luwio/translations'
import { useFavorites } from '../../shared/favorites'

export function Explore() {
  const { locale } = useLocale()
  const { translations } = useTranslations()
  const country = locale.country()
  const { has, toggle } = useFavorites()
  const saved = has(locale.code)

  const spoken = country
    .languages()
    .toArray()
    .map((l) => l.name)
    .join(', ')

  const rows = [
    { label: 'locale', value: locale.code },
    { label: 'language', value: locale.language().name },
    { label: 'country', value: `${country.name} · ${country.name_local}` },
    { label: 'continent', value: country.continent().name },
    { label: 'currency', value: country.currency_code },
    { label: 'dialing code', value: country.dialing_code },
    { label: 'languages spoken', value: spoken },
  ]

  return (
    <section className="card">
      <span className="eyebrow">{translations.t('explore.title')}</span>
      <h1>{country.name}</h1>
      <p className="lead">{translations.t('explore.sub')}</p>

      <dl className="facts">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        className={saved ? 'btn ghost' : 'btn'}
        onClick={() => toggle(locale.code)}
      >
        {saved ? translations.t('explore.saved') : translations.t('explore.save')}
      </button>
    </section>
  )
}
