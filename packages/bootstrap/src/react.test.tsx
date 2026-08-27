import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { memoryCache } from './cache'
import { createConfigLoader } from './loader'
import { Bootstrap, useBootstrapConfig, useConfigUpdate } from './react'
import type { ConfigFetcher } from './types'

interface Body {
  label: string
}

function fakeServer(version: string, data: Body) {
  let current = { version, data }
  const fetch: ConfigFetcher<Body> = async (seen) => {
    if (seen === current.version) return { status: 'unchanged', version: current.version }
    return { status: 'fresh', version: current.version, data: current.data }
  }
  return { fetch, publish: (v: string, d: Body) => (current = { version: v, data: d }) }
}

describe('<Bootstrap>', () => {
  it('shows the fallback, then renders children with the loaded config', async () => {
    const server = fakeServer('v1', { label: 'hello' })
    const loader = createConfigLoader({ fetch: server.fetch, cache: memoryCache<Body>() })

    render(
      <Bootstrap loader={loader} fallback={<p>loading…</p>}>
        {(config) => <h1>{config.label}</h1>}
      </Bootstrap>,
    )

    expect(screen.getByText('loading…')).toBeTruthy()
    expect(await screen.findByText('hello')).toBeTruthy()
  })

  it('exposes the config via useBootstrapConfig', async () => {
    const server = fakeServer('v1', { label: 'from-context' })
    const loader = createConfigLoader({ fetch: server.fetch, cache: memoryCache<Body>() })

    function Reader() {
      const config = useBootstrapConfig<Body>()
      return <span>{config.label}</span>
    }

    render(<Bootstrap loader={loader}>{() => <Reader />}</Bootstrap>)

    expect(await screen.findByText('from-context')).toBeTruthy()
  })
})

describe('useConfigUpdate', () => {
  it('flags an update once the server publishes a newer version', async () => {
    const server = fakeServer('v1', { label: 'v1' })
    const loader = createConfigLoader({ fetch: server.fetch, cache: memoryCache<Body>() })
    await loader.load() // apply v1, as the app would at boot

    function Nudge() {
      const { available } = useConfigUpdate(loader, { intervalMs: 5 })
      return <span>{available ? 'update-available' : 'up-to-date'}</span>
    }

    render(<Nudge />)
    expect(screen.getByText('up-to-date')).toBeTruthy()

    server.publish('v2', { label: 'v2' })
    // The interval / focus check picks up the new version.
    window.dispatchEvent(new Event('focus'))

    expect(await screen.findByText('update-available')).toBeTruthy()
  })
})
