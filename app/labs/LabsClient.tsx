'use client'
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import { LabMeta, LabDifficulty } from '@/lib/labs'
import { getThemeClasses } from '@/lib/theme'

const DIFFICULTIES: { key: 'all' | LabDifficulty; label: string }[] = [
  { key: 'all',           label: 'Tous' },
  { key: 'débutant',      label: 'Débutant' },
  { key: 'intermédiaire', label: 'Intermédiaire' },
  { key: 'avancé',        label: 'Avancé' },
]

const DIFF_DOTS: Record<LabDifficulty, number> = {
  'débutant':      1,
  'intermédiaire': 2,
  'avancé':        3,
}

const CATEGORIES: { key: 'all' | 'Infrastructure' | 'Cybersécurité' | 'Réseau'; label: string }[] = [
  { key: 'all',           label: 'Toutes' },
  { key: 'Infrastructure', label: 'Infrastructure' },
  { key: 'Cybersécurité',  label: 'Cybersécurité' },
  { key: 'Réseau',         label: 'Réseau' },
]

export default function LabsClient({ labs }: { labs: LabMeta[] }) {
  const cards = useRef<(HTMLAnchorElement | null)[]>([])
  const [diff, setDiff] = useState<'all' | LabDifficulty>('all')
  const [cat, setCat]   = useState<typeof CATEGORIES[number]['key']>('all')

  const filtered = useMemo(() => {
    return labs.filter(l =>
      (diff === 'all' || l.difficulty === diff) &&
      (cat === 'all'  || l.tag === cat)
    )
  }, [labs, diff, cat])

  const counts = useMemo(() => {
    const beg  = labs.filter(l => l.difficulty === 'débutant').length
    const int  = labs.filter(l => l.difficulty === 'intermédiaire').length
    const adv  = labs.filter(l => l.difficulty === 'avancé').length
    return { all: labs.length, 'débutant': beg, 'intermédiaire': int, 'avancé': adv }
  }, [labs])

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    const card = cards.current[i]; if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-6px)`
    card.style.transition = 'none'
  }
  const onLeave = (i: number) => {
    const card = cards.current[i]; if (!card) return
    card.style.transform = ''
    card.style.transition = 'transform .5s var(--ease)'
  }

  return (
    <>
      <style>{`
        .lab-hero { padding-top:140px; padding-bottom:64px; position:relative; overflow:hidden; background:var(--bg); }
        .lab-orb { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
        .lab-orb-1 { width:600px; height:500px; background:oklch(0.50 0.28 280/.12); top:-140px; right:-140px; }
        .lab-orb-2 { width:400px; height:400px; background:oklch(0.54 0.18 65/.08); bottom:-150px; left:-100px; }
        .lab-meta-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-top:48px; }
        @media(max-width:768px) { .lab-meta-grid { grid-template-columns:1fr; } }
        .lab-meta-cell { background:var(--bg); padding:24px 26px; }
        .lab-meta-num { font-family:var(--fd); font-size:30px; font-weight:700; line-height:1; letter-spacing:-.02em; }
        .lab-meta-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:10px; }
        .lab-meta-detail { font-size:12px; color:var(--mid); margin-top:4px; font-weight:300; }

        .lab-controls { display:flex; gap:24px; flex-wrap:wrap; margin-bottom:48px; align-items:center; }
        .lab-control-group { display:flex; gap:8px; flex-wrap:wrap; }
        .lab-pill { font-family:var(--fm); font-size:11px; letter-spacing:.08em; padding:8px 18px; border-radius:100px; border:1px solid var(--border); background:transparent; color:var(--dim); cursor:pointer; transition:color .2s, border-color .2s, background .2s; display:inline-flex; align-items:center; gap:8px; }
        .lab-pill:hover { color:var(--text); border-color:rgba(255,255,255,.2); }
        .lab-pill.active { color:var(--text); border-color:rgba(255,255,255,.25); background:rgba(255,255,255,.05); }
        .lab-pill-count { font-size:10px; padding:1px 7px; border-radius:100px; background:rgba(255,255,255,.05); opacity:.7; }

        .lab-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
        @media(max-width:900px) { .lab-grid { grid-template-columns:1fr; } }

        .lab-card { position:relative; padding:30px 30px 26px; border:1px solid var(--border); border-radius:16px; background:rgba(255,255,255,.025); overflow:hidden; transform-style:preserve-3d; will-change:transform; transition:border-color .4s, box-shadow .4s, transform .5s var(--ease); display:flex; flex-direction:column; gap:0; text-decoration:none; color:inherit; }
        .lab-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--lab-col), transparent); opacity:0; transition:opacity .4s; }
        .lab-card::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 0%, color-mix(in oklab, var(--lab-col) 15%, transparent), transparent 60%); opacity:0; transition:opacity .5s; pointer-events:none; border-radius:inherit; }
        .lab-card:hover { border-color:color-mix(in oklab, var(--lab-col) 40%, var(--border)); box-shadow:0 24px 64px rgba(0,0,0,.6); }
        .lab-card:hover::before, .lab-card:hover::after { opacity:1; }

        .lab-card-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:12px; }
        .lab-card-tag { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; padding:4px 11px; border-radius:100px; color:var(--lab-col); background:color-mix(in oklab, var(--lab-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--lab-col) 22%, transparent); white-space:nowrap; }
        .lab-card-num { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.1em; }

        .lab-card-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; line-height:1.2; color:var(--text); margin-bottom:14px; }
        .lab-card-obj { font-size:14px; color:var(--mid); line-height:1.7; font-weight:300; margin-bottom:22px; flex:1; }

        .lab-card-foot { display:flex; align-items:center; justify-content:space-between; padding-top:18px; border-top:1px solid var(--border); }
        .lab-card-meta { display:flex; align-items:center; gap:14px; font-family:var(--fm); font-size:11px; color:var(--dim); }
        .lab-card-meta span { display:inline-flex; align-items:center; gap:6px; }
        .lab-diff { display:inline-flex; align-items:center; gap:5px; }
        .lab-diff-dot { width:6px; height:6px; border-radius:50%; background:var(--lab-col); }
        .lab-diff-dot.dim { background:rgba(255,255,255,.15); }
        .lab-card-cta { display:inline-flex; align-items:center; gap:6px; font-family:var(--fm); font-size:11px; letter-spacing:.08em; color:var(--lab-col); transition:gap .2s; }
        .lab-card:hover .lab-card-cta { gap:12px; }

        .lab-empty { padding:80px 24px; text-align:center; border:1px dashed var(--border); border-radius:14px; }
        .lab-empty-title { font-family:var(--fd); font-size:20px; font-weight:600; color:var(--text); margin-bottom:8px; letter-spacing:-.01em; }
        .lab-empty-sub { font-size:14px; color:var(--mid); }
      `}</style>

      <section className="lab-hero">
        <div className="lab-orb lab-orb-1" aria-hidden="true" />
        <div className="lab-orb lab-orb-2" aria-hidden="true" />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <ScrollReveal><div className="stag">Pratique</div></ScrollReveal>
          <ScrollReveal clip>
            <h1 className="stitle clip-inner" style={{ marginBottom:18 }}>
              Les <span className="g">Labs</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="ssub" style={{ maxWidth:600 }}>
              Des exercices guidés pour mettre les mains dans la matière. Chaque lab a un objectif clair,
              des prérequis listés, une validation et des pistes pour aller plus loin.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="lab-meta-grid">
              <div className="lab-meta-cell">
                <div className="lab-meta-num" style={{ color:'var(--v)' }}>{counts['débutant']}</div>
                <div className="lab-meta-label">Débutant</div>
                <div className="lab-meta-detail">Pour démarrer sans douleur.</div>
              </div>
              <div className="lab-meta-cell">
                <div className="lab-meta-num" style={{ color:'var(--c)' }}>{counts['intermédiaire']}</div>
                <div className="lab-meta-label">Intermédiaire</div>
                <div className="lab-meta-detail">Quand les bases sont solides.</div>
              </div>
              <div className="lab-meta-cell">
                <div className="lab-meta-num" style={{ color:'var(--a)' }}>{counts['avancé']}</div>
                <div className="lab-meta-label">Avancé</div>
                <div className="lab-meta-detail">Pour mettre la pratique à l&apos;épreuve.</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="beam-sep" aria-hidden="true" />

      <section className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div className="lab-controls">
            <div className="lab-control-group" role="group" aria-label="Filtrer par difficulté">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.key}
                  className={`lab-pill${diff === d.key ? ' active' : ''}`}
                  onClick={() => setDiff(d.key)}
                  aria-pressed={diff === d.key}
                >
                  {d.label}
                  <span className="lab-pill-count">{counts[d.key as keyof typeof counts] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="lab-control-group" role="group" aria-label="Filtrer par domaine">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`lab-pill${cat === c.key ? ' active' : ''}`}
                  onClick={() => setCat(c.key)}
                  aria-pressed={cat === c.key}
                >{c.label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="lab-empty">
              <div className="lab-empty-title">Aucun lab pour ces filtres</div>
              <div className="lab-empty-sub">Élargissez les critères pour voir d&apos;autres exercices.</div>
            </div>
          ) : (
            <div className="lab-grid">
              {filtered.map((lab, i) => {
                const { tc } = getThemeClasses(lab.theme)
                const col = tc === 'tv' ? 'var(--v)' : tc === 'tc' ? 'var(--c)' : 'var(--a)'
                const dots = DIFF_DOTS[lab.difficulty]
                return (
                  <ScrollReveal key={lab.slug} delay={(i % 2) * 0.08}>
                    <Link
                      href={`/labs/${lab.slug}`}
                      className="lab-card"
                      ref={el => { cards.current[i] = el }}
                      onMouseMove={e => onMove(e, i)}
                      onMouseLeave={() => onLeave(i)}
                      style={{ '--lab-col': col } as React.CSSProperties}
                      aria-label={`Ouvrir le lab : ${lab.title}`}
                    >
                      {lab.minRole !== 'free' && (
                        <span style={{ position:'absolute', top:14, right:14, zIndex:2, display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:100, background:'rgba(7,7,12,.78)', backdropFilter:'blur(8px)', border:'1px solid oklch(0.68 0.24 280/.4)', color:'var(--v)', fontFamily:'var(--fm)', fontSize:9, letterSpacing:'.14em', textTransform:'uppercase' }} aria-label={`Contenu ${lab.minRole}`}>
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                          {lab.minRole}
                        </span>
                      )}
                      <div className="lab-card-head">
                        <span className="lab-card-tag">{lab.tag}</span>
                        <span className="lab-card-num">Lab · {String(i+1).padStart(2,'0')}</span>
                      </div>
                      <h3 className="lab-card-title">{lab.title}</h3>
                      <p className="lab-card-obj">{lab.objective}</p>
                      <div className="lab-card-foot">
                        <div className="lab-card-meta">
                          <span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                            {lab.duration}
                          </span>
                          <span className="lab-diff" aria-label={`Difficulté : ${lab.difficulty}`}>
                            {[1,2,3].map(n => (
                              <span key={n} className={`lab-diff-dot${n > dots ? ' dim' : ''}`} aria-hidden="true" />
                            ))}
                            {lab.difficulty}
                          </span>
                        </div>
                        <span className="lab-card-cta">
                          Commencer
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
