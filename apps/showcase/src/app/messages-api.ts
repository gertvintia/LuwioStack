import type { Messages } from '@luwio/translations'

// A fake translations API — stands in for `GET /api/i18n/:language`, which returns a flat message
// map (id → translated string). In a real app the catalog lives on a server; here it merges each
// feature's local `messages.ts` (vertical slice) plus app-level strings, after simulated latency.
type MessagesModule = { messages: Record<string, Record<string, string>> }

const modules = import.meta.glob<MessagesModule>(['../features/**/messages.ts', './messages.ts'], {
  eager: true,
})

function catalogFor(language: string): Messages {
  const catalog: Messages = {}
  for (const mod of Object.values(modules)) Object.assign(catalog, mod.messages[language] ?? {})
  return catalog
}

export function fetchMessages(language: string): Promise<Messages> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(catalogFor(language)), 400)
  })
}
