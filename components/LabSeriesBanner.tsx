import Link from 'next/link'
import type { LabMeta } from '@/lib/labs'

interface Props {
  current: LabMeta
  allInSeries: LabMeta[]
}

export default function LabSeriesBanner({ current, allInSeries }: Props) {
  if (!current.series) return null
  const sorted = [...allInSeries].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
  const idx = sorted.findIndex(l => l.slug === current.slug)
  const prev = idx > 0 ? sorted[idx - 1] : null
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null

  const seriesLabel = current.series
    .split('-')
    .map(w => w[0]?.toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="lsb-wrap">
      <style>{`
        .lsb-wrap { max-width:860px; margin:0 auto 18px; padding:0 48px; }
        @media(max-width:768px) { .lsb-wrap { padding:0 24px; } }
        .lsb { padding:22px 26px; border:1px solid var(--border); border-radius:14px; background:linear-gradient(180deg, oklch(0.50 0.28 280/.08), transparent); position:relative; overflow:hidden; }
        .lsb::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--v), var(--c), transparent); }
        .lsb-head { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .lsb-icon { font-size:14px; }
        .lsb-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--v); }
        .lsb-title { font-family:var(--fd); font-size:15px; font-weight:600; color:var(--text); letter-spacing:-.01em; }
        .lsb-progress { display:flex; gap:5px; margin-top:14px; }
        .lsb-step { flex:1; height:4px; border-radius:100px; background:rgba(255,255,255,.08); position:relative; overflow:hidden; }
        .lsb-step.done   { background:var(--c); }
        .lsb-step.active { background:linear-gradient(90deg, var(--v), var(--c)); }
        .lsb-meta { display:flex; justify-content:space-between; font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--dim); margin-top:10px; }
        .lsb-meta b { color:var(--text); }

        .lsb-nav { display:flex; justify-content:space-between; gap:10px; margin-top:18px; }
        .lsb-link { flex:1; padding:12px 14px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); transition:border-color .3s, background .3s, transform .3s var(--ease); display:flex; flex-direction:column; gap:3px; min-width:0; }
        .lsb-link:hover { border-color:rgba(255,255,255,.16); background:rgba(255,255,255,.04); }
        .lsb-link.next { text-align:right; align-items:flex-end; }
        .lsb-link.disabled { opacity:.35; pointer-events:none; }
        .lsb-link-dir { font-family:var(--fm); font-size:9px; letter-spacing:.16em; color:var(--dim); text-transform:uppercase; }
        .lsb-link-title { font-family:var(--fb); font-size:13px; color:var(--text); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      `}</style>

      <div className="lsb">
        <div className="lsb-head">
          <span className="lsb-icon" aria-hidden="true">📚</span>
          <span className="lsb-label">// série {current.series}</span>
        </div>
        <div className="lsb-title">{seriesLabel}</div>

        <div className="lsb-progress" aria-label="Progression dans la série">
          {sorted.map((l, i) => (
            <div key={l.slug} className={`lsb-step ${i < idx ? 'done' : i === idx ? 'active' : ''}`} title={`Lab ${i + 1} — ${l.title}`} />
          ))}
        </div>
        <div className="lsb-meta">
          <span>Étape <b>{idx + 1}</b> sur <b>{sorted.length}</b></span>
          <span>{Math.round(((idx + 1) / sorted.length) * 100)}% du parcours</span>
        </div>

        <div className="lsb-nav">
          {prev ? (
            <Link href={`/labs/${prev.slug}`} className="lsb-link">
              <span className="lsb-link-dir">← précédent</span>
              <span className="lsb-link-title">{prev.title}</span>
            </Link>
          ) : (
            <span className="lsb-link disabled">
              <span className="lsb-link-dir">← précédent</span>
              <span className="lsb-link-title">Début de série</span>
            </span>
          )}
          {next ? (
            <Link href={`/labs/${next.slug}`} className="lsb-link next">
              <span className="lsb-link-dir">suivant →</span>
              <span className="lsb-link-title">{next.title}</span>
            </Link>
          ) : (
            <span className="lsb-link next disabled">
              <span className="lsb-link-dir">suivant →</span>
              <span className="lsb-link-title">Fin de série 🎉</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
