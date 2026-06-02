'use client'

import { useEffect, useState } from 'react'

interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Auto-generates an anchored sidebar TOC from the rendered MDX content.
 * Renders nothing on small screens.
 */
export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const container = document.querySelector('.ao-body, .lb-body')
    if (!container) return

    const nodes = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[]
    const list: TocHeading[] = []
    for (const n of nodes) {
      const text = (n.textContent || '').trim()
      if (!text) continue
      if (!n.id) n.id = slugify(text).slice(0, 60) || `h-${list.length}`
      list.push({ id: n.id, text, level: n.tagName === 'H3' ? 3 : 2 })
    }
    setHeadings(list)

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0 }
    )
    nodes.forEach(n => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  if (headings.length < 3) return null

  return (
    <aside className="toc" aria-label="Table des matières">
      <style>{`
        .toc {
          position: fixed;
          top: 140px;
          right: max(24px, calc((100vw - 760px) / 2 - 280px));
          width: 220px;
          max-height: calc(100vh - 180px);
          overflow-y: auto;
          padding: 16px 4px 16px 18px;
          border-left: 1px solid var(--border);
          z-index: 5;
          display: none;
        }
        @media (min-width: 1280px) { .toc { display: block; } }
        .toc-label {
          font-family: var(--fm);
          font-size: 9.5px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--dim);
          margin-bottom: 14px;
        }
        .toc-list { display: flex; flex-direction: column; gap: 7px; }
        .toc-item {
          display: block;
          font-family: var(--fb);
          font-size: 12px;
          color: var(--dim);
          line-height: 1.45;
          padding: 3px 0 3px 0;
          border-left: 1.5px solid transparent;
          padding-left: 12px;
          margin-left: -18px;
          transition: color .2s, border-color .2s;
        }
        .toc-item:hover { color: var(--text); }
        .toc-item.l3 { padding-left: 24px; font-size: 11.5px; color: var(--dim); }
        .toc-item.active { color: var(--text); border-left-color: var(--v); }
        .toc-item.active.l3 { border-left-color: var(--c); }
      `}</style>
      <div className="toc-label">// sur cette page</div>
      <nav className="toc-list">
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`toc-item l${h.level} ${activeId === h.id ? 'active' : ''}`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
