'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAccessCode, toggleAccessCode, deleteAccessCode } from './actions'
import type { AccessCodeRow, RedemptionRow } from './page'

interface Props {
  codes: AccessCodeRow[]
  redemptions: RedemptionRow[]
}

const ROLE_COLOR: Record<string, string> = {
  free:  'var(--dim)',
  pro:   'var(--v)',
  admin: 'var(--c)',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
}

export default function AdminCodesClient({ codes, redemptions }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [lastCreated, setLastCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      setError(null)
      const r = await createAccessCode(fd)
      if (r.ok && r.code) {
        setLastCreated(r.code)
        form.reset()
        router.refresh()
      } else {
        setError(r.error || 'Erreur inconnue')
      }
    })
  }

  const onToggle = (code: string, disabled: boolean) => {
    startTransition(async () => {
      await toggleAccessCode(code, disabled)
      router.refresh()
    })
  }

  const onDelete = (code: string) => {
    if (!confirm(`Supprimer définitivement le code ${code} ?`)) return
    startTransition(async () => {
      await deleteAccessCode(code)
      router.refresh()
    })
  }

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 1600)
    } catch {}
  }

  return (
    <>
      <style>{`
        .ad-hero { padding-top:140px; padding-bottom:48px; position:relative; overflow:hidden; background:var(--bg); }
        .ad-orb { position:absolute; width:560px; height:400px; border-radius:50%; filter:blur(120px); background:oklch(0.50 0.18 194/.10); top:-130px; right:-130px; pointer-events:none; }
        .ad-grid { display:grid; grid-template-columns:1.05fr 1fr; gap:32px; margin-top:36px; align-items:start; }
        @media(max-width:980px) { .ad-grid { grid-template-columns:1fr; } }

        .ad-card { background:rgba(255,255,255,.025); border:1px solid var(--border); border-radius:14px; padding:30px 30px; position:relative; }
        .ad-card-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--v); margin-bottom:18px; }
        .ad-card h3 { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:10px; }
        .ad-card p { font-size:13px; color:var(--mid); line-height:1.7; font-weight:300; margin-bottom:24px; }

        .ad-field { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
        .ad-field-label { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
        .ad-input, .ad-select { background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--fb); font-size:14px; padding:11px 16px; outline:none; transition:border-color .2s, background .2s; }
        .ad-input:focus, .ad-select:focus { border-color:var(--v); background:rgba(255,255,255,.06); }
        .ad-input::placeholder { color:var(--dim); }
        .ad-input.mono { font-family:var(--fm); letter-spacing:.06em; }
        .ad-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:560px) { .ad-row { grid-template-columns:1fr; } }

        .ad-create-btn { width:100%; margin-top:8px; padding:13px 22px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:14px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; }
        .ad-create-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .ad-create-btn:disabled { opacity:.55; cursor:not-allowed; }

        .ad-banner { margin-top:20px; padding:18px 20px; border:1px solid oklch(0.75 0.16 194/.4); background:oklch(0.75 0.16 194/.08); border-radius:12px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .ad-banner-text { font-size:13px; color:var(--mid); }
        .ad-banner code { font-family:var(--fm); font-size:14px; color:oklch(0.86 0.14 194); padding:4px 10px; background:rgba(255,255,255,.04); border-radius:6px; letter-spacing:.08em; }
        .ad-banner-copy { font-family:var(--fm); font-size:11px; letter-spacing:.1em; padding:7px 14px; border-radius:100px; border:1px solid oklch(0.75 0.16 194/.5); background:transparent; color:oklch(0.86 0.14 194); cursor:pointer; transition:background .2s; }
        .ad-banner-copy:hover { background:oklch(0.75 0.16 194/.1); }

        .ad-err { margin-top:14px; padding:12px 16px; border:1px solid oklch(0.65 0.20 25/.4); background:oklch(0.65 0.20 25/.08); border-radius:10px; color:oklch(0.82 0.16 25); font-family:var(--fm); font-size:12px; }

        .ad-table { width:100%; border-collapse:collapse; font-size:13px; }
        .ad-table thead th { text-align:left; font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); padding:0 12px 14px; border-bottom:1px solid var(--border); white-space:nowrap; }
        .ad-table tbody td { padding:14px 12px; border-bottom:1px solid var(--border); color:var(--mid); font-weight:300; vertical-align:middle; }
        .ad-table tbody tr:last-child td { border-bottom:none; }
        .ad-table tbody tr:hover td { background:rgba(255,255,255,.015); }
        .ad-code-cell { font-family:var(--fm); font-size:13px; color:var(--text); letter-spacing:.06em; display:inline-flex; align-items:center; gap:8px; }
        .ad-copy { background:transparent; border:1px solid var(--border); color:var(--dim); font-family:var(--fm); font-size:9px; padding:3px 8px; border-radius:6px; cursor:pointer; letter-spacing:.1em; transition:color .2s, border-color .2s, background .2s; }
        .ad-copy:hover { color:var(--text); border-color:rgba(255,255,255,.2); background:rgba(255,255,255,.05); }
        .ad-copy.copied { color:var(--c); border-color:var(--c); }
        .ad-role-pill { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--rl-col); background:color-mix(in oklab, var(--rl-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--rl-col) 25%, transparent); }
        .ad-role-pill .dot { width:5px; height:5px; border-radius:50%; background:var(--rl-col); }
        .ad-status { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
        .ad-status.on  { color:var(--c); }
        .ad-status.off { color:var(--dim); }
        .ad-actions { display:flex; gap:6px; justify-content:flex-end; }
        .ad-act { background:transparent; border:1px solid var(--border); color:var(--mid); font-family:var(--fm); font-size:10px; padding:5px 10px; border-radius:100px; cursor:pointer; letter-spacing:.08em; transition:color .2s, border-color .2s, background .2s; }
        .ad-act:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .ad-act.danger { color:oklch(0.78 0.16 25); border-color:oklch(0.65 0.20 25/.3); }
        .ad-act.danger:hover { color:oklch(0.86 0.16 25); background:oklch(0.65 0.20 25/.08); }

        .ad-empty { padding:48px 24px; text-align:center; border:1px dashed var(--border); border-radius:12px; color:var(--mid); font-size:13px; }

        .ad-redemptions { margin-top:48px; }
        .ad-redemptions h3 { font-family:var(--fd); font-size:20px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:20px; }
      `}</style>

      <section className="ad-hero">
        <div className="ad-orb" aria-hidden="true" />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div className="stag">Espace admin</div>
          <h1 className="stitle" style={{ marginBottom:14 }}>
            Codes <span className="g">d&apos;accès</span>
          </h1>
          <p className="ssub" style={{ marginBottom:0, maxWidth:600 }}>
            Générez des codes à partager. Chaque code octroie un rôle aux utilisateurs qui l&apos;activent depuis leur compte.
          </p>
        </div>
      </section>

      <div className="beam-sep" aria-hidden="true" />

      <section className="section" style={{ paddingTop:48, paddingBottom:80, background:'var(--bg)' }}>
        <div className="container">
          <div className="ad-grid">
            {/* ─── Form de création ─── */}
            <div className="ad-card">
              <div className="ad-card-label">// Nouveau code</div>
              <h3>Créer un code</h3>
              <p>Laissez le champ « Code » vide pour générer automatiquement un code unique au format DSO-XXXX-XXXX.</p>
              <form onSubmit={onCreate}>
                <div className="ad-field">
                  <label className="ad-field-label" htmlFor="ad-code">Code (optionnel)</label>
                  <input id="ad-code" name="code" className="ad-input mono" placeholder="auto-généré" autoComplete="off" />
                </div>
                <div className="ad-row">
                  <div className="ad-field">
                    <label className="ad-field-label" htmlFor="ad-role">Rôle octroyé</label>
                    <select id="ad-role" name="grantsRole" className="ad-select" defaultValue="pro">
                      <option value="pro">pro</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className="ad-field">
                    <label className="ad-field-label" htmlFor="ad-max">Utilisations max</label>
                    <input id="ad-max" name="maxUses" type="number" min="1" className="ad-input" placeholder="illimité" />
                  </div>
                </div>
                <div className="ad-field">
                  <label className="ad-field-label" htmlFor="ad-exp">Expiration (optionnelle)</label>
                  <input id="ad-exp" name="expiresAt" type="datetime-local" className="ad-input" />
                </div>
                <div className="ad-field">
                  <label className="ad-field-label" htmlFor="ad-desc">Description (optionnelle)</label>
                  <input id="ad-desc" name="description" className="ad-input" placeholder="Beta testers, conférence X…" />
                </div>
                <button type="submit" className="ad-create-btn" disabled={pending}>
                  {pending ? 'Création…' : 'Générer le code'}
                </button>
              </form>

              {lastCreated && (
                <div className="ad-banner">
                  <div className="ad-banner-text">
                    Code créé :&nbsp;<code>{lastCreated}</code>
                  </div>
                  <button type="button" className="ad-banner-copy" onClick={() => copy(lastCreated)}>
                    {copied === lastCreated ? '✓ copié' : 'Copier'}
                  </button>
                </div>
              )}
              {error && <div className="ad-err">{error}</div>}
            </div>

            {/* ─── Table de codes ─── */}
            <div className="ad-card" style={{ padding:'24px 8px' }}>
              <div style={{ padding:'0 22px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <div>
                  <div className="ad-card-label" style={{ marginBottom:8 }}>// Codes existants</div>
                  <h3 style={{ fontFamily:'var(--fd)', fontSize:18, color:'var(--text)', letterSpacing:'-.01em' }}>{codes.length} code{codes.length > 1 ? 's' : ''}</h3>
                </div>
                <span style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--dim)', letterSpacing:'.1em' }}>
                  total redemptions : {codes.reduce((acc, c) => acc + (c.redeemed_count ?? c.uses_count), 0)}
                </span>
              </div>
              {codes.length === 0 ? (
                <div className="ad-empty" style={{ margin:'18px 14px 6px' }}>Aucun code pour l&apos;instant. Crée le premier ci-contre.</div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Rôle</th>
                        <th>Util.</th>
                        <th>État</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map(c => {
                        const expired  = c.expires_at && new Date(c.expires_at) < new Date()
                        const exhausted = c.max_uses != null && c.uses_count >= c.max_uses
                        const active = !c.disabled && !expired && !exhausted
                        return (
                          <tr key={c.code}>
                            <td>
                              <span className="ad-code-cell">
                                {c.code}
                                <button type="button" className={`ad-copy${copied === c.code ? ' copied' : ''}`} onClick={() => copy(c.code)} aria-label="Copier">
                                  {copied === c.code ? '✓' : 'COPY'}
                                </button>
                              </span>
                              {c.description && <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--dim)', marginTop:4, letterSpacing:'.04em' }}>{c.description}</div>}
                            </td>
                            <td>
                              <span className="ad-role-pill" style={{ '--rl-col': ROLE_COLOR[c.grants_role] } as React.CSSProperties}>
                                <span className="dot" aria-hidden="true" />
                                {c.grants_role}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontFamily:'var(--fm)', fontSize:12, color:'var(--text)' }}>
                                {c.uses_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                              </span>
                              {c.expires_at && (
                                <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--dim)', marginTop:3 }}>
                                  exp. {fmtDate(c.expires_at)}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`ad-status ${active ? 'on' : 'off'}`}>
                                {c.disabled ? 'désactivé' : expired ? 'expiré' : exhausted ? 'épuisé' : 'actif'}
                              </span>
                            </td>
                            <td>
                              <div className="ad-actions">
                                <button type="button" className="ad-act" onClick={() => onToggle(c.code, !c.disabled)} disabled={pending}>
                                  {c.disabled ? 'Activer' : 'Désact.'}
                                </button>
                                <button type="button" className="ad-act danger" onClick={() => onDelete(c.code)} disabled={pending}>
                                  Suppr.
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ─── Redemptions ─── */}
          <div className="ad-redemptions">
            <h3>Activations récentes</h3>
            {redemptions.length === 0 ? (
              <div className="ad-empty">Aucune activation pour l&apos;instant.</div>
            ) : (
              <div className="ad-card" style={{ padding:'8px 8px' }}>
                <div style={{ overflowX:'auto' }}>
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Utilisateur</th>
                        <th>Transition</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map(r => (
                        <tr key={r.id}>
                          <td><span className="ad-code-cell">{r.code}</span></td>
                          <td><span style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)' }}>{r.user_id.slice(0,8)}…</span></td>
                          <td>
                            <span style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--mid)' }}>
                              {r.previous_role} → <span style={{ color:'var(--text)' }}>{r.granted_role}</span>
                            </span>
                          </td>
                          <td><span style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)' }}>{fmtDateTime(r.redeemed_at)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
