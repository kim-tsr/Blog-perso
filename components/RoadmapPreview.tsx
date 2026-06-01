'use client'
import Link from 'next/link'
import ScrollReveal from './ScrollReveal'

const NEXT_UP = [
  { title: 'Sigstore & supply chain : signer ce qu\'on déploie', tag: 'Sécurité', tc: 'tc', when: 'Juin 2026', status: 'En cours' },
  { title: 'eBPF pour les non-kernels : un mental model',        tag: 'Infrastructure', tc: 'tv', when: 'Juin 2026', status: 'Planifié' },
  { title: 'Service mesh : Istio vs Linkerd vs Cilium',          tag: 'Réseau', tc: 'ta', when: 'Juillet 2026', status: 'Planifié' },
]

export default function RoadmapPreview() {
  return (
    <section className="section" style={{ background:'var(--bg)', paddingTop:90, paddingBottom:90 }}>
      <style>{`
        .rp-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px; gap:24px; flex-wrap:wrap; }
        .rp-head h2 { font-family:var(--fd); font-size:clamp(32px,4vw,48px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); }
        .rp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:768px) { .rp-grid { grid-template-columns:1fr; } }
        .rp-card { padding:30px 26px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); transition:border-color .3s, transform .3s var(--ease), background .3s; display:flex; flex-direction:column; gap:14px; min-height:200px; }
        .rp-card:hover { border-color:rgba(255,255,255,.14); transform:translateY(-4px); background:rgba(255,255,255,.04); }
        .rp-meta { display:flex; justify-content:space-between; align-items:center; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
        .rp-tag { color:var(--rp-col); }
        .rp-when { color:var(--dim); }
        .rp-title { font-family:var(--fd); font-size:17px; font-weight:600; letter-spacing:-.01em; line-height:1.4; color:var(--text); flex:1; }
        .rp-status { display:inline-flex; align-items:center; gap:7px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--dim); margin-top:auto; }
        .rp-status::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--dim); }
        .rp-status.progress { color:var(--v); } .rp-status.progress::before { background:var(--v); box-shadow:0 0 10px var(--v); animation:stP 2s ease-in-out infinite; }
      `}</style>
      <div className="container">
        <div className="rp-head">
          <div>
            <ScrollReveal><div className="stag">À venir</div></ScrollReveal>
            <ScrollReveal clip>
              <h2 className="clip-inner">Sur la <span className="g" style={{background:'linear-gradient(135deg,var(--v),var(--c))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>roadmap</span></h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.1}>
            <Link href="/roadmap" className="btn-g">
              Toute la roadmap
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </ScrollReveal>
        </div>
        <div className="rp-grid">
          {NEXT_UP.map((it, i) => {
            const col = it.tc === 'tv' ? 'var(--v)' : it.tc === 'tc' ? 'var(--c)' : 'var(--a)'
            return (
              <ScrollReveal key={it.title} delay={i * 0.1}>
                <div className="rp-card" style={{ '--rp-col': col } as React.CSSProperties}>
                  <div className="rp-meta">
                    <span className="rp-tag">{it.tag}</span>
                    <span className="rp-when">{it.when}</span>
                  </div>
                  <div className="rp-title">{it.title}</div>
                  <div className={`rp-status${it.status === 'En cours' ? ' progress' : ''}`}>{it.status}</div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
