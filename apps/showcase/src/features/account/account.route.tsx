import { Locale } from '@luwio/locale'
import { createRoute } from '@luwio/router'
import { translations } from '../../app/translations'
import { Account } from './Account'

// The protected page. It sits under `auth`, so by the time it renders the guard has already run and
// guaranteed a session — no auth check here, that's the parent's job.
export default createRoute({
  id: 'account',
  parent: 'auth',
  component: Account,
  head: () => ({ meta: [{ title: translations.t('account.title') }] }),
})
  .alias(Locale.new({ languageOrLocale: 'en-IE' }), 'account')
  .alias(Locale.new({ languageOrLocale: 'nl-NL' }), 'account')
  .alias(Locale.new({ languageOrLocale: 'fr-FR' }), 'compte')
