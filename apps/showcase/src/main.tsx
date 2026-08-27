import { RouterProvider } from '@luwio/router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from './app/config'
import { localeConfig } from './app/locale-config'
import { createAppRouter } from './app/router'
import './app.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

const root = createRoot(container)

// Bootstrap. The locale set + default come from an API (@luwio/bootstrap loads + caches it), so the
// router can't exist at module load — we fetch the config FIRST, then build the router and mount.
// Doing this outside React keeps it a single fetch and sidesteps StrictMode's double-invoke. A splash
// covers the (usually brief) request. The reload nudge (ConfigUpdateBanner) watches for updates.
root.render(<div className="boot"></div>)

localeConfig
  .load()
  .then((config) => {
    const router = createAppRouter(config)
    root.render(
      <StrictMode>
        {/* @luwio/config provides typed values to the whole app. */}
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </StrictMode>,
    )
  })
  .catch((error) => {
    root.render(<div className="boot">Failed to load configuration. Please retry.</div>)
    console.error(error)
  })
