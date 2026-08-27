import { Locale } from '@luwio/locale'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createRouter } from './create-router'
import { RouteRegistry } from './registry'
import { createRoute } from './route-builder'
import {
  useRouteContext,
  useRouteLoaderData,
  useRouteLocale,
  useRouteParams,
  useRouteQuery,
} from './route-hooks'

const enBE = Locale.new({ languageOrLocale: 'en-BE' })

function Probe() {
  const params = useRouteParams<{ postId: string }>()
  const query = useRouteQuery<{ q?: string }>()
  const data = useRouteLoaderData<string>()
  const ctx = useRouteContext<{ routeId?: string }>()
  const { locale, language, region } = useRouteLocale()

  return (
    <dl>
      <dd data-testid="params">{params.postId}</dd>
      <dd data-testid="query">{query.q}</dd>
      <dd data-testid="loader">{data}</dd>
      <dd data-testid="ctx">{ctx.routeId}</dd>
      <dd data-testid="locale">{`${locale.code}·${language}·${region}`}</dd>
    </dl>
  )
}

describe('route hooks', () => {
  it('expose params, query, loader data, context and locale for the current route', async () => {
    const post = createRoute({ id: 'post', component: Probe, loader: () => 'DATA' })
    post.alias(enBE, '$postId')

    const registry = new RouteRegistry().add(post)
    const router = createRouter(registry, {
      locales: [enBE],
      defaultLocale: enBE,
      router: { history: createMemoryHistory({ initialEntries: ['/en-BE/42?q=hi'] }) },
    })

    render(<RouterProvider router={router} />)

    await screen.findByTestId('params')
    expect(screen.getByTestId('params').textContent).toBe('42')
    expect(screen.getByTestId('query').textContent).toBe('hi')
    expect(screen.getByTestId('loader').textContent).toBe('DATA')
    expect(screen.getByTestId('ctx').textContent).toBe('post')
    expect(screen.getByTestId('locale').textContent).toBe('en-BE·en·BE')
  })
})
