'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { ArticleMeta, getThemeClasses } from '@/lib/theme'
import ScrollReveal from './ScrollReveal'

interface Props { articles: ArticleMeta[] }

export default function ArticlesGrid({ articles }: Props) {
  const cards = useRef<(HTMLAnchorElement|null)[]>([])

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
    <>
      <style>{`
        .articles-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:60px; }
        .articles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        .ac { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transform-style:preserve-3d; will-change:transform; transition:border-color .4s,box-shadow .4s,transform .5s var(--ease); display:block; }
        .ac:hover { border-color:rgba(255,255,255,.14); box-shadow:0 24px 64px rgba(0,0,0,.6); }
        .ac-thumb { height:210px; position:relative; overflow:hidden; }
        .ac-thumb-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; transition:transform .6s var(--ease); }
        .ac:hover .ac-thumb-inner { transform:scale(1.06); }
        .ac-tl { font-family:var(--fm); font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.3); text-transform:uppercase; }
        .ac-body { padding:26px; }
        .ac-tag { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; margin-bottom:10px; }
        .ac-title { font-family:var(--fd); font-size:16px; font-weight:700; letter-spacing:-.015em; line-height:1.35; color:var(--text); margin-bottom:10px; }
        .ac-meta { display:flex; justify-content:space-between; font-size:11px; color:var(--dim); margin-top:18px; padding-top:18px; border-top:1px solid var(--border); font-family:var(--fm); }
        @media(max-width:768px) { .articles-grid { grid-template-columns:1fr; } .articles-head { flex-direction:column; align-items:flex-start; gap:20px; } }
      `}</style>
      <div className="articles-head reveal">
        <div>
          <div className="stag">Base de connaissances</div>
          <h2 className="stitle">Derniers articles</h2>
        </div>
        <Link href="/articles" className="btn-g" aria-label="Voir tous les articles">
          Tous les articles
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>
      <div className="articles-grid">
        {articles.map((a, i) => {
          const { tc, thumb, tl } = getThemeClasses(a.theme)
          return (
            <ScrollReveal key={a.slug} delay={(i % 3) * 0.1}>
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
                  <h3 className="ac-title">{a.title}</h3>
                  <div className="ac-meta"><span>{a.date}</span><span>{a.read}</span></div>
                </div>
              </Link>
            </ScrollReveal>
          )
        })}
      </div>
    </>
  )
}
