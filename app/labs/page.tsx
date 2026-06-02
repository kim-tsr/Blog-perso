import { Metadata } from 'next'
import Link from 'next/link'
import { getAllLabMeta, LabMeta } from '@/lib/labs'
import { getCurrentProfile } from '@/lib/auth'
import Footer from '@/components/Footer'
import LabsClient from './LabsClient'

export const metadata: Metadata = {
  title: 'Labs — dev.sec.ops',
  description: 'Exercices pratiques DevSecOps : Kubernetes, hardening, réseau, SIEM. Chaque lab a un objectif, des prérequis et une validation.',
}

const SERIES_LABELS: Record<string, { title: string; subtitle: string; theme: 'v' | 'c' | 'a' }> = {
  'homelab-from-zero': {
    title: 'Homelab from zero',
    subtitle: 'Construit progressivement un homelab DevSecOps complet — Proxmox, k3s+Cilium, ArgoCD, observabilité, Falco.',
    theme: 'v',
  },
}

export default async function LabsPage() {
  const [labs, profile] = await Promise.all([
    getAllLabMeta(),
    getCurrentProfile(),
  ])

  // Regroupement par série
  const seriesMap = new Map<string, LabMeta[]>()
  for (const l of labs) {
    if (l.series) {
      const arr = seriesMap.get(l.series) ?? []
      arr.push(l)
      seriesMap.set(l.series, arr)
    }
  }
  const series = Array.from(seriesMap.entries())
    .map(([slug, items]) => ({ slug, items: items.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)) }))
    .filter(s => s.items.length >= 2)

  return (
    <>
      <main>
        <LabsClient labs={labs} userRole={profile?.role ?? null} />

        {series.length > 0 && (
          <section className="section" style={{ background:'var(--bg)', paddingTop:40, paddingBottom:120 }}>
            <style>{`
              .ls-head { margin-bottom:36px; }
              .ls-head h2 { font-family:var(--fd); font-size:clamp(28px,3.5vw,38px); font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:8px; }
              .ls-card { padding:36px 38px; border:1px solid var(--border); border-radius:16px; background:linear-gradient(180deg, oklch(0.50 0.28 280/.08), transparent); position:relative; overflow:hidden; margin-bottom:18px; }
              .ls-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--ls-col), transparent); }
              .ls-card-head { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:18px; margin-bottom:20px; }
              .ls-card-l .meta { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--ls-col); margin-bottom:8px; display:flex; align-items:center; gap:8px; }
              .ls-card-l h3 { font-family:var(--fd); font-size:24px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:6px; }
              .ls-card-l p { font-size:14px; color:var(--mid); font-weight:300; line-height:1.65; max-width:560px; }
              .ls-count { font-family:var(--fm); font-size:11px; letter-spacing:.12em; color:var(--ls-col); white-space:nowrap; padding:6px 14px; border-radius:100px; background:color-mix(in oklab, var(--ls-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--ls-col) 25%, transparent); }
              .ls-steps { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-top:24px; }
              @media(max-width:900px) { .ls-steps { grid-template-columns:repeat(2,1fr); } }
              @media(max-width:560px) { .ls-steps { grid-template-columns:1fr; } }
              .ls-step { padding:16px 18px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.025); display:flex; flex-direction:column; gap:6px; transition:border-color .3s, transform .3s var(--ease), background .3s; min-height:130px; }
              .ls-step:hover { border-color:color-mix(in oklab, var(--ls-col) 35%, var(--border)); transform:translateY(-3px); background:rgba(255,255,255,.04); }
              .ls-step-num { font-family:var(--fm); font-size:11px; color:var(--ls-col); letter-spacing:.1em; }
              .ls-step-title { font-family:var(--fd); font-size:13px; font-weight:600; color:var(--text); line-height:1.35; flex:1; letter-spacing:-.01em; }
              .ls-step-meta { font-family:var(--fm); font-size:9px; color:var(--dim); letter-spacing:.08em; text-transform:uppercase; }
            `}</style>
            <div className="container">
              <div className="ls-head">
                <div className="stag">// parcours</div>
                <h2>Séries de labs <span className="g">chaînés</span></h2>
              </div>
              {series.map(s => {
                const info = SERIES_LABELS[s.slug] ?? { title: s.slug, subtitle: '', theme: 'v' as const }
                const col = info.theme === 'v' ? 'var(--v)' : info.theme === 'c' ? 'var(--c)' : 'var(--a)'
                return (
                  <div key={s.slug} className="ls-card" style={{ '--ls-col': col } as React.CSSProperties}>
                    <div className="ls-card-head">
                      <div className="ls-card-l">
                        <div className="meta">
                          <span>📚</span> série · {s.items.length} labs
                        </div>
                        <h3>{info.title}</h3>
                        <p>{info.subtitle}</p>
                      </div>
                      <span className="ls-count">{s.items.length} étapes</span>
                    </div>
                    <div className="ls-steps">
                      {s.items.map((l, i) => (
                        <Link key={l.slug} href={`/labs/${l.slug}`} className="ls-step">
                          <span className="ls-step-num">// étape {i + 1}</span>
                          <span className="ls-step-title">{l.title.replace(/^Homelab #\d+ — /, '')}</span>
                          <span className="ls-step-meta">{l.duration} · {l.difficulty}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
