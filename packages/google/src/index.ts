// @luwio/google — helpers for loading and using Google web SDKs.
// Skeleton: starts with script loading; Maps/OAuth/Analytics wrappers to follow.

const cache = new Map<string, Promise<void>>()

/**
 * Load a Google SDK `<script>` once and resolve when it is ready. Repeated calls
 * with the same `src` return the same promise, so the script is only injected once.
 */
export function loadGoogleScript(src: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(
      new Error('@luwio/google: loadGoogleScript requires a browser environment'),
    )
  }

  const existing = cache.get(src)
  if (existing) return existing

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => {
      cache.delete(src)
      reject(new Error(`@luwio/google: failed to load ${src}`))
    })
    document.head.appendChild(script)
  })

  cache.set(src, promise)
  return promise
}
