import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin · Analytics — dev.sec.ops',
}

interface ContentStat {
  content_type: string
  content_slug: string
  views_total: number
  views_unique: number
  views_7d: number
  views_30d: number
  last_seen: string
}

interface LabFunnel {
  lab_slug: string
  views: number
  started: number
  completed: number
  started_users: number
  completed_users: number
}

interface DailyTraffic {
  day: string
  views: number
  uniques: number
  labs_started: number
  labs_completed: number
  signups: number
  upgrades: number
}

interface ConversionStats {
  signups_30d: number
  upgrades_30d: number
  signups_total: number
  upgrades_total: number
}

function fmtPct(num: number, den: number): string {
  if (den <= 0) return '—'
  return `${Math.round((num / den) * 100)}%`
}

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin/analytics')
  if (profile.role !== 'admin') redirect('/account')

  const supabase = await createClient()

  const [contentRes, funnelRes, dailyRes, convRes] = await Promise.all([
    supabase.from('content_view_stats').select('*').order('views_30d', { ascending: false }).limit(20),
    supabase.from('lab_funnel_stats').select('*').order('views', { ascending: false }).limit(20),
    supabase.from('daily_traffic').select('*'),
    supabase.from('conversion_stats').select('*').maybeSingle(),
  ])

  const content = (contentRes.data ?? []) as ContentStat[]
  const funnels = (funnelRes.data ?? []) as LabFunnel[]
  const daily   = (dailyRes.data ?? []) as DailyTraffic[]
  const conv    = (convRes.data ?? { signups_30d: 0, upgrades_30d: 0, signups_total: 0, upgrades_total: 0 }) as ConversionStats

  // Stats agrégées 30j depuis daily
  const sum30 = daily.reduce((acc, d) => ({
    views:           acc.views + d.views,
    uniques:         acc.uniques + d.uniques,
    labs_started:    acc.labs_started + d.labs_started,
    labs_completed:  acc.labs_completed + d.labs_completed,
  }), { views: 0, uniques: 0, labs_started: 0, labs_completed: 0 })

  const maxViews = Math.max(1, ...daily.map(d => d.views))

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1300, margin:'0 auto' }}>
      <style>{`
        .an-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .an-title { font-family:var(--fd); font-size:clamp(30px,4vw,42px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:10px; }
        .an-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .an-sub { font-size:14px; color:var(--mid); font-weight:300; line-height:1.6; max-width:640px; margin-bottom:36px; }

        .an-kpi { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:36px; }
        @media(max-width:900px) { .an-kpi { grid-template-columns:repeat(2,1fr); } }
        .an-kpi-cell { background:var(--bg); padding:22px 24px; }
        .an-kpi-label { font-family:var(--fm); font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin-bottom:10px; }
        .an-kpi-num { font-family:var(--fd); font-size:28px; font-weight:700; color:var(--text); letter-spacing:-.02em; line-height:1; }
        .an-kpi-sub { font-family:var(--fm); font-size:10.5px; color:var(--c); margin-top:8px; letter-spacing:.06em; }

        .an-section { margin-bottom:48px; }
        .an-section-title { font-family:var(--fd); font-size:20px; font-weight:700; color:var(--text); margin-bottom:6px; letter-spacing:-.01em; }
        .an-section-sub { font-family:var(--fm); font-size:11px; color:var(--dim); letter-spacing:.06em; margin-bottom:18px; }

        .an-bars { display:grid; grid-template-columns:repeat(30, 1fr); align-items:end; gap:3px; height:130px; padding:14px 16px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.018); }
        .an-bar { background:linear-gradient(180deg, var(--v), color-mix(in oklab, var(--v) 50%, transparent)); border-radius:3px 3px 0 0; min-height:2px; position:relative; transition:filter .15s; }
        .an-bar:hover { filter:brightness(1.4); }
        .an-bar-empty { background:rgba(255,255,255,.05); }
        .an-bar::after {
          content: attr(data-tooltip); position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
          padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:rgba(15,15,22,.97);
          font-family:var(--fm); font-size:10px; color:var(--text); white-space:nowrap; opacity:0; pointer-events:none; transition:opacity .15s;
          z-index:10;
        }
        .an-bar:hover::after { opacity:1; }

        .an-table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--border); border-radius:12px; overflow:hidden; background:rgba(255,255,255,.018); }
        .an-table th { font-family:var(--fm); font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:13px 16px; text-align:left; border-bottom:1px solid var(--border); background:rgba(255,255,255,.022); font-weight:500; }
        .an-table td { padding:13px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--mid); font-family:var(--fb); }
        .an-table tr:last-child td { border-bottom:none; }
        .an-table tr:hover td { background:rgba(255,255,255,.018); }
        .an-table td.an-slug { font-family:var(--fm); font-size:12px; color:var(--text); }
        .an-table td.an-num { font-family:var(--fd); font-size:14px; color:var(--text); font-weight:600; text-align:right; }
        .an-table td.an-rate { font-family:var(--fm); font-size:11px; color:var(--c); letter-spacing:.04em; text-align:right; }
        .an-table td.an-rate.weak { color:var(--a); }

        .an-empty { padding:48px 20px; text-align:center; color:var(--dim); font-style:italic; }

        .an-funnel-bar { height:6px; background:rgba(255,255,255,.06); border-radius:100px; overflow:hidden; min-width:80px; }
        .an-funnel-bar > div { height:100%; background:linear-gradient(90deg, var(--v), var(--c)); }
      `}</style>

      <div className="an-stag">// admin · analytics</div>
      <h1 className="an-title">Vue d&apos;ensemble du <b>trafic</b></h1>
      <p className="an-sub">
        Compteurs 1st-party (sans cookies, sans IP, sans empreinte). Les vues sont émises par le navigateur via sendBeacon ;
        les events métier (lab terminé, quiz, upgrade) viennent des server actions.
      </p>

      <div className="an-kpi">
        <div className="an-kpi-cell">
          <div className="an-kpi-label">Vues (30j)</div>
          <div className="an-kpi-num">{sum30.views.toLocaleString('fr-FR')}</div>
          <div className="an-kpi-sub">{sum30.uniques} uniques</div>
        </div>
        <div className="an-kpi-cell">
          <div className="an-kpi-label">Labs démarrés</div>
          <div className="an-kpi-num">{sum30.labs_started}</div>
        </div>
        <div className="an-kpi-cell">
          <div className="an-kpi-label">Labs terminés</div>
          <div className="an-kpi-num" style={{ color:'var(--c)' }}>{sum30.labs_completed}</div>
        </div>
        <div className="an-kpi-cell">
          <div className="an-kpi-label">Signups (30j)</div>
          <div className="an-kpi-num">{conv.signups_30d}</div>
          <div className="an-kpi-sub">{conv.signups_total} total</div>
        </div>
        <div className="an-kpi-cell">
          <div className="an-kpi-label">Upgrades (30j)</div>
          <div className="an-kpi-num" style={{ color:'var(--v)' }}>{conv.upgrades_30d}</div>
          <div className="an-kpi-sub">{fmtPct(conv.upgrades_30d, conv.signups_30d)} conversion</div>
        </div>
      </div>

      <section className="an-section">
        <div className="an-section-title">Trafic quotidien — 30 derniers jours</div>
        <div className="an-section-sub">// barres = vues / jour, max {maxViews}</div>
        <div className="an-bars">
          {Array.from({ length: 30 }, (_, i) => {
            const ago = 29 - i
            const date = new Date()
            date.setDate(date.getDate() - ago)
            const dayKey = date.toISOString().slice(0, 10)
            const row = daily.find(d => d.day === dayKey)
            const v = row?.views ?? 0
            const h = v > 0 ? Math.max(2, Math.round((v / maxViews) * 100)) : 0
            const tip = `${date.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })} · ${v} vues`
            return (
              <div
                key={i}
                className={v === 0 ? 'an-bar an-bar-empty' : 'an-bar'}
                style={{ height:`${h}%` }}
                data-tooltip={tip}
                aria-label={tip}
              />
            )
          })}
        </div>
      </section>

      <section className="an-section">
        <div className="an-section-title">Top contenus — 30 derniers jours</div>
        <div className="an-section-sub">// vues uniques distinctes par (user_id ou anon_id)</div>
        <table className="an-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Slug</th>
              <th style={{ textAlign:'right' }}>Vues 7j</th>
              <th style={{ textAlign:'right' }}>Vues 30j</th>
              <th style={{ textAlign:'right' }}>Uniques</th>
            </tr>
          </thead>
          <tbody>
            {content.length === 0 && <tr><td colSpan={5} className="an-empty">Pas encore de vues enregistrées.</td></tr>}
            {content.map((c, i) => (
              <tr key={`${c.content_type}-${c.content_slug}-${i}`}>
                <td>{c.content_type}</td>
                <td className="an-slug">
                  {c.content_type === 'lab'
                    ? <Link href={`/labs/${c.content_slug}`}>{c.content_slug}</Link>
                    : c.content_slug}
                </td>
                <td className="an-num">{c.views_7d}</td>
                <td className="an-num">{c.views_30d}</td>
                <td className="an-num" style={{ color:'var(--c)' }}>{c.views_unique}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="an-section">
        <div className="an-section-title">Funnel par lab — vues → démarré → terminé</div>
        <div className="an-section-sub">// taux de complétion = terminé / vues</div>
        <table className="an-table">
          <thead>
            <tr>
              <th>Lab</th>
              <th style={{ textAlign:'right' }}>Vues</th>
              <th style={{ textAlign:'right' }}>Démarrés</th>
              <th style={{ textAlign:'right' }}>Terminés</th>
              <th style={{ textAlign:'right' }}>Taux</th>
              <th style={{ width:'18%' }}>Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {funnels.length === 0 && <tr><td colSpan={6} className="an-empty">Pas encore d&apos;activité sur les labs.</td></tr>}
            {funnels.map(f => {
              const pct = f.views > 0 ? Math.round((f.completed / f.views) * 100) : 0
              const weak = pct < 15
              return (
                <tr key={f.lab_slug}>
                  <td className="an-slug"><Link href={`/labs/${f.lab_slug}`}>{f.lab_slug}</Link></td>
                  <td className="an-num">{f.views}</td>
                  <td className="an-num">{f.started}</td>
                  <td className="an-num" style={{ color:'var(--c)' }}>{f.completed}</td>
                  <td className={`an-rate${weak ? ' weak' : ''}`}>{fmtPct(f.completed, f.views)}</td>
                  <td>
                    <div className="an-funnel-bar"><div style={{ width:`${pct}%` }} /></div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
