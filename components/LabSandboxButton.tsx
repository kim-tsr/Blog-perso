'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startSession, endSession } from '@/lib/lab-sessions'
import { sandboxErrorLabel } from '@/lib/sandbox-errors'

interface Props {
  slug: string
  themeColor: string
  activeSession: {
    id: string
    labSlug: string
    sandboxUrl: string | null
    expiresAt: string
  } | null
}

function fmtRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expirée'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}min ${String(s).padStart(2, '0')}s`
}

export default function LabSandboxButton({ slug, themeColor, activeSession }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onStart = () => {
    setError(null)
    startTransition(async () => {
      const res = await startSession(slug)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.push(`/labs/${slug}/sandbox?session=${res.sessionId}`)
    })
  }

  const onEnd = () => {
    if (!activeSession) return
    setError(null)
    startTransition(async () => {
      const res = await endSession(activeSession.id, 'user_ended')
      if (!res.ok) {
        setError(res.error ?? 'unknown')
        return
      }
      router.refresh()
    })
  }

  const hasActive = !!activeSession
  const isThisLab = activeSession?.labSlug === slug
  const otherLab = hasActive && !isThisLab ? activeSession!.labSlug : null

  return (
    <div className="sx-wrap" style={{ '--sx-col': themeColor } as React.CSSProperties}>
      <style>{`
        .sx-wrap {
          display: flex; flex-direction: column; gap: 10px;
          padding: 22px 24px;
          margin-top: 24px;
          border: 1px solid color-mix(in oklab, var(--sx-col) 28%, var(--border));
          border-radius: 14px;
          background: color-mix(in oklab, var(--sx-col) 5%, transparent);
        }
        .sx-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .sx-title { font-family: var(--fd); font-size: 15px; font-weight: 600; color: var(--text); letter-spacing: -.01em; }
        .sx-sub   { font-size: 12.5px; color: var(--mid); line-height: 1.5; }
        .sx-btn {
          font-family: var(--fm); font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
          padding: 9px 18px; border-radius: 100px; cursor: pointer; border: 1px solid var(--sx-col);
          background: var(--sx-col); color: var(--bg); transition: filter .15s, transform .15s;
        }
        .sx-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .sx-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .sx-btn.ghost { background: transparent; color: var(--sx-col); }
        .sx-err { font-family: var(--fm); font-size: 11px; color: oklch(0.66 0.22 25); margin-top: 4px; }
        .sx-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--fm); font-size: 11px; letter-spacing: .08em;
          padding: 4px 10px; border-radius: 100px;
          background: color-mix(in oklab, var(--sx-col) 14%, transparent);
          color: var(--sx-col); border: 1px solid color-mix(in oklab, var(--sx-col) 30%, transparent);
        }
        .sx-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sx-col); animation: sxpulse 1.6s ease-in-out infinite; }
        @keyframes sxpulse { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
      `}</style>

      <div className="sx-title">Sandbox éphémère (admin)</div>
      <div className="sx-sub">
        Container Debian read-only, tmpfs, 30 min max, no-network sortant.
        L&apos;environnement est isolé via NetworkPolicy et détruit à la fin du timer.
      </div>

      {isThisLab ? (
        <div className="sx-row">
          <span className="sx-pill"><span className="sx-dot" />session active · {fmtRemaining(activeSession!.expiresAt)}</span>
          <a href={`/labs/${slug}/sandbox?session=${activeSession!.id}`} className="sx-btn">
            Ouvrir le terminal
          </a>
          <button type="button" className="sx-btn ghost" onClick={onEnd} disabled={pending}>
            {pending ? '…' : 'Terminer'}
          </button>
        </div>
      ) : otherLab ? (
        <div className="sx-row">
          <span className="sx-pill"><span className="sx-dot" />session active sur un autre lab</span>
          <a href={`/labs/${otherLab}`} className="sx-btn ghost">Voir ce lab</a>
          <button type="button" className="sx-btn ghost" onClick={onEnd} disabled={pending}>
            {pending ? '…' : 'Terminer pour libérer'}
          </button>
        </div>
      ) : (
        <div className="sx-row">
          <button type="button" className="sx-btn" onClick={onStart} disabled={pending}>
            {pending ? 'Démarrage…' : '▶ Lancer le sandbox'}
          </button>
        </div>
      )}

      {error && <div className="sx-err">{sandboxErrorLabel(error)}</div>}
    </div>
  )
}
