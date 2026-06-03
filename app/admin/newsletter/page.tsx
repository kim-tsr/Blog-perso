import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin · Newsletter — dev.sec.ops',
}

interface SubRow {
  email:           string
  confirmed_at:    string | null
  unsubscribed_at: string | null
  source_page:     string | null
  created_at:      string
}

export default async function AdminNewsletterPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/newsletter')
  if (profile.role !== 'admin') redirect('/account')

  const supabase = await createClient()
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('email, confirmed_at, unsubscribed_at, source_page, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as SubRow[]

  const confirmed = rows.filter(r => r.confirmed_at && !r.unsubscribed_at)
  const pending   = rows.filter(r => !r.confirmed_at && !r.unsubscribed_at)
  const churned   = rows.filter(r => r.unsubscribed_at)

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1200, margin:'0 auto' }}>
      <style>{`
        .nw-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .nw-title { font-family:var(--fd); font-size:clamp(30px,4vw,42px); font-weight:700; letter-spacing:-.03em; color:var(--text); margin-bottom:10px; }
        .nw-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nw-sub { font-size:14px; color:var(--mid); font-weight:300; line-height:1.6; max-width:640px; margin-bottom:30px; }

        .nw-actions { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
        .nw-export { padding:9px 18px; border-radius:100px; background:var(--c); color:#062a30; font-family:var(--fb); font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:8px; }
        .nw-export:hover { transform:translateY(-1px); }

        .nw-kpi { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:32px; }
        @media(max-width:700px) { .nw-kpi { grid-template-columns:1fr; } }
        .nw-kpi-cell { background:var(--bg); padding:20px 24px; }
        .nw-kpi-num { font-family:var(--fd); font-size:28px; font-weight:700; color:var(--text); letter-spacing:-.02em; }
        .nw-kpi-lab { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:8px; }

        .nw-table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; }
        .nw-table th { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; text-align:left; border-bottom:1px solid var(--border); background:rgba(255,255,255,.022); font-weight:500; }
        .nw-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--mid); font-family:var(--fb); }
        .nw-table tr:last-child td { border-bottom:none; }
        .nw-email { color:var(--text); font-family:var(--fm); font-size:12.5px; }

        .nw-state { display:inline-flex; align-items:center; gap:6px; padding:3px 9px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
        .nw-state.ok { color:var(--c); border:1px solid color-mix(in oklab, var(--c) 35%, var(--border)); background:color-mix(in oklab, var(--c) 10%, transparent); }
        .nw-state.pending { color:var(--a); border:1px solid color-mix(in oklab, var(--a) 35%, var(--border)); background:color-mix(in oklab, var(--a) 10%, transparent); }
        .nw-state.gone { color:var(--dim); border:1px solid var(--border); }

        .nw-empty { padding:48px 20px; text-align:center; color:var(--dim); font-style:italic; }
      `}</style>

      <div className="nw-stag">// admin · newsletter</div>
      <h1 className="nw-title">Abonnés à la <b>newsletter</b></h1>
      <p className="nw-sub">Double opt-in via email. Pour activer l&apos;envoi automatique des emails de confirmation, configurer <code style={{ fontFamily:'var(--fm)', color:'var(--c)' }}>RESEND_API_KEY</code>.</p>

      <div className="nw-kpi">
        <div className="nw-kpi-cell"><div className="nw-kpi-num" style={{ color:'var(--c)' }}>{confirmed.length}</div><div className="nw-kpi-lab">Confirmés actifs</div></div>
        <div className="nw-kpi-cell"><div className="nw-kpi-num" style={{ color:'var(--a)' }}>{pending.length}</div><div className="nw-kpi-lab">En attente</div></div>
        <div className="nw-kpi-cell"><div className="nw-kpi-num">{churned.length}</div><div className="nw-kpi-lab">Désabonnés</div></div>
      </div>

      <div className="nw-actions">
        <a href="/admin/newsletter/export" className="nw-export" download="subscribers.csv">
          ↓ Exporter CSV ({confirmed.length} actifs)
        </a>
      </div>

      <table className="nw-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>État</th>
            <th>Source</th>
            <th style={{ textAlign:'right' }}>Inscrit le</th>
            <th style={{ textAlign:'right' }}>Confirmé le</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="nw-empty">Aucun abonné pour l&apos;instant.</td></tr>}
          {rows.map(r => {
            const state = r.unsubscribed_at ? 'gone' : (r.confirmed_at ? 'ok' : 'pending')
            const label = r.unsubscribed_at ? 'désabonné' : (r.confirmed_at ? 'actif' : 'en attente')
            return (
              <tr key={r.email}>
                <td><span className="nw-email">{r.email}</span></td>
                <td><span className={`nw-state ${state}`}>{label}</span></td>
                <td style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)' }}>{r.source_page ?? '—'}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--fm)', fontSize:11 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--fm)', fontSize:11 }}>{r.confirmed_at ? new Date(r.confirmed_at).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ marginTop:24, fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)' }}>
        <Link href="/admin">← Dashboard</Link>
      </div>
    </div>
  )
}
