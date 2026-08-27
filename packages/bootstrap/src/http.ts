import type { ConfigFetcher } from './types'

export interface HttpConfigOptions {
  /** Extra request options (headers, credentials, signal…). `If-None-Match` is added automatically. */
  init?: RequestInit
  /** Override `fetch` (tests, a custom client, SSR). Defaults to the global `fetch`. */
  fetchImpl?: typeof fetch
}

// FNV-1a — a tiny, stable, non-cryptographic hash. Only used as a fallback "version" when the server
// sends no ETag, so change detection still works. Never security-sensitive.
function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

/**
 * The standard config transport: a conditional `GET` that sends `If-None-Match` and reads the
 * `ETag`. A `304` becomes `unchanged` (reuse the cache); a `200` becomes `fresh`. If the endpoint
 * sends no `ETag`, a hash of the body stands in so revalidation still detects real changes.
 *
 * Pair it with `Cache-Control: no-cache` + `ETag` on the response: the browser then revalidates for
 * you, so a refresh is cheap when nothing changed and fresh the moment it does.
 */
export function httpConfig<T>(url: string, options: HttpConfigOptions = {}): ConfigFetcher<T> {
  const doFetch = options.fetchImpl ?? fetch

  return async (version) => {
    const headers = new Headers(options.init?.headers)
    if (version) headers.set('If-None-Match', version)

    const response = await doFetch(url, { ...options.init, headers })

    if (response.status === 304) {
      return { status: 'unchanged', version: version ?? response.headers.get('ETag') ?? '' }
    }
    if (!response.ok) {
      throw new Error(`config request to ${url} failed: ${response.status} ${response.statusText}`)
    }

    const body = await response.text()
    const etag = response.headers.get('ETag') ?? `w/${fnv1a(body)}`
    return { status: 'fresh', version: etag, data: JSON.parse(body) as T }
  }
}
