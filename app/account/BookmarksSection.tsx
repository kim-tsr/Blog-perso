import Link from 'next/link'
import type { BookmarkRow } from '@/lib/bookmarks'
import type { LabMeta } from '@/lib/labs'

interface Props {
  bookmarks: BookmarkRow[]
  allLabs: LabMeta[]
}

export default function BookmarksSection({ bookmarks, allLabs }: Props) {
  const labMap = new Map(allLabs.map(l => [l.slug, l]))

  const labs = bookmarks.filter(b => b.content_type === 'lab')
    .map(b => ({ ...b, meta: labMap.get(b.content_slug) }))
    .filter(b => !!b.meta)

  return (
    <section className="ac-card" style={{ padding: '30px 30px 26px' }}>
      <style>{`
        .bms-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px; }
        .bms-head-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); }
        .bms-head-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .bms-count { font-family:var(--fm); font-size:11px; letter-spacing:.1em; color:var(--mid); }
        .bms-count b { color:var(--text); font-size:14px; font-family:var(--fd); }
        .bms-block { margin-top:18px; }
        .bms-block-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--a); margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; }
        .bms-block-label .bms-c { color:var(--dim); }
        .bms-list { display:flex; flex-direction:column; gap:8px; }
        .bms-item { display:flex; align-items:center; gap:14px; padding:12px 14px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.018); transition:border-color .3s, background .3s; }
        .bms-item:hover { border-color:rgba(255,255,255,.12); background:rgba(255,255,255,.03); }
        .bms-item-icon { width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }
        .bms-item-body { flex:1; min-width:0; }
        .bms-item-title { font-family:var(--fb); font-size:13px; font-weight:500; color:var(--text); line-height:1.4; }
        .bms-item-meta { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:3px; display:flex; gap:10px; letter-spacing:.06em; text-transform:uppercase; }
        .bms-item-arrow { color:var(--dim); transition:color .2s, transform .2s; }
        .bms-item:hover .bms-item-arrow { color:var(--text); transform:translateX(2px); }
        .bms-empty { font-size:13px; color:var(--dim); padding:18px 20px; border:1px dashed var(--border); border-radius:10px; text-align:center; line-height:1.6; }
        .bms-empty span.s { color:var(--a); font-weight:600; }
      `}</style>

      <div className="bms-head">
        <div>
          <div className="bms-head-label">// sauvegardés pour plus tard</div>
          <div className="bms-head-title">Mes favoris</div>
        </div>
        <div className="bms-count"><b>{bookmarks.length}</b> au total</div>
      </div>

      {bookmarks.length === 0 && (
        <div className="bms-empty">
          Aucun favori pour l&apos;instant. Clique sur <span className="s">Sauvegarder</span> en haut d&apos;un article ou lab pour le retrouver ici.
        </div>
      )}

      {labs.length > 0 && (
        <div className="bms-block">
          <div className="bms-block-label">
            <span>// labs</span>
            <span className="bms-c">{labs.length}</span>
          </div>
          <div className="bms-list">
            {labs.map(b => (
              <Link key={b.content_slug} href={`/labs/${b.content_slug}`} className="bms-item">
                <span className="bms-item-icon" style={{ color: 'var(--c)', background: 'color-mix(in oklab, var(--c) 12%, transparent)' }}>◆</span>
                <div className="bms-item-body">
                  <div className="bms-item-title">{b.meta!.title}</div>
                  <div className="bms-item-meta">
                    <span>{b.meta!.difficulty}</span>
                    <span>·</span>
                    <span>{b.meta!.duration}</span>
                  </div>
                </div>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="bms-item-arrow" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        </div>
      )}

    </section>
  )
}
