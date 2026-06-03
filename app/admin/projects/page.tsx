import { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminClient } from '@/lib/admin'

export const metadata: Metadata = { title: 'Admin · Projets' }

interface Row {
  id: string
  title: string
  category_slug: string | null
  status: string
  year: string | null
  published: boolean
  display_order: number
  scheduled_for: string | null
}

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdminClient()
  const { data } = await supabase
    .from('projects')
    .select('id, title, category_slug, status, year, published, display_order, scheduled_for')
    .order('display_order', { ascending: true })
  const rows = (data ?? []) as Row[]

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`
        .pj-head { display:flex; justify-content:space-between; align-items:flex-end; gap:18px; flex-wrap:wrap; margin-bottom:38px; }
        .pj-head-l h1 { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .pj-new { padding:10px 22px; border-radius:100px; background:var(--a); color:#2a1b03; font-family:var(--fb); font-size:13px; font-weight:600; transition:transform .25s var(--ease); }
        .pj-new:hover { transform:translateY(-2px); box-shadow:0 12px 36px var(--ga); }
        .pj-table { width:100%; border-collapse:collapse; border:1px solid var(--border); border-radius:14px; overflow:hidden; }
        .pj-table thead th { text-align:left; font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.018); }
        .pj-table tbody td { padding:14px 16px; border-bottom:1px solid var(--border); color:var(--mid); font-size:13px; }
        .pj-table tbody tr:last-child td { border-bottom:none; }
        .pj-st { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; padding:3px 9px; border-radius:100px; }
        .pj-st.live    { color:var(--c); background:oklch(0.75 0.16 194/.1); border:1px solid oklch(0.75 0.16 194/.3); }
        .pj-st.beta    { color:var(--v); background:oklch(0.68 0.24 280/.1); border:1px solid oklch(0.68 0.24 280/.3); }
        .pj-st.wip     { color:var(--a); background:oklch(0.76 0.16 65/.1); border:1px solid oklch(0.76 0.16 65/.3); }
        .pj-st.archive { color:var(--dim); border:1px solid var(--border); }
        .pj-act { font-family:var(--fm); font-size:10px; padding:5px 12px; border:1px solid var(--border); border-radius:100px; color:var(--mid); letter-spacing:.08em; }
        .pj-act:hover { color:var(--text); border-color:rgba(255,255,255,.18); }
        .pj-empty { padding:60px 24px; text-align:center; border:1px dashed var(--border); border-radius:14px; color:var(--mid); font-size:13px; }
      `}</style>
      <div className="pj-head">
        <div className="pj-head-l">
          <div className="stag" style={{ color:'var(--a)' }}>// portfolio</div>
          <h1>Projets ({rows.length})</h1>
        </div>
        <Link href="/admin/projects/new" className="pj-new">+ Nouveau projet</Link>
      </div>

      {rows.length === 0 ? (
        <div className="pj-empty">Aucun projet. <Link href="/admin/projects/new" style={{ color:'var(--a)', textDecoration:'underline' }}>Crée le premier</Link>.</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table className="pj-table">
            <thead>
              <tr><th>Titre</th><th>Catégorie</th><th>Statut</th><th>Année</th><th>Ordre</th><th>État</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td><div style={{ color:'var(--text)', fontWeight:500 }}>{p.title}</div></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{p.category_slug ?? '—'}</span></td>
                  <td><span className={`pj-st ${p.status}`}>{p.status}</span></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{p.year ?? '—'}</span></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{p.display_order}</span></td>
                  <td>
                    {(() => {
                      const scheduled = !p.published && p.scheduled_for && new Date(p.scheduled_for) > new Date()
                      const color = p.published ? 'var(--c)' : scheduled ? 'var(--a)' : 'var(--dim)'
                      const label = p.published ? 'publié' : scheduled ? 'programmé' : 'brouillon'
                      return (
                        <>
                          <span style={{ fontFamily:'var(--fm)', fontSize:10, color, letterSpacing:'.1em', textTransform:'uppercase' }}>{label}</span>
                          {scheduled && p.scheduled_for && (
                            <span style={{ display:'block', fontFamily:'var(--fm)', fontSize:10, color:'var(--dim)', marginTop:3 }}>
                              {new Date(p.scheduled_for).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </td>
                  <td style={{ textAlign:'right' }}>
                    <Link href={`/admin/projects/${p.id}/edit`} className="pj-act">Éditer</Link>
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
