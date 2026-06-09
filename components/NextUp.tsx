import Link from 'next/link'
import type { LabMeta } from '@/lib/labs'
import { getThemeClasses, themeColorVar } from '@/lib/theme'

const DIFF_LETTER: Record<string, string> = {
  'débutant': 'D', 'intermédiaire': 'I', 'avancé': 'A',
}

interface Props {
  labs: LabMeta[]
  currentSeries?: string | null
}

export default function NextUp({ labs, currentSeries }: Props) {
  if (labs.length === 0) return null

  return (
    <section className="nu-wrap">
      <style>{`
        .nu-wrap { max-width:1100px; margin:0 auto; padding:60px 48px 0; }
        @media(max-width:768px) { .nu-wrap { padding:48px 24px 0; } }
        .nu-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:24px; gap:18px; flex-wrap:wrap; }
        .nu-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--c); margin-bottom:8px; }
        .nu-title { font-family:var(--fd); font-size:clamp(22px,3vw,28px); font-weight:700; letter-spacing:-.02em; color:var(--text); line-height:1.2; }
        .nu-link { font-family:var(--fm); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--mid); display:inline-flex; align-items:center; gap:8px; transition:color .2s, gap .2s; }
        .nu-link:hover { color:var(--text); gap:12px; }

        .nu-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:900px) { .nu-grid { grid-template-columns:1fr; } }

        .nu-card { position:relative; padding:24px 22px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.022); display:flex; flex-direction:column; gap:12px; transition:border-color .25s, transform .25s var(--ease), background .25s; min-height:170px; }
        .nu-card:hover { border-color: color-mix(in oklab, var(--nu-c) 45%, var(--border)); transform:translateY(-3px); background:rgba(255,255,255,.04); }
        .nu-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--nu-c), transparent); opacity:0; transition:opacity .3s; }
        .nu-card:hover::before { opacity:1; }

        .nu-meta { display:flex; justify-content:space-between; align-items:center; font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; }
        .nu-tag { color:var(--nu-c); }
        .nu-diff { color:var(--dim); display:inline-flex; align-items:center; gap:6px; }
        .nu-diff-pill { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background: color-mix(in oklab, var(--nu-c) 18%, transparent); color:var(--nu-c); font-family:var(--fm); font-size:9px; font-weight:600; }
        .nu-card-title { font-family:var(--fd); font-size:16px; font-weight:600; letter-spacing:-.01em; line-height:1.4; color:var(--text); flex:1; }
        .nu-obj { font-size:12.5px; color:var(--dim); line-height:1.55; }
        .nu-series-tag { display:inline-flex; align-items:center; gap:6px; font-family:var(--fm); font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--nu-c); padding:3px 8px; border:1px solid color-mix(in oklab, var(--nu-c) 35%, transparent); border-radius:100px; background:color-mix(in oklab, var(--nu-c) 10%, transparent); align-self:flex-start; }
      `}</style>

      <div className="nu-head">
        <div>
          <div className="nu-stag">// à faire ensuite</div>
          <h2 className="nu-title">Continue ta progression</h2>
        </div>
        <Link href="/labs" className="nu-link">
          Tous les labs
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      <div className="nu-grid">
        {labs.map(lab => {
          const { tc } = getThemeClasses(lab.theme)
          const col = themeColorVar(tc)
          const continuesSeries = lab.series && currentSeries && lab.series === currentSeries
          return (
            <Link key={lab.slug} href={`/labs/${lab.slug}`} className="nu-card" style={{ '--nu-c': col } as React.CSSProperties}>
              <div className="nu-meta">
                <span className="nu-tag">{lab.tag}</span>
                <span className="nu-diff">
                  <span className="nu-diff-pill" aria-hidden="true">{DIFF_LETTER[lab.difficulty]}</span>
                  {lab.duration}
                </span>
              </div>
              {continuesSeries && (
                <span className="nu-series-tag">Suite de la série</span>
              )}
              <div className="nu-card-title">{lab.title}</div>
              <div className="nu-obj">{lab.objective}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
