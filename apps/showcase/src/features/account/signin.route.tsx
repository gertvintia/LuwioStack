import { Locale } from '@luwio/locale'
import { createRoute } from '@luwio/router'
import { translations } from '../../app/translations'
import { SignIn } from './SignIn'

// The public login page — deliberately NOT under `auth` (that would be an unauthenticated redirect
// loop). `redirect` carries the URL the guard bounced away from, so we can return there on success.
export default createRoute<Record<string, never>, { redirect?: string }>({
  id: 'signin',
  parent: 'shell',
  component: SignIn,
  validateSearch: (search) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: translations.t('signin.title') }] }),
})
  .alias(Locale.new({ languageOrLocale: 'en-IE' }), 'sign-in')
  .alias(Locale.new({ languageOrLocale: 'nl-NL' }), 'aanmelden')
  .alias(Locale.new({ languageOrLocale: 'fr-FR' }), 'connexion')
