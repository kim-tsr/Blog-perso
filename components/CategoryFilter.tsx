'use client'
import { useMemo, useState } from 'react'
import { ArticleMeta } from '@/lib/theme'
import ArticlesGrid from './ArticlesGrid'

const FILTERS = [
  { key: 'all',    label: 'Tous',           accent: 'var(--text)', active: 'rgba(255,255,255,.1)' },
  { key: 'infra',  label: 'Infrastructure', accent: 'var(--v)',    active: 'oklch(0.68 0.24 280/.15)' },
  { key: 'sec',    label: 'Cybersécurité',  accent: 'var(--c)',    active: 'oklch(0.75 0.16 194/.15)' },
  { key: 'reseau', label: 'Réseau',         accent: 'var(--a)',    active: 'oklch(0.76 0.16 65/.15)' },
]

const SORTS = [
  { key: 'recent',  label: 'Plus récents' },
  { key: 'oldest',  label: 'Plus anciens' },
  { key: 'short',   label: 'Lecture courte' },
  { key: 'long',    label: 'Lecture longue' },
]

const TAG_MAP: Record<string, string> = {
  infra:  'Infrastructure',
  sec:    'Cybersécurité',
  reseau: 'Réseau',
}

const parseRead = (s: string) => parseInt(s, 10) || 0

export default function CategoryFilter({ allArticles }: { allArticles: ArticleMeta[] }) {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')

  const filtered = useMemo(() => {
    let list = active === 'all' ? allArticles : allArticles.filter(a => a.tag === TAG_MAP[active])
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    if (sort === 'oldest') sorted.reverse()
    if (sort === 'short')  sorted.sort((a,b) => parseRead(a.read) - parseRead(b.read))
    if (sort === 'long')   sorted.sort((a,b) => parseRead(b.read) - parseRead(a.read))
    return sorted
  }, [active, query, sort, allArticles])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allArticles.length }
    for (const k of Object.keys(TAG_MAP)) {
      map[k] = allArticles.filter(a => a.tag === TAG_MAP[k]).length
    }
    return map
  }, [allArticles])

  return (
    <>
      <style>{`
        .cf-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
        .cf-pill { font-family:var(--fm); font-size:11px; letter-spacing:.08em; padding:8px 18px; border-radius:100px; border:1px solid var(--border); background:transparent; color:var(--dim); cursor:pointer; transition:color .2s, border-color .2s, background .2s; display:inline-flex; align-items:center; gap:8px; }
        .cf-pill:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .cf-pill.active { color:var(--cf-accent); border-color:var(--cf-accent); background:var(--cf-bg); }
        .cf-pill-count { font-size:10px; padding:1px 7px; border-radius:100px; background:rgba(255,255,255,.05); color:inherit; opacity:.7; }
        .cf-pill.active .cf-pill-count { opacity:1; background:rgba(255,255,255,.08); }

        .cf-controls { display:flex; gap:14px; align-items:center; margin-bottom:32px; flex-wrap:wrap; }
        .cf-search { flex:1; min-width:240px; position:relative; }
        .cf-search input { width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:100px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 44px 11px 44px; outline:none; transition:border-color .2s, background .2s; }
        .cf-search input:focus { border-color:var(--v); background:rgba(255,255,255,.06); }
        .cf-search input::placeholder { color:var(--dim); }
        .cf-search-icon { position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--dim); pointer-events:none; }
        .cf-clear { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:var(--dim); cursor:pointer; font-family:var(--fm); font-size:10px; padding:6px 8px; border-radius:6px; transition:color .2s, background .2s; }
        .cf-clear:hover { color:var(--text); background:rgba(255,255,255,.05); }

        .cf-sort { display:inline-flex; gap:0; border:1px solid var(--border); border-radius:100px; padding:3px; background:rgba(255,255,255,.025); }
        .cf-sort button { font-family:var(--fm); font-size:10px; letter-spacing:.08em; padding:7px 14px; border-radius:100px; border:none; background:transparent; color:var(--dim); cursor:pointer; transition:color .2s, background .2s; }
        .cf-sort button:hover { color:var(--text); }
        .cf-sort button.active { color:var(--text); background:rgba(255,255,255,.07); }

        .cf-result { font-family:var(--fm); font-size:11px; letter-spacing:.08em; color:var(--dim); margin-bottom:36px; padding-bottom:18px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; }
        .cf-result b { color:var(--text); font-weight:500; }

        .cf-empty { padding:80px 24px; text-align:center; border:1px dashed var(--border); border-radius:14px; }
        .cf-empty-icon { width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,.04); display:inline-flex; align-items:center; justify-content:center; color:var(--dim); margin-bottom:18px; }
        .cf-empty-title { font-family:var(--fd); font-size:20px; font-weight:600; color:var(--text); margin-bottom:8px; letter-spacing:-.01em; }
        .cf-empty-sub { font-size:14px; color:var(--mid); }
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
            <span className="cf-pill-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="cf-controls">
        <div className="cf-search">
          <svg className="cf-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            placeholder="Rechercher un article…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Rechercher dans les articles"
          />
          {query && (
            <button className="cf-clear" onClick={() => setQuery('')} aria-label="Effacer la recherche">×</button>
          )}
        </div>
        <div className="cf-sort" role="group" aria-label="Trier les articles">
          {SORTS.map(s => (
            <button
              key={s.key}
              className={sort === s.key ? 'active' : ''}
              onClick={() => setSort(s.key)}
              aria-pressed={sort === s.key}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="cf-result">
        <span><b>{filtered.length}</b> article{filtered.length > 1 ? 's' : ''}{active !== 'all' ? ` · ${FILTERS.find(f => f.key === active)?.label}` : ''}{query ? ` · « ${query} »` : ''}</span>
        <span>{SORTS.find(s => s.key === sort)?.label}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="cf-empty">
          <div className="cf-empty-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="cf-empty-title">Aucun résultat</div>
          <div className="cf-empty-sub">Essayez un autre terme ou changez de catégorie.</div>
        </div>
      ) : (
        <ArticlesGrid articles={filtered} hideMeta />
      )}
    </>
  )
}
