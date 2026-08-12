import { describe, expect, it } from 'vitest'
import { defineRoutes, version } from './index'

describe('@luwio/router', () => {
  it('preserves route definitions', () => {
    const routes = defineRoutes([
      { path: '/', render: () => null },
      { path: '/about', render: () => null },
    ])
    expect(routes).toHaveLength(2)
    expect(routes[0]?.path).toBe('/')
  })

  it('exposes a version', () => {
    expect(typeof version).toBe('string')
  })
})
