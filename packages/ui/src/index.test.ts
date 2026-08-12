import { describe, expect, it } from 'vitest'
import { cn } from './index'

describe('@luwio/ui', () => {
  it('joins truthy class names', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
})
