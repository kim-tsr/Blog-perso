'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { redeemAccessCode, type RedeemResult } from './actions'

export default function RedeemForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<RedeemResult | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const r = await redeemAccessCode(fd)
      setResult(r)
      if (r.ok) {
        form.reset()
        router.refresh()
      }
    })
  }

  return (
    <div className="ac-card">
      <style>{`
        .rf-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin-bottom:14px; }
        .rf-desc { font-size:13px; color:var(--mid); line-height:1.65; font-weight:300; margin-bottom:18px; }
        .rf-row { display:flex; gap:10px; flex-wrap:wrap; }
        .rf-input { flex:1; min-width:200px; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:100px; color:var(--text); font-family:var(--fm); font-size:14px; letter-spacing:.08em; padding:12px 22px; outline:none; text-transform:uppercase; transition:border-color .2s, background .2s; }
        .rf-input:focus { border-color:var(--v); background:rgba(255,255,255,.06); }
        .rf-input::placeholder { color:var(--dim); letter-spacing:.08em; }
        .rf-btn { padding:12px 26px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s, opacity .2s; }
        .rf-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .rf-btn:disabled { opacity:.55; cursor:not-allowed; }
        .rf-result { margin-top:16px; padding:12px 16px; border-radius:10px; font-size:13px; line-height:1.55; }
        .rf-result.ok  { border:1px solid oklch(0.75 0.16 194/.4); background:oklch(0.75 0.16 194/.08); color:oklch(0.86 0.14 194); }
        .rf-result.err { border:1px solid oklch(0.65 0.20 25/.4);  background:oklch(0.65 0.20 25/.08);  color:oklch(0.82 0.16 25); }
      `}</style>
      <div className="rf-label">// Activer un code</div>
      <div className="rf-desc">
        Vous avez reçu un code d&apos;accès ? Saisissez-le ci-dessous pour débloquer le contenu correspondant.
      </div>
      <form onSubmit={onSubmit} className="rf-row">
        <input
          name="code"
          className="rf-input"
          placeholder="DSO-XXXX-XXXX"
          required
          disabled={pending}
          autoComplete="off"
          spellCheck={false}
          aria-label="Code d'accès"
        />
        <button type="submit" className="rf-btn" disabled={pending}>
          {pending ? 'Activation…' : 'Activer'}
        </button>
      </form>
      {result && (
        <div className={`rf-result ${result.ok ? 'ok' : 'err'}`} role="status">
          {result.message}
        </div>
      )}
    </div>
  )
}
