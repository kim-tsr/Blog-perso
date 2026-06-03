'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRole } from './actions'
import type { UserRow } from './page'

const ROLE_COLOR = {
  free: 'var(--dim)',
  pro:  'var(--c)',
  admin: 'var(--v)',
} as const

export default function AdminUsersClient({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'free' | 'pro' | 'admin'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q) || u.id.includes(q))
    })
  }, [users, query, roleFilter])

  const counts = useMemo(() => ({
    free:  users.filter(u => u.role === 'free').length,
    pro:   users.filter(u => u.role === 'pro').length,
    admin: users.filter(u => u.role === 'admin').length,
  }), [users])

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1300, margin:'0 auto' }}>
      <style>{`
        .au-head { margin-bottom:32px; }
        .au-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .au-title { font-family:var(--fd); font-size:clamp(30px,4vw,42px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:10px; }
        .au-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .au-sub { font-size:14px; color:var(--mid); font-weight:300; line-height:1.6; max-width:640px; }

        .au-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:12px; overflow:hidden; margin:28px 0; }
        @media(max-width:600px) { .au-stats { grid-template-columns:repeat(2,1fr); } }
        .au-stat { background:var(--bg); padding:18px 20px; }
        .au-stat-num { font-family:var(--fd); font-size:24px; font-weight:700; color:var(--text); }
        .au-stat-lab { font-family:var(--fm); font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin-top:6px; }

        .au-toolbar { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
        .au-search { flex:1; min-width:220px; padding:11px 14px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); color:var(--text); font-family:var(--fb); font-size:13px; outline:none; transition:border-color .2s; }
        .au-search:focus { border-color:var(--v); }
        .au-filter-grp { display:flex; gap:1px; background:var(--border); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
        .au-filter { padding:11px 14px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--mid); background:rgba(255,255,255,.018); cursor:pointer; border:none; transition:color .2s, background .2s; }
        .au-filter:hover { color:var(--text); }
        .au-filter.active { color:var(--text); background:rgba(255,255,255,.06); }

        .au-table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.018); }
        .au-table th { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:14px 16px; text-align:left; border-bottom:1px solid var(--border); background:rgba(255,255,255,.022); font-weight:500; }
        .au-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:13px; color:var(--mid); vertical-align:middle; }
        .au-table tr:last-child td { border-bottom:none; }
        .au-table tr:hover td { background:rgba(255,255,255,.018); }
        .au-name { color:var(--text); font-weight:500; font-family:var(--fb); }
        .au-email { font-size:12px; color:var(--dim); margin-top:2px; font-family:var(--fm); }
        .au-role-badge { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; border-radius:100px; border:1px solid var(--rc); background:color-mix(in oklab, var(--rc) 10%, transparent); color:var(--rc); }
        .au-stats-mini { display:flex; gap:14px; font-family:var(--fm); font-size:11px; color:var(--dim); }
        .au-stats-mini b { color:var(--text); font-family:var(--fd); font-size:13px; }

        .au-role-form { display:inline-flex; align-items:center; gap:6px; }
        .au-role-select { padding:7px 10px; border:1px solid var(--border); border-radius:8px; background:rgba(255,255,255,.025); color:var(--text); font-family:var(--fb); font-size:12px; cursor:pointer; outline:none; }
        .au-role-select:focus { border-color:var(--v); }
        .au-self { font-family:var(--fm); font-size:10px; color:var(--dim); letter-spacing:.1em; }

        .au-empty { padding:40px 20px; text-align:center; color:var(--dim); font-style:italic; }

        @media(max-width:900px) {
          .au-table { font-size:12px; }
          .au-table th, .au-table td { padding:10px 12px; }
          .au-hide-mobile { display:none; }
        }
      `}</style>

      <div className="au-head">
        <div className="au-stag">// admin · users</div>
        <h1 className="au-title">Gérer les <b>utilisateurs</b></h1>
        <p className="au-sub">Modifie les rôles, audite l&apos;activité, recherche un compte. Toute action est appliquée immédiatement et journalisée.</p>
      </div>

      <div className="au-stats">
        <div className="au-stat"><div className="au-stat-num">{users.length}</div><div className="au-stat-lab">Total</div></div>
        <div className="au-stat"><div className="au-stat-num" style={{ color:'var(--v)' }}>{counts.admin}</div><div className="au-stat-lab">Admins</div></div>
        <div className="au-stat"><div className="au-stat-num" style={{ color:'var(--c)' }}>{counts.pro}</div><div className="au-stat-lab">Pro</div></div>
        <div className="au-stat"><div className="au-stat-num">{counts.free}</div><div className="au-stat-lab">Free</div></div>
      </div>

      <div className="au-toolbar">
        <input
          className="au-search"
          placeholder="Rechercher par email, nom ou ID…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="au-filter-grp">
          {(['all','free','pro','admin'] as const).map(f => (
            <button key={f} type="button" className={`au-filter${roleFilter === f ? ' active' : ''}`} onClick={() => setRoleFilter(f)}>
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>
      </div>

      <table className="au-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th className="au-hide-mobile">Activité</th>
            <th className="au-hide-mobile">Inscrit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={5} className="au-empty">Aucun utilisateur ne correspond.</td></tr>
          )}
          {filtered.map(u => (
            <tr key={u.id}>
              <td>
                <div className="au-name">{u.name || u.email || u.id.slice(0, 8)}</div>
                <div className="au-email">{u.email}</div>
              </td>
              <td>
                <span className="au-role-badge" style={{ '--rc': ROLE_COLOR[u.role] } as React.CSSProperties}>{u.role}</span>
              </td>
              <td className="au-hide-mobile">
                <div className="au-stats-mini">
                  <span><b>{u.labs_completed}</b> labs ✓</span>
                  <span><b>{u.bookmarks_count}</b> favoris</span>
                  <span><b>{u.codes_redeemed}</b> codes</span>
                </div>
              </td>
              <td className="au-hide-mobile" style={{ fontFamily:'var(--fm)', fontSize:11 }}>
                {new Date(u.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td>
                {u.id === currentUserId
                  ? <span className="au-self">// vous-même</span>
                  : <RoleChanger user={u} />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RoleChanger({ user }: { user: UserRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'free' | 'pro' | 'admin'
    if (newRole === user.role) return
    if (!confirm(`Confirmer : passer ${user.email ?? user.id} de "${user.role}" à "${newRole}" ?`)) {
      e.target.value = user.role
      return
    }
    const fd = new FormData()
    fd.set('userId', user.id)
    fd.set('role', newRole)
    setError(null)
    startTransition(async () => {
      const r = await setUserRole(fd)
      if (!r.ok) setError(r.error || 'Erreur')
      router.refresh()
    })
  }

  return (
    <form className="au-role-form">
      <select className="au-role-select" defaultValue={user.role} disabled={pending} onChange={onChange}>
        <option value="free">free</option>
        <option value="pro">pro</option>
        <option value="admin">admin</option>
      </select>
      {error && <span style={{ color:'oklch(0.65 0.20 25)', fontSize:11, fontFamily:'var(--fm)' }}>{error}</span>}
    </form>
  )
}
