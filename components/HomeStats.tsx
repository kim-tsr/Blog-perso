'use client'
import ScrollReveal from './ScrollReveal'

interface Stat {
  num: string
  label: string
  detail: string
  color: string
}

export default function HomeStats({ stats }: { stats: Stat[] }) {
  return (
    <section style={{ background:'var(--bg)', padding:'90px 0' }}>
      <style>{`
        .hs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
        @media(max-width:768px) { .hs-grid { grid-template-columns:repeat(2,1fr); } }
        .hs-cell { background:var(--bg); padding:34px 30px; position:relative; transition:background .3s; }
        .hs-cell:hover { background:rgba(255,255,255,.025); }
        .hs-num { font-family:var(--fd); font-size:46px; font-weight:700; line-height:1; letter-spacing:-.03em; }
        .hs-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:14px; }
        .hs-detail { font-size:13px; color:var(--mid); margin-top:6px; font-weight:300; }
      `}</style>
      <div className="container">
        <ScrollReveal>
          <div className="hs-grid">
            {stats.map(s => (
              <div key={s.label} className="hs-cell">
                <div className="hs-num" style={{ color: s.color }}>{s.num}</div>
                <div className="hs-label">{s.label}</div>
                <div className="hs-detail">{s.detail}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
