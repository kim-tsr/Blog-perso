'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { moderateCommentAction } from './actions'

const STATUS_COLOR: Record<string, string> = {
  visible: 'var(--c)',
  hidden:  'var(--dim)',
  flagged: 'oklch(0.72 0.18 25)',
}

const STATUS_LABEL: Record<string, string> = {
  visible: 'visible',
  hidden:  'masqué',
  flagged: 'signalé',
}

export interface CommentAdminRow {
  id: number
  user_id: string
  author_name: string | null
  author_email: string | null
  lab_slug: string
  body: string
  status: 'visible' | 'hidden' | 'flagged'
  created_at: string
}

interface Props {
  comments: CommentAdminRow[]
}

export default function AdminCommentsClient({ comments }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden' | 'flagged'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return comments.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (!q) return true
      return (
        c.lab_slug.toLowerCase().includes(q) ||
        (c.author_email?.toLowerCase().includes(q) ?? false) ||
        (c.author_name?.toLowerCase().includes(q) ?? false) ||
        c.body.toLowerCase().includes(q)
      )
    })
  }, [comments, statusFilter, query])

  const counts = useMemo(() => ({
    visible: comments.filter(c => c.status === 'visible').length,
    hidden:  comments.filter(c => c.status === 'hidden').length,
    flagged: comments.filter(c => c.status === 'flagged').length,
  }), [comments])

  return (
    <div style={{ padding: '120px 48px 60px', maxWidth: 1300, margin: '0 auto' }}>
      <style>{`
        .ac-head { margin-bottom:32px; }
        .ac-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .ac-title { font-family:var(--fd); font-size:clamp(30px,4vw,42px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:10px; }
        .ac-title b { background:linear-gradient(135deg,var(--v),var(--a)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .ac-sub { font-size:14px; color:var(--mid); font-weight:300; line-height:1.6; max-width:640px; }

        .ac-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:12px; overflow:hidden; margin:28px 0; }
        @media(max-width:600px) { .ac-stats { grid-template-columns:repeat(2,1fr); } }
        .ac-stat { background:var(--bg); padding:18px 20px; }
        .ac-stat-num { font-family:var(--fd); font-size:24px; font-weight:700; color:var(--text); }
        .ac-stat-lab { font-family:var(--fm); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin-top:6px; }

        .ac-toolbar { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
        .ac-search { flex:1; min-width:220px; padding:11px 14px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); color:var(--text); font-family:var(--fb); font-size:13px; outline:none; transition:border-color .2s; }
        .ac-search:focus { border-color:var(--v); }
        .ac-filter-grp { display:flex; gap:1px; background:var(--border); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
        .ac-filter { padding:11px 14px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--mid); background:rgba(255,255,255,.018); cursor:pointer; border:none; transition:color .2s, background .2s; }
        .ac-filter:hover { color:var(--text); }
        .ac-filter.active { color:var(--text); background:rgba(255,255,255,.06); }

        .ac-table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); }
        .ac-table th { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; text-align:left; border-bottom:1px solid var(--border); background:rgba(255,255,255,.022); font-weight:500; }
        .ac-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--mid); vertical-align:top; }
        .ac-table tr:last-child td { border-bottom:none; }
        .ac-table tr:hover td { background:rgba(255,255,255,.018); }

        .ac-author { color:var(--text); font-weight:500; font-family:var(--fb); }
        .ac-email { font-size:12px; color:var(--dim); margin-top:2px; font-family:var(--fm); }
        .ac-body-excerpt { font-size:12.5px; color:var(--mid); line-height:1.5; max-width:320px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
        .ac-status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; border-radius:100px; border:1px solid var(--sc); background:color-mix(in oklab, var(--sc) 10%, transparent); color:var(--sc); }
        .ac-lab-link { font-family:var(--fm); font-size:11px; color:var(--c); letter-spacing:.04em; transition:color .2s; text-decoration:none; }
        .ac-lab-link:hover { color:var(--text); }
        .ac-date { font-family:var(--fm); font-size:11px; color:var(--dim); }
        .ac-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .ac-action-btn { padding:5px 12px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.08em; text-transform:uppercase; border:1px solid var(--border); background:transparent; cursor:pointer; color:var(--mid); transition:color .2s, border-color .2s, background .2s; }
        .ac-action-btn:hover:not(:disabled) { color:var(--text); border-color:rgba(255,255,255,.2); }
        .ac-action-btn:disabled { opacity:.4; cursor:not-allowed; }
        .ac-action-btn.show { color:var(--c); border-color:color-mix(in oklab, var(--c) 35%, var(--border)); }
        .ac-action-btn.hide { color:var(--a); border-color:color-mix(in oklab, var(--a) 35%, var(--border)); }
        .ac-action-btn.flag { color:oklch(0.72 0.18 25); border-color:color-mix(in oklab, oklch(0.72 0.18 25) 35%, var(--border)); }

        .ac-empty { padding:40px 20px; text-align:center; color:var(--dim); font-style:italic; }

        @media(max-width:900px) {
          .ac-table { font-size:12px; }
          .ac-table th, .ac-table td { padding:10px 12px; }
          .ac-hide-mobile { display:none; }
        }
      `}</style>

      <div className="ac-head">
        <div className="ac-stag">// admin · comments</div>
        <h1 className="ac-title">Modérer les <b>commentaires</b></h1>
        <p className="ac-sub">Gère la visibilité des commentaires postés sur les labs. Les commentaires masqués ne sont plus affichés aux visiteurs.</p>
      </div>

      <div className="ac-stats">
        <div className="ac-stat"><div className="ac-stat-num">{comments.length}</div><div className="ac-stat-lab">Total</div></div>
        <div className="ac-stat"><div className="ac-stat-num" style={{ color: 'var(--c)' }}>{counts.visible}</div><div className="ac-stat-lab">Visibles</div></div>
        <div className="ac-stat"><div className="ac-stat-num" style={{ color: 'var(--dim)' }}>{counts.hidden}</div><div className="ac-stat-lab">Masqués</div></div>
        <div className="ac-stat"><div className="ac-stat-num" style={{ color: 'oklch(0.72 0.18 25)' }}>{counts.flagged}</div><div className="ac-stat-lab">Signalés</div></div>
      </div>

      <div className="ac-toolbar">
        <input
          className="ac-search"
          placeholder="Rechercher par slug, auteur, contenu…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="ac-filter-grp">
          {(['all', 'visible', 'hidden', 'flagged'] as const).map(f => (
            <button key={f} type="button" className={`ac-filter${statusFilter === f ? ' active' : ''}`} onClick={() => setStatusFilter(f)}>
              {f === 'all' ? 'Tous' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <table className="ac-table">
        <thead>
          <tr>
            <th>Auteur</th>
            <th>Lab</th>
            <th>Commentaire</th>
            <th>Statut</th>
            <th className="ac-hide-mobile">Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="ac-empty">Aucun commentaire ne correspond.</td></tr>
          )}
          {filtered.map(c => (
            <tr key={c.id}>
              <td>
                <div className="ac-author">{c.author_name ?? '—'}</div>
                <div className="ac-email">{c.author_email ?? c.user_id.slice(0, 8)}</div>
              </td>
              <td>
                <Link href={`/labs/${c.lab_slug}`} className="ac-lab-link" target="_blank">
                  {c.lab_slug}
                </Link>
              </td>
              <td>
                <div className="ac-body-excerpt">{c.body}</div>
              </td>
              <td>
                <span className="ac-status-badge" style={{ '--sc': STATUS_COLOR[c.status] } as React.CSSProperties}>
                  {STATUS_LABEL[c.status]}
                </span>
              </td>
              <td className="ac-hide-mobile">
                <span className="ac-date">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
              </td>
              <td>
                <ModerationButtons comment={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ModerationButtons({ comment }: { comment: CommentAdminRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const moderate = (status: string) => {
    const fd = new FormData()
    fd.set('id', String(comment.id))
    fd.set('labSlug', comment.lab_slug)
    fd.set('status', status)
    startTransition(async () => {
      await moderateCommentAction(fd)
      router.refresh()
    })
  }

  return (
    <div className="ac-actions">
      {comment.status !== 'visible' && (
        <button className="ac-action-btn show" disabled={pending} onClick={() => moderate('visible')}>
          Restaurer
        </button>
      )}
      {comment.status !== 'hidden' && (
        <button className="ac-action-btn hide" disabled={pending} onClick={() => moderate('hidden')}>
          Masquer
        </button>
      )}
      {comment.status !== 'flagged' && (
        <button className="ac-action-btn flag" disabled={pending} onClick={() => moderate('flagged')}>
          Signaler
        </button>
      )}
    </div>
  )
}
