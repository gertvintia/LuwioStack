import type { ILanguage } from '@luwio/language'
import { createTranslations } from '@luwio/translations'
import { fetchMessages } from './messages-api'

export const translations = createTranslations()

/** Load (cached, deduped) then activate a language's catalog — via a fake API to show runtime loading. */
export async function activateLanguage(language: ILanguage): Promise<void> {
  await translations.add(language, () => fetchMessages(language.code))
  translations.activate(language)
}
