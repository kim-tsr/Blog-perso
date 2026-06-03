import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin · Audit — dev.sec.ops',
}

interface AuditRow {
  id: number
  actor_id: string | null
  actor_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  'user.role_changed':   'var(--v)',
  'lab.created':         'var(--c)',
  'lab.updated':         'var(--c)',
  'lab.deleted':         'oklch(0.65 0.20 25)',
  'lab.published':       'var(--c)',
  'lab.unpublished':     'var(--a)',
  'project.created':     'var(--c)',
  'project.updated':     'var(--c)',
  'project.deleted':     'oklch(0.65 0.20 25)',
  'category.created':    'var(--c)',
  'category.updated':    'var(--c)',
  'category.deleted':    'oklch(0.65 0.20 25)',
  'code.created':        'var(--c)',
  'code.enabled':        'var(--c)',
  'code.disabled':       'var(--a)',
  'code.deleted':        'oklch(0.65 0.20 25)',
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleString('fr-FR', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AuditPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/audit')
  if (profile.role !== 'admin') redirect('/account')

  const supabase = await createClient()
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (data ?? []) as AuditRow[]

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1200, margin:'0 auto' }}>
      <style>{`
        .ad-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .ad-title { font-family:var(--fd); font-size:clamp(30px,4vw,42px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:10px; }
        .ad-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .ad-sub { font-size:14px; color:var(--mid); font-weight:300; line-height:1.6; max-width:640px; margin-bottom:36px; }

        .ad-table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); }
        .ad-table th { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; text-align:left; border-bottom:1px solid var(--border); background:rgba(255,255,255,.022); font-weight:500; }
        .ad-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--mid); vertical-align:top; font-family:var(--fb); }
        .ad-table tr:last-child td { border-bottom:none; }
        .ad-when { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.04em; white-space:nowrap; }
        .ad-actor { color:var(--text); font-weight:500; }
        .ad-actor-anon { color:var(--dim); font-style:italic; }
        .ad-action {
          display:inline-flex; align-items:center;
          padding:3px 10px; font-family:var(--fm); font-size:10.5px; letter-spacing:.06em;
          border-radius:100px; border:1px solid var(--ac-c);
          background: color-mix(in oklab, var(--ac-c) 10%, transparent);
          color: var(--ac-c);
        }
        .ad-target { font-family:var(--fm); font-size:11px; color:var(--mid); }
        .ad-target b { color:var(--text); font-family:var(--fb); }
        .ad-payload { font-family:var(--fm); font-size:11px; color:var(--dim); white-space:pre-wrap; word-break:break-all; max-width:340px; }

        .ad-empty { padding:60px 20px; text-align:center; color:var(--dim); font-style:italic; }

        @media(max-width:900px) { .ad-hide-mobile { display:none; } }
      `}</style>

      <div className="ad-stag">// admin · audit</div>
      <h1 className="ad-title">Journal des <b>actions admin</b></h1>
      <p className="ad-sub">200 dernières actions admin (changements de rôle, création/suppression de contenu, codes d&apos;accès). Append-only, lisible uniquement par les admins.</p>

      <table className="ad-table">
        <thead>
          <tr>
            <th>Quand</th>
            <th>Acteur</th>
            <th>Action</th>
            <th>Cible</th>
            <th className="ad-hide-mobile">Détails</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={5} className="ad-empty">Aucune action enregistrée pour l&apos;instant.</td></tr>
          )}
          {rows.map(row => {
            const color = ACTION_COLORS[row.action] || 'var(--dim)'
            const payloadStr = Object.keys(row.payload || {}).length > 0
              ? JSON.stringify(row.payload, null, 0).replace(/[{}"]/g, '').replace(/,/g, ', ')
              : '—'
            return (
              <tr key={row.id}>
                <td className="ad-when">{fmtDate(row.created_at)}</td>
                <td>
                  {row.actor_email
                    ? <span className="ad-actor">{row.actor_email}</span>
                    : <span className="ad-actor-anon">{row.actor_id?.slice(0, 8) ?? 'anonyme'}</span>}
                </td>
                <td>
                  <span className="ad-action" style={{ '--ac-c': color } as React.CSSProperties}>
                    {row.action}
                  </span>
                </td>
                <td>
                  <span className="ad-target">
                    {row.target_type ? <><b>{row.target_type}</b> · {row.target_id ?? '—'}</> : '—'}
                  </span>
                </td>
                <td className="ad-hide-mobile">
                  <div className="ad-payload">{payloadStr}</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
