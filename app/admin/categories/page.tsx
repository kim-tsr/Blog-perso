import { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminClient } from '@/lib/admin'

export const metadata: Metadata = { title: 'Admin · Catégories' }

interface Row {
  slug: string
  label: string
  description: string | null
  theme: 'violet' | 'cyan' | 'amber'
  display_order: number
}

const COLOR: Record<string, string> = {
  violet: 'var(--v)',
  cyan:   'var(--c)',
  amber:  'var(--a)',
}

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdminClient()
  const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
  const rows = (data ?? []) as Row[]

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`
        .ct-head { display:flex; justify-content:space-between; align-items:flex-end; gap:18px; flex-wrap:wrap; margin-bottom:38px; }
        .ct-head-l h1 { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-top:6px; }
        .ct-new { padding:10px 22px; border-radius:100px; background:var(--v); color:#fff; font-family:var(--fb); font-size:13px; font-weight:600; transition:transform .25s var(--ease); }
        .ct-new:hover { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .ct-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:900px) { .ct-grid { grid-template-columns:1fr; } }
        .ct-card { padding:26px 28px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.025); display:flex; flex-direction:column; gap:0; transition:border-color .3s, transform .3s var(--ease); }
        .ct-card:hover { border-color:color-mix(in oklab, var(--ct-col) 40%, var(--border)); transform:translateY(-3px); }
        .ct-head-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .ct-pill { display:inline-flex; align-items:center; gap:7px; padding:4px 11px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--ct-col); background:color-mix(in oklab, var(--ct-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--ct-col) 25%, transparent); }
        .ct-order { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.1em; }
        .ct-label { font-family:var(--fd); font-size:20px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:8px; }
        .ct-slug { font-family:var(--fm); font-size:11px; color:var(--dim); margin-bottom:14px; }
        .ct-desc { font-size:13px; color:var(--mid); line-height:1.65; font-weight:300; flex:1; margin-bottom:18px; }
        .ct-edit { font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--ct-col); display:inline-flex; align-items:center; gap:6px; transition:gap .2s; }
        .ct-card:hover .ct-edit { gap:12px; }
      `}</style>

      <div className="ct-head">
        <div className="ct-head-l">
          <div className="stag">// rubriques</div>
          <h1>Catégories ({rows.length})</h1>
        </div>
        <Link href="/admin/categories/new" className="ct-new">+ Nouvelle catégorie</Link>
      </div>

      <div className="ct-grid">
        {rows.map(c => (
          <Link key={c.slug} href={`/admin/categories/${c.slug}/edit`} className="ct-card" style={{ '--ct-col': COLOR[c.theme] } as React.CSSProperties}>
            <div className="ct-head-row">
              <span className="ct-pill">{c.theme}</span>
              <span className="ct-order">#{c.display_order}</span>
            </div>
            <div className="ct-label">{c.label}</div>
            <div className="ct-slug">/{c.slug}</div>
            <div className="ct-desc">{c.description ?? '—'}</div>
            <span className="ct-edit">
              Éditer
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5.5 2.5L8 5 5.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
