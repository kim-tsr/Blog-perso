'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { ArticleMeta, getThemeClasses } from '@/lib/theme'

export default function FeaturedArticle({ article }: { article: ArticleMeta }) {
  const card = useRef<HTMLAnchorElement>(null)
  const { tc, thumb, tl } = getThemeClasses(article.theme)

  const onMove = (e: React.MouseEvent) => {
    if (!card.current) return
    const r = card.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.current.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 3}deg)`
    card.current.style.transition = 'none'
  }
  const onLeave = () => {
    if (!card.current) return
    card.current.style.transform = ''
    card.current.style.transition = 'transform .6s var(--ease)'
  }

  return (
    <section id="featured" data-section="featured" className="section" style={{ background: 'var(--bg)', paddingTop: 80, paddingBottom: 80 }}>
      <style>{`
        .fa-wrap { display:grid; grid-template-columns:1.3fr 1fr; gap:0; border:1px solid var(--border); border-radius:18px; overflow:hidden; background:rgba(255,255,255,.02); transform-style:preserve-3d; will-change:transform; transition:border-color .4s, box-shadow .4s, transform .6s var(--ease); text-decoration:none; color:inherit; display:grid; }
        .fa-wrap:hover { border-color:rgba(255,255,255,.14); box-shadow:0 32px 80px rgba(0,0,0,.7); }
        .fa-body { padding:52px 48px; display:flex; flex-direction:column; justify-content:center; }
        .fa-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; margin-bottom:10px; }
        .fa-title { font-family:var(--fd); font-size:clamp(26px,3vw,44px); font-weight:700; letter-spacing:-.03em; line-height:1.1; color:var(--text); margin-bottom:16px; }
        .fa-excerpt { font-size:15px; color:var(--mid); font-weight:300; line-height:1.7; margin-bottom:32px; }
        .fa-meta { display:flex; gap:20px; font-family:var(--fm); font-size:11px; color:var(--dim); margin-bottom:36px; }
        .fa-cta { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:var(--text); transition:gap .2s; }
        .fa-wrap:hover .fa-cta { gap:14px; }
        .fa-thumb { position:relative; min-height:340px; overflow:hidden; }
        .fa-thumb-inner { width:100%; height:100%; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transition:transform .7s var(--ease); }
        .fa-wrap:hover .fa-thumb-inner { transform:scale(1.05); }
        .fa-tl { font-family:var(--fm); font-size:10px; letter-spacing:.14em; color:rgba(255,255,255,.3); text-transform:uppercase; }
        .fa-below { display:flex; justify-content:flex-end; margin-top:20px; }
        @media(max-width:768px) { .fa-wrap { grid-template-columns:1fr; } .fa-thumb { min-height:220px; } .fa-body { padding:32px 28px; } }
      `}</style>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 }}>
          <ScrollRevealInline>
            <div className="stag">À la une</div>
          </ScrollRevealInline>
        </div>
        <Link
          href={`/articles/${article.slug}`}
          className="fa-wrap"
          ref={card}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          aria-label={`Lire : ${article.title}`}
        >
          <div className="fa-body">
            <div className={`fa-label ${tc}`}>{article.tag}</div>
            <h2 className="fa-title">{article.title}</h2>
            {article.excerpt && <p className="fa-excerpt">{article.excerpt}</p>}
            <div className="fa-meta">
              <span>{article.date}</span>
              <span>{article.read}</span>
            </div>
            <span className="fa-cta">
              Lire l&apos;article
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className="fa-thumb">
            <div className={`fa-thumb-inner ${thumb}`} role="img" aria-label={`Miniature ${article.tag}`}>
              <span className="fa-tl">{tl}</span>
            </div>
          </div>
        </Link>
        <div className="fa-below">
          <Link href="/blog" className="btn-g" style={{ fontSize:13 }}>
            Voir tous les articles
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ScrollRevealInline({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
