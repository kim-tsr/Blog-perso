'use client'
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArticleMeta, ArticleTheme, CategorySlug } from '@/lib/theme'
import { getThemeClasses } from '@/lib/theme'
import { getCatOrigin } from '@/lib/catOrigin'

interface Cat { label: string; tag: string; theme: ArticleTheme; desc: string }

const THEME_COL: Record<string, string> = {
  violet: 'var(--v)', cyan: 'var(--c)', amber: 'var(--a)',
}
const THEME_GLOW: Record<string, string> = {
  violet: 'oklch(0.50 0.28 280 / .20)',
  cyan:   'oklch(0.50 0.18 194 / .18)',
  amber:  'oklch(0.54 0.18 65  / .16)',
}

interface Props { slug: string; cat: Cat; articles: ArticleMeta[] }

export default function CategoryClient({ slug, cat, articles }: Props) {
  const router = useRouter()
  const origin = useRef({ x: 50, y: 50 })
  const cards = useRef<(HTMLAnchorElement|null)[]>([])

  useEffect(() => {
    const o = getCatOrigin()
    if (o) origin.current = o
  }, [])

  const col = THEME_COL[cat.theme]
  const glow = THEME_GLOW[cat.theme]

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    const card = cards.current[i]; if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - .5
    const y = (e.clientY - r.top)  / r.height - .5
    card.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*5}deg) translateY(-6px)`
  }
  const onLeave = (i: number) => {
    const card = cards.current[i]; if (!card) return
    card.style.transform = ''
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <style>{`
        .cat-hero { padding:90px 0 60px; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
        .cat-hero-inner { max-width:760px; margin:0 auto; padding:0 48px; position:relative; z-index:1; }
        .cat-eyebrow { display:flex; align-items:center; gap:10px; font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; margin-bottom:16px; }
        .cat-main-title { font-family:var(--fd); font-size:clamp(44px,6vw,80px); font-weight:700; letter-spacing:-.03em; line-height:1.0; margin:0 0 16px; background:linear-gradient(135deg,${col},var(--text) 60%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .cat-desc-text { font-size:17px; color:var(--mid); font-weight:300; line-height:1.7; }
        .cat-count { font-family:var(--fm); font-size:11px; color:var(--dim); margin-top:12px; }
        .cat-grid { max-width:1120px; margin:0 auto; padding:64px 48px 100px; display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        .ac { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transform-style:preserve-3d; will-change:transform; transition:border-color .4s,box-shadow .4s,transform .5s var(--ease); display:block; }
        .ac:hover { border-color:rgba(255,255,255,.14); box-shadow:0 24px 64px rgba(0,0,0,.6); }
        .ac-thumb { height:210px; overflow:hidden; }
        .ac-thumb-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; transition:transform .6s var(--ease); }
        .ac:hover .ac-thumb-inner { transform:scale(1.06); }
        .ac-tl { font-family:var(--fm); font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.3); text-transform:uppercase; }
        .ac-body { padding:26px; }
        .ac-tag { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; margin-bottom:10px; }
        .ac-title { font-family:var(--fd); font-size:17px; font-weight:700; letter-spacing:-.015em; line-height:1.35; color:var(--text); margin-bottom:10px; }
        .ac-excerpt { font-size:13px; color:var(--mid); font-weight:300; line-height:1.6; margin-top:8px; }
        .ac-meta { display:flex; justify-content:space-between; font-size:11px; color:var(--dim); margin-top:18px; padding-top:18px; border-top:1px solid var(--border); font-family:var(--fm); }
        .empty-state { grid-column:1/-1; padding:80px 0; text-align:center; color:var(--dim); font-family:var(--fm); font-size:13px; }
        @media(max-width:768px) { .cat-grid { grid-template-columns:1fr; padding:32px 24px 80px; } .cat-hero-inner { padding:0 24px; } }
      `}</style>

      {/* sticky nav */}
      <nav className="ao-nav">
        <button className="ao-back" onClick={() => router.back()} aria-label="Retour">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </button>
        <Link href="/" className="ao-logo">dev.<b>sec</b>.ops</Link>
        <div style={{width:80}} />
      </nav>

      {/* hero */}
      <div className="cat-hero">
        {/* background glow */}
        <div aria-hidden="true" style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse at 20% 60%, ${glow}, transparent 65%)`,
        }} />

        <div className="cat-hero-inner">
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:.6, ease:[0.16,1,0.3,1], delay:.1 }}
          >
            <div className="cat-eyebrow" style={{ color: col }}>
              <span style={{width:20,height:1,background:col,display:'inline-block'}} />
              {cat.label}
            </div>
            <h1 className="cat-main-title">{cat.label}</h1>
            <p className="cat-desc-text">{cat.desc}</p>
            <p className="cat-count">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
          </motion.div>
        </div>
      </div>

      {/* articles grid */}
      <div className="cat-grid">
        {articles.length === 0 && (
          <div className="empty-state">Aucun article dans cette catégorie pour l&apos;instant.</div>
        )}
        {articles.map((a, i) => {
          const { tc, thumb, tl } = getThemeClasses(a.theme)
          return (
            <motion.div
              key={a.slug}
              initial={{ opacity:0, y:40 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:.6, ease:[0.16,1,0.3,1], delay: .15 + i * 0.08 }}
            >
              <Link
                href={`/articles/${a.slug}`}
                className="ac"
                ref={el => { cards.current[i] = el }}
                onMouseMove={e => onMove(e, i)}
                onMouseLeave={() => onLeave(i)}
                aria-label={`Lire : ${a.title}`}
              >
                <div className="ac-thumb">
                  <div className={`ac-thumb-inner ${thumb}`} role="img" aria-label={`Miniature ${a.tag}`}>
                    <span className="ac-tl">{tl}</span>
                  </div>
                </div>
                <div className="ac-body">
                  <div className={`ac-tag ${tc}`}>{a.tag}</div>
                  <h2 className="ac-title">{a.title}</h2>
                  {a.excerpt && <p className="ac-excerpt">{a.excerpt}</p>}
                  <div className="ac-meta"><span>{a.date}</span><span>{a.read}</span></div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
