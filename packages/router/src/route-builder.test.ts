import { Locale } from '@luwio/locale'
import { describe, expect, it } from 'vitest'
import { createRoute } from './route-builder'

const enBE = Locale.new({ languageOrLocale: 'en-BE' })
const nlBE = Locale.new({ languageOrLocale: 'nl-BE' })

describe('createRoute', () => {
  it('requires an id', () => {
    // @ts-expect-error id is required
    expect(() => createRoute({})).toThrow(/id/)
  })

  it('keeps TanStack options on the builder, minus its own keys', () => {
    const loader = () => null
    const route = createRoute({ id: 'about', parent: 'app', loader, staleTime: 10 })
    expect(route.id).toBe('about')
    expect(route.parent).toBe('app')
    expect(route.options.loader).toBe(loader)
    expect(route.options.staleTime).toBe(10)
    expect(route.options).not.toHaveProperty('id')
    expect(route.options).not.toHaveProperty('parent')
  })
})

describe('alias', () => {
  it('resolves a slug per locale', () => {
    const route = createRoute({ id: 'about' })
    route.alias(enBE, 'about').alias(nlBE, 'over-ons')
    expect(route.slugFor(enBE)).toBe('about')
    expect(route.slugFor(nlBE)).toBe('over-ons')
    expect(route.hasAlias(enBE)).toBe(true)
  })

  it('falls back to the last dotted id segment when no alias is set', () => {
    const route = createRoute({ id: 'blog.post' })
    expect(route.hasAlias(enBE)).toBe(false)
    expect(route.slugFor(enBE)).toBe('post')
  })

  it('rejects a duplicate alias for the same locale', () => {
    const route = createRoute({ id: 'about' })
    route.alias(enBE, 'about')
    expect(() => route.alias(enBE, 'about-us')).toThrow(/already has an alias for "en-BE"/)
  })

  it('rejects aliases on a layout route', () => {
    const route = createRoute({ id: 'auth', layout: true })
    expect(() => route.alias(enBE, 'auth')).toThrow(/layout route/)
  })
})

// Compile-time checks (#1): createRoute's generics type the beforeLoad/loader ctx. These assert
// nothing at runtime — they fail the build (pnpm typecheck) if the typing regresses.
describe('createRoute callback typing', () => {
  it('types params, search and context.locale on loader/beforeLoad', () => {
    createRoute<{ postId: string }, { page: number }>({
      id: 'post',
      beforeLoad: ({ context }) => {
        const code: string = context.locale.code // context.locale is always typed
        return { code }
      },
      loader: ({ params, search }) => {
        const id: string = params.postId // typed from the params generic
        const page: number = search.page // typed from the search generic
        return `${id}:${page}`
      },
    })

    createRoute<{ postId: string }>({
      id: 'post2',
      loader: ({ params }) => {
        // @ts-expect-error "slug" is not a declared param
        return params.slug
      },
    })

    expect(true).toBe(true)
  })
})
