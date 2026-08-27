import { createRoute, Outlet } from '@luwio/router'
import { Translations } from '@luwio/translations'
import { activateLanguage, translations } from './translations'

// Layout route: reads the resolved locale from context, then loads + activates its catalog before
// children render (awaited — ready before paint; cached — never reloads on same-language navigation).
export default createRoute({
  id: 'translations',
  layout: true,
  beforeLoad: async ({ context }) => {
    await activateLanguage(context.locale.language())
  },
  component: () => (
    <Translations translations={translations}>
      <Outlet />
    </Translations>
  ),
})
