import Link from 'next/link'
import type { UserProgress } from '@/lib/progress'
import type { LabMeta } from '@/lib/labs'

interface Props {
  progress: UserProgress
  allLabs: LabMeta[]
}

export default function ProgressSection({ progress, allLabs }: Props) {
  const labMap = new Map(allLabs.map(l => [l.slug, l]))

  const startedLabs = progress.labs.filter(l => l.status === 'started')
                                   .map(l => ({ ...l, meta: labMap.get(l.lab_slug) }))
                                   .filter(l => !!l.meta)
  const completedLabs = progress.labs.filter(l => l.status === 'completed')
                                     .map(l => ({ ...l, meta: labMap.get(l.lab_slug) }))
                                     .filter(l => !!l.meta)

  const totalLabs = allLabs.length
  const labProgressPct = totalLabs > 0 ? Math.round((progress.summary.labs_completed / totalLabs) * 100) : 0

  return (
    <section className="ac-card" style={{ padding:'30px 30px 26px' }}>
      <style>{`
        .ps-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px; }
        .ps-head-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); }
        .ps-head-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }

        .ps-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:24px; }
        @media(max-width:600px) { .ps-stats { grid-template-columns:1fr; } }
        .ps-stat { background:rgba(255,255,255,.018); padding:18px 20px; }
        .ps-stat-num { font-family:var(--fd); font-size:26px; font-weight:700; line-height:1; letter-spacing:-.02em; }
        .ps-stat-label { font-family:var(--fm); font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:8px; }

        .ps-bar-wrap { margin-bottom:30px; }
        .ps-bar-meta { display:flex; justify-content:space-between; font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--dim); margin-bottom:8px; }
        .ps-bar-meta b { color:var(--text); }
        .ps-bar { width:100%; height:6px; background:rgba(255,255,255,.04); border-radius:100px; overflow:hidden; }
        .ps-bar-fill { height:100%; background:linear-gradient(90deg, var(--c), var(--v)); border-radius:100px; transition:width .6s var(--ease); }

        .ps-block { margin-top:22px; }
        .ps-block-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--v); margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; }
        .ps-block-label .ps-count { color:var(--dim); }
        .ps-list { display:flex; flex-direction:column; gap:8px; }
        .ps-item { display:flex; align-items:center; gap:14px; padding:12px 14px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.018); transition:border-color .3s, background .3s; }
        .ps-item:hover { border-color:rgba(255,255,255,.12); background:rgba(255,255,255,.03); }
        .ps-item-tick { width:18px; height:18px; border-radius:50%; background:var(--c); color:#062a30; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
        .ps-item-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .ps-item-dot.started { background:var(--a); box-shadow:0 0 8px var(--a); }
        .ps-item-body { flex:1; min-width:0; }
        .ps-item-title { font-family:var(--fb); font-size:13px; font-weight:500; color:var(--text); line-height:1.4; }
        .ps-item-meta { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:3px; display:flex; gap:10px; letter-spacing:.06em; text-transform:uppercase; }
        .ps-item-arrow { color:var(--dim); transition:color .2s, transform .2s; }
        .ps-item:hover .ps-item-arrow { color:var(--text); transform:translateX(2px); }

        .ps-empty { font-size:13px; color:var(--dim); padding:14px 16px; border:1px dashed var(--border); border-radius:10px; text-align:center; }
        .ps-empty a { color:var(--mid); text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px; }
        .ps-empty a:hover { color:var(--text); }
      `}</style>

      <div className="ps-head">
        <div>
          <div className="ps-head-label">// mon parcours</div>
          <div className="ps-head-title">Progression</div>
        </div>
      </div>

      <div className="ps-stats">
        <div className="ps-stat">
          <div className="ps-stat-num" style={{ color:'var(--c)' }}>{progress.summary.labs_completed}</div>
          <div className="ps-stat-label">Labs terminés</div>
        </div>
        <div className="ps-stat">
          <div className="ps-stat-num" style={{ color:'var(--a)' }}>{progress.summary.labs_started}</div>
          <div className="ps-stat-label">Labs en cours</div>
        </div>
        <div className="ps-stat">
          <div className="ps-stat-num" style={{ color:'var(--v)' }}>{labProgressPct}<span style={{ fontSize:'16px' }}>%</span></div>
          <div className="ps-stat-label">Progression globale</div>
        </div>
      </div>

      {totalLabs > 0 && (
        <div className="ps-bar-wrap">
          <div className="ps-bar-meta">
            <span><b>{progress.summary.labs_completed}</b> / {totalLabs} labs complétés</span>
            <span>{labProgressPct}%</span>
          </div>
          <div className="ps-bar"><div className="ps-bar-fill" style={{ width:`${labProgressPct}%` }} /></div>
        </div>
      )}

      {/* Labs terminés */}
      <div className="ps-block">
        <div className="ps-block-label">
          <span>// labs terminés</span>
          <span className="ps-count">{completedLabs.length}</span>
        </div>
        {completedLabs.length === 0 ? (
          <div className="ps-empty">Aucun lab terminé pour l&apos;instant. <Link href="/labs">Explorer les labs →</Link></div>
        ) : (
          <div className="ps-list">
            {completedLabs.slice(0, 5).map(l => (
              <Link key={l.lab_slug} href={`/labs/${l.lab_slug}`} className="ps-item">
                <span className="ps-item-tick" aria-hidden="true">✓</span>
                <div className="ps-item-body">
                  <div className="ps-item-title">{l.meta!.title}</div>
                  <div className="ps-item-meta">
                    <span>{l.meta!.difficulty}</span>
                    <span>·</span>
                    <span>{l.meta!.duration}</span>
                    {l.completed_at && (<><span>·</span><span>terminé {new Date(l.completed_at).toLocaleDateString('fr-FR')}</span></>)}
                  </div>
                </div>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="ps-item-arrow" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Labs en cours */}
      {startedLabs.length > 0 && (
        <div className="ps-block">
          <div className="ps-block-label">
            <span>// labs en cours</span>
            <span className="ps-count">{startedLabs.length}</span>
          </div>
          <div className="ps-list">
            {startedLabs.slice(0, 5).map(l => (
              <Link key={l.lab_slug} href={`/labs/${l.lab_slug}`} className="ps-item">
                <span className="ps-item-dot started" aria-hidden="true" />
                <div className="ps-item-body">
                  <div className="ps-item-title">{l.meta!.title}</div>
                  <div className="ps-item-meta">
                    <span style={{ color:'var(--a)' }}>en cours</span>
                    <span>·</span>
                    <span>{l.meta!.duration}</span>
                  </div>
                </div>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="ps-item-arrow" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        </div>
      )}

    </section>
  )
}
