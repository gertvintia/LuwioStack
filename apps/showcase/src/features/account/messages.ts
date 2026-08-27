// Strings for the auth slice — the sign-in page and the protected account page. `signin.nav` labels
// the top-bar auth control shown while signed out (the avatar replaces it once signed in).
export const messages: Record<string, Record<string, string>> = {
  en: {
    'account.title': 'Account',
    'account.body':
      'A protected page. A pathless parent route (auth) guards it in beforeLoad — no session, and you never reach here.',
    'account.signOut': 'Sign out',
    'signin.nav': 'Sign in',
    'signin.title': 'Sign in',
    'signin.heading': 'Sign in',
    'signin.body': 'This page is public; the account page behind it is not.',
    'signin.button': 'Sign in with GitHub',
    'signin.busy': 'Contacting GitHub…',
    'signin.return': 'After signing in you’ll return to',
    'signin.already': 'You’re already signed in.',
    'signin.toAccount': 'Go to your account',
  },
  nl: {
    'account.title': 'Account',
    'account.body':
      'Een beveiligde pagina. Een padloze bovenliggende route (auth) bewaakt hem in beforeLoad — geen sessie, dan kom je hier nooit.',
    'account.signOut': 'Afmelden',
    'signin.nav': 'Aanmelden',
    'signin.title': 'Aanmelden',
    'signin.heading': 'Aanmelden',
    'signin.body': 'Deze pagina is openbaar; de accountpagina erachter niet.',
    'signin.button': 'Aanmelden met GitHub',
    'signin.busy': 'Verbinden met GitHub…',
    'signin.return': 'Na het aanmelden ga je terug naar',
    'signin.already': 'Je bent al aangemeld.',
    'signin.toAccount': 'Naar je account',
  },
  fr: {
    'account.title': 'Compte',
    'account.body':
      'Une page protégée. Une route parente sans chemin (auth) la garde dans beforeLoad — sans session, vous n’arrivez jamais ici.',
    'account.signOut': 'Se déconnecter',
    'signin.nav': 'Se connecter',
    'signin.title': 'Connexion',
    'signin.heading': 'Connexion',
    'signin.body': 'Cette page est publique ; la page compte derrière ne l’est pas.',
    'signin.button': 'Se connecter avec GitHub',
    'signin.busy': 'Connexion à GitHub…',
    'signin.return': 'Après connexion, vous reviendrez à',
    'signin.already': 'Vous êtes déjà connecté.',
    'signin.toAccount': 'Accéder à votre compte',
  },
}
