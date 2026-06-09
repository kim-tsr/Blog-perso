'use client'
import Link from 'next/link'
import ScrollReveal from './ScrollReveal'
import { LabMeta } from '@/lib/labs'
import { getThemeClasses, themeColorVar } from '@/lib/theme'

const DIFF_DOTS: Record<string, number> = {
  'débutant': 1, 'intermédiaire': 2, 'avancé': 3,
}

export default function LabsPreview({ labs }: { labs: LabMeta[] }) {
  if (labs.length === 0) return null
  const featured = labs.slice(0, 3)

  return (
    <section className="section" style={{ background:'var(--bg)', paddingTop:90, paddingBottom:90 }}>
      <style>{`
        .lp-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px; gap:24px; flex-wrap:wrap; }
        .lp-head h2 { font-family:var(--fd); font-size:clamp(32px,4vw,48px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); }
        .lp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:768px) { .lp-grid { grid-template-columns:1fr; } }
        .lp-card { display:flex; flex-direction:column; gap:0; padding:28px 26px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.025); transition:border-color .3s, transform .3s var(--ease), background .3s; min-height:230px; position:relative; overflow:hidden; }
        .lp-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--lp-col), transparent); opacity:0; transition:opacity .3s; }
        .lp-card:hover { border-color:color-mix(in oklab, var(--lp-col) 35%, var(--border)); transform:translateY(-4px); background:rgba(255,255,255,.04); }
        .lp-card:hover::before { opacity:1; }
        .lp-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .lp-tag { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--lp-col); }
        .lp-dur { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.08em; }
        .lp-title { font-family:var(--fd); font-size:17px; font-weight:600; letter-spacing:-.01em; line-height:1.4; color:var(--text); margin-bottom:12px; }
        .lp-obj { font-size:13px; color:var(--mid); line-height:1.6; font-weight:300; flex:1; margin-bottom:18px; }
        .lp-foot { display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--border); }
        .lp-diff { display:inline-flex; align-items:center; gap:5px; font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.06em; }
        .lp-diff-dot { width:5px; height:5px; border-radius:50%; background:var(--lp-col); }
        .lp-diff-dot.dim { background:rgba(255,255,255,.15); }
        .lp-cta { font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--lp-col); display:inline-flex; align-items:center; gap:5px; transition:gap .2s; }
        .lp-card:hover .lp-cta { gap:10px; }
      `}</style>
      <div className="container">
        <div className="lp-head">
          <div>
            <ScrollReveal><div className="stag">Pratique</div></ScrollReveal>
            <ScrollReveal clip>
              <h2 className="clip-inner">Apprendre en <span className="g" style={{background:'linear-gradient(135deg,var(--v),var(--c))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>pratiquant</span></h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.1}>
            <Link href="/labs" className="btn-g">
              Tous les labs
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </ScrollReveal>
        </div>

        <div className="lp-grid">
          {featured.map((lab, i) => {
            const { tc } = getThemeClasses(lab.theme)
            const col = themeColorVar(tc)
            const dots = DIFF_DOTS[lab.difficulty] || 1
            return (
              <ScrollReveal key={lab.slug} delay={i * 0.08}>
                <Link href={`/labs/${lab.slug}`} className="lp-card" style={{ '--lp-col': col } as React.CSSProperties}>
                  <div className="lp-meta">
                    <span className="lp-tag">{lab.tag}</span>
                    <span className="lp-dur">{lab.duration}</span>
                  </div>
                  <h3 className="lp-title">{lab.title}</h3>
                  <p className="lp-obj">{lab.objective}</p>
                  <div className="lp-foot">
                    <span className="lp-diff">
                      {[1,2,3].map(n => (
                        <span key={n} className={`lp-diff-dot${n > dots ? ' dim' : ''}`} aria-hidden="true" />
                      ))}
                      {lab.difficulty}
                    </span>
                    <span className="lp-cta">
                      Démarrer
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5.5 2.5L8 5 5.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
