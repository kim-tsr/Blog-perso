'use client'
import { useState } from 'react'
import { ArticleMeta } from '@/lib/theme'
import ArticlesGrid from './ArticlesGrid'

const FILTERS = [
  { key: 'all',    label: 'Tous',           accent: 'var(--text)', active: 'rgba(255,255,255,.1)' },
  { key: 'infra',  label: 'Infrastructure', accent: 'var(--v)',    active: 'oklch(0.68 0.24 280/.15)' },
  { key: 'sec',    label: 'Cybersécurité',  accent: 'var(--c)',    active: 'oklch(0.75 0.16 194/.15)' },
  { key: 'reseau', label: 'Réseau',         accent: 'var(--a)',    active: 'oklch(0.76 0.16 65/.15)' },
]

const TAG_MAP: Record<string, string> = {
  infra:  'Infrastructure',
  sec:    'Cybersécurité',
  reseau: 'Réseau',
}

export default function CategoryFilter({ allArticles }: { allArticles: ArticleMeta[] }) {
  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? allArticles : allArticles.filter(a => a.tag === TAG_MAP[active])

  return (
    <>
      <style>{`
        .cf-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:52px; }
        .cf-pill { font-family:var(--fm); font-size:11px; letter-spacing:.08em; padding:8px 20px; border-radius:100px; border:1px solid var(--border); background:transparent; color:var(--dim); cursor:pointer; transition:color .2s, border-color .2s, background .2s; }
        .cf-pill:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .cf-pill.active { color:var(--cf-accent); border-color:var(--cf-accent); background:var(--cf-bg); }
      `}</style>
      <div className="cf-bar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`cf-pill${active === f.key ? ' active' : ''}`}
            style={{ '--cf-accent': f.accent, '--cf-bg': f.active } as React.CSSProperties}
            onClick={() => setActive(f.key)}
            aria-pressed={active === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ArticlesGrid articles={filtered} hideMeta />
    </>
  )
}
