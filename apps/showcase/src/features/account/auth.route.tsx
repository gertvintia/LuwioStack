import { createRoute, redirect } from '@luwio/router'
import { getSession } from '../../shared/session'
import signin from './signin.route'

// Pathless guard — the PARENT that handles auth. It contributes no URL segment, but its beforeLoad
// runs on every request beneath it (here: the account page). No session → bounce to sign-in,
// remembering where the user was headed so we can return them after they authenticate.
export default createRoute({
  id: 'auth',
  parent: 'shell',
  layout: true,
  beforeLoad: ({ context, location }) => {
    const session = getSession()
    if (!session) {
      // `location` is one of TanStack's ctx fields, typed loosely (unknown) by @luwio/router.
      const { href } = location as { href: string }
      // The prefixed path (`/en-IE/sign-in`) resolves in every locale — including the unprefixed
      // default — and signin.slugFor() gives the locale's own translated segment.
      throw redirect({
        to: `/${context.locale.code}/${signin.slugFor(context.locale)}`,
        search: { redirect: href },
      })
    }
    // Flows into the context of every child route (read as context.session in account's loader).
    return { session }
  },
})
