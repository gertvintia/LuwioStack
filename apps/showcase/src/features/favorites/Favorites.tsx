import { Locale } from '@luwio/locale'
import { useRouter } from '@luwio/router'
import { useTranslations } from '@luwio/translations'
import { useFavorites } from '../../shared/favorites'

export function Favorites() {
  const { router } = useRouter()
  const { translations } = useTranslations()
  const { favorites, remove } = useFavorites()

  if (favorites.length === 0) {
    return (
      <section className="card">
        <h1>{translations.t('favorites.title')}</h1>
        <p className="lead">{translations.t('favorites.empty')}</p>
        <a
          className="btn"
          href={router.href({ id: 'explore' })}
          onClick={(e) => {
            if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault()
              router.navigate({ to: 'explore' })
            }
          }}
        >
          {translations.t('favorites.go')}
        </a>
      </section>
    )
  }

  return (
    <section className="card">
      <h1>{translations.t('favorites.title')}</h1>
      <ul className="lines">
        {favorites.map((code) => {
          const country = Locale.new({ languageOrLocale: code }).country()
          return (
            <li key={code} className="line">
              <span className="line-name">{country.name}</span>
              <code>{code}</code>
              <span className="line-meta">
                {country.currency_code} · {country.dialing_code}
              </span>
              <button type="button" className="btn ghost sm" onClick={() => remove(code)}>
                {translations.t('favorites.remove')}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
