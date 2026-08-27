import type { RevalidateResult, WatchOptions } from './types'

// Stale-while-revalidate scheduler. Generic — knows nothing about config, only how to re-check on
// the moments that matter (focus, tab-visible, a slow interval) and fire once when something changed.
//
// Nothing pushes config to an open tab, so we pull: cheaply, and only while the tab is visible. The
// first change stops the polling — the caller's job from there is to reload, which re-runs boot.
export function startWatch(
  revalidate: () => Promise<RevalidateResult>,
  onChange: (info: { version: string }) => void,
  options: WatchOptions = {},
): () => void {
  const intervalMs = options.intervalMs ?? 30_000
  let notified = false

  const check = async () => {
    if (notified) return
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    try {
      const { changed, version } = await revalidate()
      if (changed) {
        notified = true
        onChange({ version })
      }
    } catch {
      // A failed revalidation just means we keep the config we have — try again next tick.
    }
  }

  const stops: Array<() => void> = []

  if (typeof window !== 'undefined') {
    const timer = window.setInterval(check, intervalMs)
    stops.push(() => window.clearInterval(timer))
    window.addEventListener('focus', check)
    stops.push(() => window.removeEventListener('focus', check))
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', check)
    stops.push(() => document.removeEventListener('visibilitychange', check))
  }

  return () => {
    for (const stop of stops) stop()
  }
}
