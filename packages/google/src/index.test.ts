import { describe, expect, it } from 'vitest'
import { loadGoogleScript } from './index'

// happy-dom does not execute injected scripts, so every load settles as a
// rejection. We assert the synchronous DOM/caching behaviour and swallow it.

describe('@luwio/google', () => {
  it('injects a script tag for the given src', () => {
    const src = 'https://maps.googleapis.com/maps/api/js?key=TEST'
    loadGoogleScript(src).catch(() => {})
    const el = document.querySelector(`script[src="${src}"]`)
    expect(el).not.toBeNull()
    expect(el?.tagName).toBe('SCRIPT')
  })

  it('reuses the same in-flight promise for the same src', () => {
    const src = 'https://apis.google.com/js/api.js'
    const a = loadGoogleScript(src)
    const b = loadGoogleScript(src)
    a.catch(() => {})
    b.catch(() => {})
    expect(a).toBe(b)
  })
})
