import { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminClient } from '@/lib/admin'
import { togglePublishedForm } from './actions'

export const metadata: Metadata = { title: 'Admin · Labs' }

interface LabRow {
  id: string
  slug: string
  title: string
  category_slug: string | null
  difficulty: string
  duration: string
  min_role: 'free' | 'pro' | 'admin'
  published: boolean
  scheduled_for: string | null
}

type LabStatus = 'published' | 'scheduled' | 'draft'

function labStatus(l: LabRow): LabStatus {
  if (l.published) return 'published'
  if (l.scheduled_for && new Date(l.scheduled_for) > new Date()) return 'scheduled'
  return 'draft'
}

export default async function AdminLabsPage() {
  const { supabase } = await requireAdminClient()
  const { data } = await supabase
    .from('labs')
    .select('id, slug, title, category_slug, difficulty, duration, min_role, published, scheduled_for')
    .order('updated_at', { ascending: false })
  const rows = (data ?? []) as LabRow[]

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`
        .lab-head { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:18px; margin-bottom:38px; }
        .lab-head-l h1 { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .lab-new { padding:10px 22px; border-radius:100px; background:var(--c); color:#062a30; font-family:var(--fb); font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:8px; transition:transform .25s var(--ease), box-shadow .3s; }
        .lab-new:hover { transform:translateY(-2px); box-shadow:0 12px 36px var(--gc); }
        .lab-table { width:100%; border-collapse:collapse; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); }
        .lab-table thead th { text-align:left; font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; border-bottom:1px solid var(--border); }
        .lab-table tbody td { padding:14px 16px; border-bottom:1px solid var(--border); color:var(--mid); font-size:13px; }
        .lab-table tbody tr:last-child td { border-bottom:none; }
        .lab-table tbody tr:hover td { background:rgba(255,255,255,.02); }
        .lab-title { color:var(--text); font-weight:500; }
        .lab-slug { font-family:var(--fm); font-size:11px; color:var(--dim); display:block; margin-top:3px; }
        .lab-pill { display:inline-block; padding:3px 9px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .lab-pill.free  { color:var(--dim); border:1px solid var(--border); }
        .lab-pill.pro   { color:var(--v); background:oklch(0.68 0.24 280/.1); border:1px solid oklch(0.68 0.24 280/.3); }
        .lab-pill.admin { color:var(--c); background:oklch(0.75 0.16 194/.1); border:1px solid oklch(0.75 0.16 194/.3); }
        .lab-actions { display:flex; gap:6px; justify-content:flex-end; }
        .lab-act { background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fm); font-size:10px; padding:5px 12px; border-radius:100px; cursor:pointer; letter-spacing:.08em; transition:color .2s, border-color .2s; }
        .lab-act:hover { color:var(--text); border-color:rgba(255,255,255,.18); }
        .lab-status { display:inline-flex; align-items:center; gap:6px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; padding:3px 9px; border-radius:100px; border:1px solid var(--st-c); background:color-mix(in oklab, var(--st-c) 10%, transparent); color:var(--st-c); }
        .lab-status::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--st-c); }
        .lab-sched { font-family:var(--fm); font-size:10px; color:var(--dim); display:block; margin-top:4px; letter-spacing:.04em; }
        .lab-empty { padding:60px 24px; text-align:center; border:1px dashed var(--border); border-radius:14px; color:var(--mid); font-size:13px; }
      `}</style>
      <div className="lab-head">
        <div className="lab-head-l">
          <div className="stag" style={{ color:'var(--c)' }}>// pratique</div>
          <h1>Labs ({rows.length})</h1>
        </div>
        <Link href="/admin/labs/new" className="lab-new">+ Nouveau lab</Link>
      </div>

      {rows.length === 0 ? (
        <div className="lab-empty">
          Aucun lab dans la base. <Link href="/admin/labs/new" style={{ color:'var(--c)', textDecoration:'underline' }}>Crée le premier</Link>.<br/>
          <span style={{ fontSize:11, color:'var(--dim)' }}>Les labs MDX restent visibles en parallèle tant qu&apos;ils sont dans <code style={{ fontFamily:'var(--fm)', color:'var(--c)' }}>content/labs/</code>.</span>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table className="lab-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Difficulté</th>
                <th>Durée</th>
                <th>Accès</th>
                <th>État</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="lab-title">{l.title}</div>
                    <span className="lab-slug">/{l.slug}</span>
                  </td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{l.category_slug ?? '—'}</span></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{l.difficulty}</span></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{l.duration}</span></td>
                  <td><span className={`lab-pill ${l.min_role}`}>{l.min_role}</span></td>
                  <td>
                    {(() => {
                      const s = labStatus(l)
                      const color = s === 'published' ? 'var(--c)' : s === 'scheduled' ? 'var(--a)' : 'var(--dim)'
                      const label = s === 'published' ? 'publié' : s === 'scheduled' ? 'programmé' : 'brouillon'
                      return (
                        <>
                          <span className="lab-status" style={{ '--st-c': color } as React.CSSProperties}>{label}</span>
                          {s === 'scheduled' && l.scheduled_for && (
                            <span className="lab-sched">{new Date(l.scheduled_for).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                          )}
                        </>
                      )
                    })()}
                  </td>
                  <td>
                    <div className="lab-actions">
                      <Link href={`/admin/labs/${l.id}/edit`} className="lab-act">Éditer</Link>
                      <form action={togglePublishedForm}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="published" value={l.published ? '0' : '1'} />
                        <button type="submit" className="lab-act">{l.published ? 'Dépublier' : 'Publier'}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
