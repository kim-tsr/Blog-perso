'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LabMeta } from '@/lib/labs'

interface Props {
  labs: LabMeta[]
}

interface Item {
  type: 'lab' | 'page'
  href: string
  title: string
  subtitle: string
  tag?: string
  tc?: 'tv' | 'tc' | 'ta'
}

const STATIC_PAGES: Item[] = [
  { type: 'page', href: '/labs',       title: 'Labs',            subtitle: 'Tous les labs pratiques' },
  { type: 'page', href: '/roadmap',    title: 'Parcours',        subtitle: 'Ta progression par thème' },
  { type: 'page', href: '/projets',    title: 'Projets',         subtitle: 'Portfolio open-source' },
  { type: 'page', href: '/a-propos',   title: 'À propos',        subtitle: 'Qui je suis, ce que je fais' },
  { type: 'page', href: '/account',    title: 'Mon compte',      subtitle: 'Profil, progression, favoris' },
  { type: 'page', href: '/feed.xml',   title: 'Flux RSS',        subtitle: 'S\'abonner aux nouveaux labs' },
]

const THEME_TO_TC: Record<string, 'tv' | 'tc' | 'ta'> = {
  violet: 'tv', cyan: 'tc', amber: 'ta',
}

export default function SearchPalette({ labs }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const labItems = useMemo<Item[]>(() => labs.map(l => ({
    type: 'lab',
    href: `/labs/${l.slug}`,
    title: l.title,
    subtitle: `${l.tag} · ${l.difficulty} · ${l.duration}`,
    tag: l.tag,
    tc: THEME_TO_TC[l.theme],
  })), [labs])

  const allItems = useMemo<Item[]>(() => [...labItems, ...STATIC_PAGES], [labItems])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems.slice(0, 12)
    const scored = allItems
      .map(it => {
        const haystack = `${it.title} ${it.subtitle} ${it.tag ?? ''}`.toLowerCase()
        let score = 0
        if (it.title.toLowerCase().includes(q))       score += 50
        if (it.title.toLowerCase().startsWith(q))     score += 30
        if (haystack.includes(q))                     score += 10
        q.split(/\s+/).forEach(tok => {
          if (tok && haystack.includes(tok)) score += 3
        })
        return { it, score }
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(s => s.it)
    return scored
  }, [allItems, query])

  useEffect(() => { setActiveIdx(0) }, [query])

  // Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const go = (it: Item) => {
    setOpen(false)
    if (it.href.startsWith('/feed.xml')) {
      window.location.href = it.href
    } else {
      router.push(it.href)
    }
  }

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = results[activeIdx]
      if (it) go(it)
    }
  }

  return (
    <>
      <button
        type="button"
        className="sp-trigger"
        aria-label="Rechercher (Ctrl + K)"
        onClick={() => setOpen(true)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="sp-trigger-text">Rechercher</span>
        <kbd className="sp-trigger-kbd">⌘K</kbd>
      </button>

      {open && (
        <div className="sp-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Recherche">
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Chercher un lab, une page…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onInputKey}
              />
              <kbd className="sp-esc">Esc</kbd>
            </div>

            <div className="sp-results">
              {results.length === 0 && (
                <div className="sp-empty">Aucun résultat.</div>
              )}
              {results.map((it, i) => (
                <button
                  key={`${it.href}-${i}`}
                  type="button"
                  className={`sp-item${i === activeIdx ? ' active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => go(it)}
                >
                  <span className={`sp-kind ${it.tc ?? ''}`}>{it.type === 'lab' ? 'Lab' : 'Page'}</span>
                  <div className="sp-item-body">
                    <div className="sp-item-title">{it.title}</div>
                    <div className="sp-item-sub">{it.subtitle}</div>
                  </div>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" className="sp-go">
                    <path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>

            <div className="sp-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
              <span><kbd>↵</kbd> ouvrir</span>
              <span><kbd>esc</kbd> fermer</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sp-trigger {
          display:inline-flex; align-items:center; gap:10px;
          padding:7px 12px 7px 11px; border:1px solid var(--border); border-radius:100px;
          background:rgba(255,255,255,.025); color:var(--dim);
          font-family:var(--fb); font-size:12px; cursor:pointer;
          transition:border-color .2s, color .2s, background .2s;
        }
        .sp-trigger:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.045); }
        .sp-trigger-text { font-weight:500; }
        .sp-trigger-kbd {
          font-family:var(--fm); font-size:10px; padding:2px 6px;
          border:1px solid var(--border); border-radius:6px; color:var(--dim);
          background:rgba(255,255,255,.03); letter-spacing:.04em;
        }
        @media(max-width:768px) { .sp-trigger-text { display:none; } .sp-trigger-kbd { display:none; } }

        .sp-overlay {
          position:fixed; inset:0; z-index:1000;
          background:color-mix(in srgb, var(--bg) 70%, transparent); backdrop-filter: blur(14px);
          display:flex; align-items:flex-start; justify-content:center;
          padding:14vh 24px 24px; animation: sp-fade .15s ease-out;
        }
        @keyframes sp-fade { from { opacity:0; } to { opacity:1; } }

        .sp-modal {
          width:100%; max-width:640px;
          background:color-mix(in srgb, var(--bg) 96%, transparent);
          border:1px solid var(--border); border-radius:18px;
          box-shadow:0 30px 80px rgba(0,0,0,.25);
          overflow:hidden;
          animation: sp-pop .18s var(--ease);
        }
        @keyframes sp-pop { from { transform:translateY(-8px) scale(.98); opacity:0; } to { transform:none; opacity:1; } }

        .sp-search {
          display:flex; align-items:center; gap:12px;
          padding:18px 22px; border-bottom:1px solid var(--border);
          color:var(--dim);
        }
        .sp-search input {
          flex:1; background:transparent; border:none; outline:none;
          color:var(--text); font-family:var(--fb); font-size:15px;
        }
        .sp-search input::placeholder { color:var(--dim); }
        .sp-esc {
          font-family:var(--fm); font-size:10px; padding:3px 8px;
          border:1px solid var(--border); border-radius:6px; color:var(--dim);
          background:rgba(255,255,255,.03);
        }

        .sp-results { max-height:50vh; overflow-y:auto; padding:8px; }
        .sp-empty { padding:30px 20px; text-align:center; color:var(--dim); font-style:italic; font-size:13px; }

        .sp-item {
          display:flex; align-items:center; gap:14px; width:100%;
          padding:11px 14px; border-radius:10px; border:none;
          background:transparent; cursor:pointer; text-align:left;
          transition:background .15s;
        }
        .sp-item.active { background:rgba(255,255,255,.045); }
        .sp-item.active .sp-go { opacity:1; transform:translateX(2px); }

        .sp-kind {
          font-family:var(--fm); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase;
          padding:3px 9px; border-radius:100px;
          border:1px solid var(--border); background:rgba(255,255,255,.022);
          color:var(--dim); flex-shrink:0;
        }
        .sp-kind.tv { color:var(--v); border-color:color-mix(in oklab, var(--v) 35%, var(--border)); background:color-mix(in oklab, var(--v) 10%, transparent); }
        .sp-kind.tc { color:var(--c); border-color:color-mix(in oklab, var(--c) 35%, var(--border)); background:color-mix(in oklab, var(--c) 10%, transparent); }
        .sp-kind.ta { color:var(--a); border-color:color-mix(in oklab, var(--a) 35%, var(--border)); background:color-mix(in oklab, var(--a) 10%, transparent); }

        .sp-item-body { flex:1; min-width:0; }
        .sp-item-title { font-family:var(--fb); font-size:13.5px; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sp-item-sub   { font-family:var(--fm); font-size:11px; color:var(--dim); margin-top:2px; letter-spacing:.04em; }
        .sp-go { color:var(--dim); opacity:0; transition:opacity .15s, transform .15s; flex-shrink:0; }

        .sp-foot {
          display:flex; gap:18px; padding:10px 18px;
          border-top:1px solid var(--border); background:rgba(255,255,255,.018);
          font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.08em;
        }
        .sp-foot kbd {
          font-family:var(--fm); font-size:9.5px; padding:1px 6px; margin-right:4px;
          border:1px solid var(--border); border-radius:5px; color:var(--mid);
          background:rgba(255,255,255,.03);
        }

        @media(max-width:600px) {
          .sp-overlay { padding-top:6vh; }
          .sp-foot { display:none; }
        }
      `}</style>
    </>
  )
}
