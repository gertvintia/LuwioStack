import { createRoute } from '@luwio/router'
import { NotFound } from './NotFound'
import { Shell } from './Shell'

// Pathless layout route — shared chrome, inside the translations layer. notFoundComponent renders
// (inside the locale + translations context) when a child throws notFound() for the active language.
export default createRoute({
  id: 'shell',
  parent: 'translations',
  layout: true,
  component: Shell,
  notFoundComponent: NotFound,
})
