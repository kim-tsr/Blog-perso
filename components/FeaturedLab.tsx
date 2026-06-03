'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { LabMeta } from '@/lib/labs'
import { getThemeClasses } from '@/lib/theme'

export default function FeaturedLab({ lab }: { lab: LabMeta }) {
  const card = useRef<HTMLAnchorElement>(null)
  const { tc, thumb, tl } = getThemeClasses(lab.theme)

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
        .fl-wrap { display:grid; grid-template-columns:1.3fr 1fr; gap:0; border:1px solid var(--border); border-radius:18px; overflow:hidden; background:rgba(255,255,255,.02); transform-style:preserve-3d; will-change:transform; transition:border-color .4s, box-shadow .4s, transform .6s var(--ease); text-decoration:none; color:inherit; }
        .fl-wrap:hover { border-color:rgba(255,255,255,.14); box-shadow:0 32px 80px rgba(0,0,0,.7); }
        .fl-body { padding:52px 48px; display:flex; flex-direction:column; justify-content:center; }
        .fl-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:10px; }
        .fl-pill { padding:2px 10px; border-radius:100px; background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--mid); font-size:9px; }
        .fl-title { font-family:var(--fd); font-size:clamp(26px,3vw,44px); font-weight:700; letter-spacing:-.03em; line-height:1.1; color:var(--text); margin-bottom:16px; }
        .fl-obj { font-size:15px; color:var(--mid); font-weight:300; line-height:1.7; margin-bottom:32px; }
        .fl-meta { display:flex; gap:20px; font-family:var(--fm); font-size:11px; color:var(--dim); margin-bottom:36px; align-items:center; flex-wrap:wrap; }
        .fl-meta span { display:inline-flex; align-items:center; gap:6px; }
        .fl-cta { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:var(--text); transition:gap .2s; }
        .fl-wrap:hover .fl-cta { gap:14px; }
        .fl-thumb { position:relative; min-height:340px; overflow:hidden; }
        .fl-thumb-inner { width:100%; height:100%; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transition:transform .7s var(--ease); }
        .fl-wrap:hover .fl-thumb-inner { transform:scale(1.05); }
        .fl-tl { font-family:var(--fm); font-size:10px; letter-spacing:.14em; color:rgba(255,255,255,.3); text-transform:uppercase; }
        .fl-below { display:flex; justify-content:flex-end; margin-top:20px; }
        @media(max-width:768px) { .fl-wrap { grid-template-columns:1fr; } .fl-thumb { min-height:220px; } .fl-body { padding:32px 28px; } }
      `}</style>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 }}>
          <div className="stag">// lab à la une</div>
        </div>
        <Link
          href={`/labs/${lab.slug}`}
          className="fl-wrap"
          ref={card}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          aria-label={`Ouvrir le lab : ${lab.title}`}
        >
          <div className="fl-body">
            <div className={`fl-label ${tc}`}>
              <span>{lab.tag}</span>
              <span className="fl-pill">{lab.difficulty}</span>
            </div>
            <h2 className="fl-title">{lab.title}</h2>
            <p className="fl-obj">{lab.objective}</p>
            <div className="fl-meta">
              <span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                {lab.duration}
              </span>
              <span>{lab.tools.slice(0, 3).join(' · ')}</span>
            </div>
            <span className="fl-cta">
              Démarrer le lab
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className="fl-thumb">
            <div className={`fl-thumb-inner ${thumb}`} role="img" aria-label={`Miniature ${lab.tag}`}>
              <span className="fl-tl">{tl}</span>
            </div>
          </div>
        </Link>
        <div className="fl-below">
          <Link href="/labs" className="btn-g" style={{ fontSize:13 }}>
            Voir tous les labs
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
