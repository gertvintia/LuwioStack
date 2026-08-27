import { useLocalStorage } from '@luwio/storage'

/**
 * The signed-in GitHub identity, as an app would keep it after an OAuth exchange. Shared across
 * slices: the auth guard, the Shell nav, and the account/sign-in pages all read it.
 */
export interface GitHubUser {
  login: string
  name: string
  avatarUrl: string
}

const KEY = 'luwio:showcase:session'

/**
 * Read the current session **synchronously**. The auth guard runs in a route's `beforeLoad` — before
 * any component renders — so it can't use the `useSession()` hook; it reads localStorage directly.
 */
export function getSession(): GitHubUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GitHubUser) : null
  } catch {
    return null
  }
}

function writeSession(user: GitHubUser | null): void {
  if (user) window.localStorage.setItem(KEY, JSON.stringify(user))
  else window.localStorage.removeItem(KEY)
  // Same-document notification so `useLocalStorage()` subscribers re-render: the Web Storage
  // `storage` event only fires in *other* tabs, so we dispatch one here too — the same trick
  // @luwio/storage uses internally.
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
}

/**
 * Simulated "Sign in with GitHub". A real integration sends the browser to
 * `https://github.com/login/oauth/authorize?client_id=…`, then exchanges the returned `?code` for a
 * token **on your server** (the client secret must never ship to the browser). We fake that round
 * trip so the example can focus on the routing: the parent auth guard and the deep-link return.
 */
export function signInWithGitHub(): Promise<GitHubUser> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: GitHubUser = {
        login: 'octocat',
        name: 'Mona Lisa Octocat',
        avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
      }
      writeSession(user)
      resolve(user)
    }, 700)
  })
}

/** Clear the session — the guard will bounce protected routes back to sign-in on the next visit. */
export function signOut(): void {
  writeSession(null)
}

/** Reactive read for components — re-renders on sign in/out, and stays in sync across tabs. */
export function useSession(): GitHubUser | null {
  const [user] = useLocalStorage<GitHubUser | null>(KEY, null)
  return user
}
