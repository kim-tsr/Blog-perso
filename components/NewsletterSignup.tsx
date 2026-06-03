'use client'

import { useState } from 'react'

interface Props {
  variant?: 'inline' | 'card'
  sourcePage?: string
}

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'pending' }
  | { kind: 'already' }
  | { kind: 'error'; msg: string }

const ERR_MSG: Record<string, string> = {
  invalid_email: 'Adresse invalide.',
  no_db:         'Service indisponible.',
  bad_json:      'Erreur réseau.',
  unknown:       'Erreur inconnue, réessaie.',
}

export default function NewsletterSignup({ variant = 'inline', sourcePage }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setState({ kind: 'sending' })
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source_page: sourcePage ?? null }),
      })
      const data = await r.json().catch(() => ({})) as { ok?: boolean; state?: string; error?: string }
      if (!data.ok) {
        setState({ kind: 'error', msg: ERR_MSG[data.error ?? 'unknown'] ?? ERR_MSG.unknown })
        return
      }
      if (data.state === 'already_confirmed') setState({ kind: 'already' })
      else setState({ kind: 'pending' })
    } catch {
      setState({ kind: 'error', msg: ERR_MSG.unknown })
    }
  }

  if (variant === 'card') {
    return (
      <section className="ns-card-wrap">
        <style>{`
          .ns-card-wrap { max-width:1100px; margin:60px auto 0; padding:0 48px; }
          @media(max-width:768px) { .ns-card-wrap { padding:0 24px; } }
          .ns-card {
            position:relative; padding:36px 38px; border:1px solid var(--border); border-radius:18px;
            background:linear-gradient(135deg, color-mix(in oklab, var(--v) 8%, rgba(255,255,255,.018)), color-mix(in oklab, var(--c) 4%, transparent));
            overflow:hidden;
          }
          .ns-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--v), var(--c), transparent); }
          .ns-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--v); margin-bottom:10px; }
          .ns-h { font-family:var(--fd); font-size:clamp(22px,3vw,28px); font-weight:700; letter-spacing:-.02em; color:var(--text); line-height:1.2; margin-bottom:8px; }
          .ns-sub { font-size:14px; color:var(--mid); line-height:1.65; max-width:540px; margin-bottom:22px; font-weight:300; }
          .ns-form { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
          .ns-input { flex:1; min-width:240px; padding:13px 16px; border:1px solid var(--border); border-radius:100px; background:rgba(255,255,255,.025); color:var(--text); font-family:var(--fb); font-size:14px; outline:none; transition:border-color .2s, background .2s; }
          .ns-input:focus { border-color:var(--v); background:rgba(255,255,255,.045); }
          .ns-btn { padding:13px 26px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; }
          .ns-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px oklch(0.68 0.24 280/.35); }
          .ns-btn:disabled { opacity:.55; cursor:not-allowed; }
          .ns-status { display:block; font-family:var(--fm); font-size:11.5px; margin-top:14px; letter-spacing:.04em; }
          .ns-status.ok { color:var(--c); }
          .ns-status.err { color:oklch(0.78 0.16 25); }
          .ns-mini { font-family:var(--fm); font-size:10px; letter-spacing:.08em; color:var(--dim); margin-top:14px; }
        `}</style>
        <div className="ns-card">
          <div className="ns-stag">// newsletter</div>
          <div className="ns-h">Reste au courant des nouveaux labs</div>
          <div className="ns-sub">Un email court à chaque nouveau lab ou projet majeur. Pas de spam, désabonnement en 1 clic. Tu confirmes ton inscription par email après le clic.</div>
          <form className="ns-form" onSubmit={submit}>
            <input
              type="email"
              className="ns-input"
              placeholder="ton@email.fr"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={state.kind === 'sending'}
            />
            <button type="submit" className="ns-btn" disabled={state.kind === 'sending'}>
              {state.kind === 'sending' ? 'Envoi…' : "S'abonner"}
            </button>
          </form>
          <StatusLine state={state} />
          <div className="ns-mini">RGPD : email uniquement, jamais revendu. Stocké chez Supabase (EU).</div>
        </div>
      </section>
    )
  }

  // inline (footer-friendly)
  return (
    <div className="ns-inline">
      <style>{`
        .ns-inline { display:flex; flex-direction:column; gap:10px; }
        .ns-inline form { display:flex; gap:8px; }
        .ns-inline input { flex:1; padding:9px 13px; border:1px solid var(--border); border-radius:100px; background:rgba(255,255,255,.025); color:var(--text); font-family:var(--fb); font-size:12px; outline:none; }
        .ns-inline input:focus { border-color:var(--v); }
        .ns-inline button { padding:9px 16px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:12px; font-weight:600; cursor:pointer; }
        .ns-inline button:disabled { opacity:.55; cursor:not-allowed; }
        .ns-inline .ns-status { font-family:var(--fm); font-size:10.5px; letter-spacing:.04em; }
        .ns-inline .ns-status.ok { color:var(--c); }
        .ns-inline .ns-status.err { color:oklch(0.78 0.16 25); }
      `}</style>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="ton@email.fr"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state.kind === 'sending'}
        />
        <button type="submit" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? '…' : 'OK'}
        </button>
      </form>
      <StatusLine state={state} />
    </div>
  )
}

function StatusLine({ state }: { state: State }) {
  if (state.kind === 'idle' || state.kind === 'sending') return null
  if (state.kind === 'pending')  return <span className="ns-status ok">✓ Vérifie ta boîte mail pour confirmer.</span>
  if (state.kind === 'already')  return <span className="ns-status ok">✓ Tu es déjà inscrit·e.</span>
  return <span className="ns-status err">{state.msg}</span>
}
