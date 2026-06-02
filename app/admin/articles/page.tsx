import { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminClient } from '@/lib/admin'
import { togglePublishedForm } from './actions'

export const metadata: Metadata = { title: 'Admin · Articles' }

interface ArticleRow {
  id: string
  slug: string
  title: string
  category_slug: string | null
  date_label: string
  min_role: 'free' | 'pro' | 'admin'
  published: boolean
  updated_at: string
}

export default async function AdminArticlesPage() {
  const { supabase } = await requireAdminClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, category_slug, date_label, min_role, published, updated_at')
    .order('updated_at', { ascending: false })

  const rows = (articles ?? []) as ArticleRow[]

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`
        .aa-head { display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:18px; margin-bottom:38px; }
        .aa-head-l .stag { color:var(--v); }
        .aa-head-l h1 { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .aa-new { padding:10px 22px; border-radius:100px; background:var(--v); color:#fff; font-family:var(--fb); font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:8px; transition:transform .25s var(--ease), box-shadow .3s; }
        .aa-new:hover { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }

        .aa-table { width:100%; border-collapse:collapse; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); }
        .aa-table thead th { text-align:left; font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.015); }
        .aa-table tbody td { padding:14px 16px; border-bottom:1px solid var(--border); color:var(--mid); font-weight:300; vertical-align:middle; font-size:13px; }
        .aa-table tbody tr:last-child td { border-bottom:none; }
        .aa-table tbody tr:hover td { background:rgba(255,255,255,.02); }
        .aa-title { color:var(--text); font-weight:500; font-family:var(--fb); }
        .aa-slug { font-family:var(--fm); font-size:11px; color:var(--dim); display:block; margin-top:3px; }
        .aa-pill { display:inline-block; padding:3px 9px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .aa-pill.free  { color:var(--dim); border:1px solid var(--border); }
        .aa-pill.pro   { color:var(--v); background:oklch(0.68 0.24 280/.1); border:1px solid oklch(0.68 0.24 280/.3); }
        .aa-pill.admin { color:var(--c); background:oklch(0.75 0.16 194/.1); border:1px solid oklch(0.75 0.16 194/.3); }
        .aa-status { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .aa-status.on  { color:var(--c); }
        .aa-status.off { color:var(--dim); }
        .aa-actions { display:flex; gap:6px; justify-content:flex-end; }
        .aa-edit, .aa-toggle { background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fm); font-size:10px; padding:5px 12px; border-radius:100px; cursor:pointer; letter-spacing:.08em; transition:color .2s, border-color .2s, background .2s; }
        .aa-edit:hover, .aa-toggle:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }

        .aa-empty { padding:60px 24px; text-align:center; border:1px dashed var(--border); border-radius:14px; color:var(--mid); font-size:13px; }
      `}</style>
      <div className="aa-head">
        <div className="aa-head-l">
          <div className="stag">// gestion contenu</div>
          <h1>Articles ({rows.length})</h1>
        </div>
        <Link href="/admin/articles/new" className="aa-new">
          + Nouvel article
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="aa-empty">
          Aucun article dans la base. <Link href="/admin/articles/new" style={{ color:'var(--v)', textDecoration:'underline' }}>Crée le premier</Link>.<br/>
          <span style={{ fontSize:11, color:'var(--dim)' }}>Note : les articles MDX du dossier <code style={{ fontFamily:'var(--fm)', color:'var(--c)' }}>content/articles/</code> restent visibles sur le blog en parallèle.</span>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table className="aa-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Accès</th>
                <th>État</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="aa-title">{a.title}</div>
                    <span className="aa-slug">/{a.slug}</span>
                  </td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{a.category_slug ?? '—'}</span></td>
                  <td><span style={{ fontFamily:'var(--fm)', fontSize:11 }}>{a.date_label}</span></td>
                  <td><span className={`aa-pill ${a.min_role}`}>{a.min_role}</span></td>
                  <td><span className={`aa-status ${a.published ? 'on' : 'off'}`}>{a.published ? 'publié' : 'brouillon'}</span></td>
                  <td>
                    <div className="aa-actions">
                      <Link href={`/admin/articles/${a.id}/edit`} className="aa-edit">Éditer</Link>
                      <form action={togglePublishedForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="published" value={a.published ? '0' : '1'} />
                        <button type="submit" className="aa-toggle">
                          {a.published ? 'Dépublier' : 'Publier'}
                        </button>
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
