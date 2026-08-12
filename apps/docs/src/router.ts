import { useEffect, useState } from 'react'

/**
 * A tiny dependency-free hash router.
 *
 * Page routes are hashes that start with `#/` (e.g. `#/docs/locale`). Plain
 * in-page anchors like `#packages` are left to the browser's native scrolling
 * and never change the active route.
 */
function parseRoute(): string | null {
  const hash = window.location.hash
  if (hash === '' || hash === '#') return '/'
  if (hash.startsWith('#/')) return hash.slice(1)
  return null // in-page anchor — not a route change
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(() => parseRoute() ?? '/')

  useEffect(() => {
    const onChange = () => {
      const next = parseRoute()
      if (next !== null) {
        setRoute(next)
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
