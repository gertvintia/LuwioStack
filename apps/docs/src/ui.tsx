import { type ReactNode, useState } from 'react'
import { InfoIcon } from './icons'

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'return',
  'function',
  'new',
  'type',
  'interface',
  'await',
  'async',
  'default',
  'extends',
  'as',
  'if',
  'else',
  'for',
  'of',
  'typeof',
  'class',
])

/** Minimal, dependency-free highlighter. React escapes all text, so this is XSS-safe. */
function highlight(code: string): ReactNode[] {
  const re = /(\/\/[^\n]*)|(`[^`]*`|'[^']*'|"[^"]*")|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$]+)/g
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let i = 0
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((m = re.exec(code)) !== null) {
    const [full, comment, str, ident] = m
    const key = i++
    if (comment) {
      out.push(
        <span key={key} className="c">
          {comment}
        </span>,
      )
    } else if (str) {
      out.push(
        <span key={key} className="s">
          {str}
        </span>,
      )
    } else if (ident) {
      if (KEYWORDS.has(ident)) {
        out.push(
          <span key={key} className="k">
            {ident}
          </span>,
        )
      } else if (code[m.index + full.length] === '(') {
        out.push(
          <span key={key} className="f">
            {ident}
          </span>,
        )
      } else {
        out.push(ident)
      }
    } else {
      out.push(full)
    }
  }
  return out
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={() => {
        void navigator.clipboard?.writeText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

export function DownloadButton({
  filename,
  data,
  label,
}: {
  filename: string
  /** Serialized to pretty JSON and offered as a file download. */
  data: unknown
  label?: string
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }}
    >
      {label ?? `Download ${filename}`}
    </button>
  )
}

export function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
  return (
    <div className="code-wrap">
      <div className="code-head">
        <span>{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="code">{highlight(code)}</pre>
    </div>
  )
}

export function InstallBar({ command }: { command: string }) {
  return (
    <div className="install">
      <span className="prompt">$</span>
      <code>{command}</code>
      <CopyButton text={command} />
    </div>
  )
}

export function ApiTable({ rows }: { rows: { sig: string; desc: ReactNode }[] }) {
  return (
    <table className="api">
      <thead>
        <tr>
          <th>Export</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.sig}>
            <td>{r.sig}</td>
            <td>{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="callout">
      <span className="ic">
        <InfoIcon />
      </span>
      <div>{children}</div>
    </div>
  )
}
