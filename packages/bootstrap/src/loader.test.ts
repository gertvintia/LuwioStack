import { describe, expect, it, vi } from 'vitest'
import { memoryCache } from './cache'
import { createConfigLoader } from './loader'
import type { ConfigFetcher } from './types'

interface Body {
  value: number
}

// A fake config source that honours conditional requests, like an ETag-aware endpoint.
function fakeServer(version: string, data: Body) {
  let current = { version, data }
  const fetch: ConfigFetcher<Body> = async (seen) => {
    if (seen === current.version) return { status: 'unchanged', version: current.version }
    return { status: 'fresh', version: current.version, data: current.data }
  }
  return { fetch, publish: (v: string, d: Body) => (current = { version: v, data: d }) }
}

describe('createConfigLoader', () => {
  it('loads fresh config and caches it', async () => {
    const server = fakeServer('v1', { value: 1 })
    const cache = memoryCache<Body>()
    const loader = createConfigLoader({ fetch: server.fetch, cache })

    expect(await loader.load()).toEqual({ value: 1 })
    expect(cache.read()).toEqual({ version: 'v1', data: { value: 1 } })
  })

  it('reuses the cache on an unchanged (304) revalidation', async () => {
    const server = fakeServer('v1', { value: 1 })
    const cache = memoryCache<Body>()
    const fetchSpy = vi.fn(server.fetch)
    const loader = createConfigLoader({ fetch: fetchSpy, cache })

    await loader.load()
    const result = await loader.revalidate()

    expect(result).toEqual({ changed: false, version: 'v1' })
    // The second call sent the cached version for a conditional request.
    expect(fetchSpy).toHaveBeenLastCalledWith('v1')
  })

  it('reports changed once the server publishes a new version', async () => {
    const server = fakeServer('v1', { value: 1 })
    const loader = createConfigLoader({ fetch: server.fetch, cache: memoryCache<Body>() })

    await loader.load()
    server.publish('v2', { value: 2 })

    expect(await loader.revalidate()).toEqual({ changed: true, version: 'v2' })
    // A fresh load applies the new version, so it's no longer "changed".
    expect(await loader.load()).toEqual({ value: 2 })
    expect(await loader.revalidate()).toEqual({ changed: false, version: 'v2' })
  })

  it('maps the raw body to the consumed shape (only the raw body is cached)', async () => {
    const server = fakeServer('v1', { value: 2 })
    const cache = memoryCache<Body>()
    const loader = createConfigLoader({
      fetch: server.fetch,
      cache,
      map: (raw) => `value is ${raw.value}`,
    })

    expect(await loader.load()).toBe('value is 2')
    expect(cache.read()).toEqual({ version: 'v1', data: { value: 2 } })
  })

  it('throws if the source answers "unchanged" with nothing cached', async () => {
    const fetch: ConfigFetcher<Body> = async () => ({ status: 'unchanged', version: 'v1' })
    const loader = createConfigLoader({ fetch, cache: memoryCache<Body>() })

    await expect(loader.load()).rejects.toThrow(/nothing cached/)
  })

  it('rejects an invalid config from validate() and does not cache it', async () => {
    const server = fakeServer('v1', { value: -1 })
    const cache = memoryCache<Body>()
    const loader = createConfigLoader({
      fetch: server.fetch,
      cache,
      validate: (c) => {
        if (c.value < 0) throw new Error('value must be >= 0')
        return c
      },
    })

    await expect(loader.load()).rejects.toThrow('value must be >= 0')
    // The bad config never poisons the cache — a later valid publish still loads cleanly.
    expect(cache.read()).toBeNull()

    server.publish('v2', { value: 5 })
    expect(await loader.load()).toEqual({ value: 5 })
  })

  it('validate() can normalize; only the normalized body is cached', async () => {
    const server = fakeServer('v1', { value: 3 })
    const cache = memoryCache<Body>()
    const loader = createConfigLoader({
      fetch: server.fetch,
      cache,
      validate: (c) => ({ value: c.value * 10 }),
    })

    expect(await loader.load()).toEqual({ value: 30 })
    expect(cache.read()).toEqual({ version: 'v1', data: { value: 30 } })
  })

  it('does not re-run validate on a 304 (the cache is already validated)', async () => {
    const server = fakeServer('v1', { value: 1 })
    const validate = vi.fn((c: Body) => c)
    const loader = createConfigLoader({ fetch: server.fetch, cache: memoryCache<Body>(), validate })

    await loader.load() // fresh — validated once
    await loader.revalidate() // 304 — reuses cache, no re-validation
    expect(validate).toHaveBeenCalledTimes(1)
  })

  it('works without a cache (always fetches fresh)', async () => {
    const server = fakeServer('v1', { value: 1 })
    const loader = createConfigLoader({ fetch: server.fetch })

    expect(await loader.load()).toEqual({ value: 1 })
    server.publish('v2', { value: 2 })
    // No cache means no conditional request, so revalidate sees the new version immediately.
    expect(await loader.revalidate()).toEqual({ changed: true, version: 'v2' })
  })
})
