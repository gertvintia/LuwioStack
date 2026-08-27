import type { CSSProperties, ReactNode } from 'react'
import { packageBySlug, VISIBLE_PACKAGES } from './content'
import { ArrowIcon } from './icons'

export interface DocSection {
  id: string
  label: string
}

export function DocsLayout({
  slug,
  sections,
  children,
}: {
  slug: string
  sections: DocSection[]
  children: ReactNode
}) {
  const active = packageBySlug(slug)
  const index = VISIBLE_PACKAGES.findIndex((p) => p.slug === slug)
  const prev = index > 0 ? VISIBLE_PACKAGES[index - 1] : undefined
  const next =
    index >= 0 && index < VISIBLE_PACKAGES.length - 1 ? VISIBLE_PACKAGES[index + 1] : undefined

  return (
    <div className="wrap">
      <div className="docs">
        <aside className="sidebar">
          <p className="group">Packages</p>
          <ul>
            {VISIBLE_PACKAGES.map((p) => (
              <li key={p.slug}>
                <a
                  href={`#/docs/${p.slug}`}
                  className={p.slug === slug ? 'active' : ''}
                  style={{ '--accent': p.accent } as CSSProperties}
                >
                  <span className="swatch" style={{ background: p.accent }} />
                  {p.name}
                  {p.status === 'done' && (
                    <span className="done-check" title="Complete">
                      ✓
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <p className="group">On this page</p>
          <ul className="sub">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </aside>

        <article className="doc" style={{ '--accent': active?.accent } as CSSProperties}>
          {children}

          <nav className="page-nav">
            {prev ? (
              <a className="prev" href={`#/docs/${prev.slug}`}>
                <span className="dir">← Previous</span>
                <span className="ttl">{prev.name}</span>
              </a>
            ) : (
              <a className="prev" href="#/">
                <span className="dir">← Back</span>
                <span className="ttl">Home</span>
              </a>
            )}
            {next && (
              <a className="next" href={`#/docs/${next.slug}`}>
                <span className="dir">
                  Next <ArrowIcon />
                </span>
                <span className="ttl">{next.name}</span>
              </a>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}

/** Shared header for a package doc page. */
export function DocHero({ slug }: { slug: string }) {
  const pkg = packageBySlug(slug)
  if (!pkg) return null
  return (
    <>
      <div className="doc-hero">
        <div className="pkg-icon" style={{ background: pkg.accent }}>
          {pkg.icon}
        </div>
        <h1>{pkg.name}</h1>
      </div>
      <p className="doc-lead">{pkg.blurb}</p>
    </>
  )
}
