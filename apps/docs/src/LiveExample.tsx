import { themes } from 'prism-react-renderer'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'

/**
 * An editable, runnable code example. The code on the left executes live and
 * renders into the result panel on the right — edit it and the preview updates.
 *
 * Code runs in `noInline` mode, so each snippet ends with `render(<Something />)`.
 * `scope` injects the real package APIs the snippet may reference.
 */
export function LiveExample({ code, scope }: { code: string; scope: Record<string, unknown> }) {
  return (
    <div className="live">
      <LiveProvider code={code.trim()} scope={scope} noInline theme={themes.nightOwl}>
        <div className="live-grid">
          <div className="live-pane live-pane--editor">
            <span className="live-tag">editable</span>
            <LiveEditor className="live-editor" />
          </div>
          <div className="live-pane live-pane--preview">
            <span className="live-tag">result</span>
            <div className="live-preview">
              <LivePreview />
            </div>
            <LiveError className="live-error" />
          </div>
        </div>
      </LiveProvider>
    </div>
  )
}
