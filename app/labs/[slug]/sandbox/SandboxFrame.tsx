'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { endSession, getSessionStatus } from '@/lib/lab-sessions'
import { sandboxErrorLabel } from '@/lib/sandbox-errors'

interface Props {
  slug: string
  labTitle: string
  sessionId: string
  sandboxUrl: string
  expiresAt: string
}

type View = 'starting' | 'ready' | 'error' | 'ended'

const POLL_MS = 2500
const PROVISION_TIMEOUT_MS = 75_000
const READY_GRACE_MS = 1500 // laisse ttyd + l'Ingress se propager après Running

function fmt(ms: number): string {
  if (ms <= 0) return '00:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'Pending': return 'Pull de l’image et démarrage du container…'
    case 'Running': return 'Container prêt, ouverture du terminal…'
    case 'Unknown': return 'En attente du cluster…'
    default: return `Phase : ${phase}`
  }
}

export default function SandboxFrame({ slug, labTitle, sessionId, sandboxUrl, expiresAt }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [remaining, setRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now())

  const [view, setView] = useState<View>(sandboxUrl ? 'starting' : 'error')
  const [phase, setPhase] = useState('Pending')
  const [errorCode, setErrorCode] = useState<string | null>(sandboxUrl ? null : 'k8s_not_configured')
  const [iframeKey, setIframeKey] = useState(0)
  const [attempt, setAttempt] = useState(0)

  // Compte à rebours
  useEffect(() => {
    const i = setInterval(() => setRemaining(new Date(expiresAt).getTime() - Date.now()), 1000)
    return () => clearInterval(i)
  }, [expiresAt])

  // Auto-bounce à l'expiration ou quand la session est terminée
  useEffect(() => {
    if (remaining <= 0 || view === 'ended') router.push(`/labs/${slug}`)
  }, [remaining, view, router, slug])

  // Polling de readiness du pod : on ne monte l'iframe qu'une fois le pod Running.
  useEffect(() => {
    if (!sandboxUrl || view === 'ready' || view === 'error' || view === 'ended') return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()

    const tick = async () => {
      if (cancelled) return
      const status = await getSessionStatus(sessionId)
      if (cancelled) return

      if (!status) { setErrorCode('not_found'); setView('error'); return }
      if (status.endedAt || status.expired) { setView('ended'); return }
      setPhase(status.phase)
      if (status.phase === 'Failed') { setErrorCode('pod_failed'); setView('error'); return }
      if (status.ready) {
        timer = setTimeout(() => { if (!cancelled) setView('ready') }, READY_GRACE_MS)
        return
      }
      if (Date.now() - startedAt > PROVISION_TIMEOUT_MS) {
        setErrorCode('provision_timeout'); setView('error'); return
      }
      timer = setTimeout(tick, POLL_MS)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [sessionId, sandboxUrl, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const onEnd = () => {
    startTransition(async () => {
      await endSession(sessionId, 'user_ended')
      router.push(`/labs/${slug}`)
    })
  }

  const onRetry = () => {
    setErrorCode(null)
    setPhase('Pending')
    setView('starting')
    setAttempt((a) => a + 1)
  }

  const warn = remaining < 5 * 60 * 1000

  return (
    <div className="sb-root">
      <style>{`
        .sb-root { position: fixed; inset: 0; display: flex; flex-direction: column; background: var(--bg); z-index: 50; }
        .sb-bar {
          display: flex; align-items: center; gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,.02);
          flex-wrap: wrap;
        }
        .sb-back {
          font-family: var(--fm); font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
          color: var(--dim); text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sb-back:hover { color: var(--text); }
        .sb-title { font-family: var(--fd); font-size: 14px; font-weight: 600; color: var(--text); flex: 1; min-width: 200px; letter-spacing: -.01em; }
        .sb-timer {
          font-family: var(--fm); font-size: 13px; padding: 6px 14px;
          border-radius: 100px; border: 1px solid var(--border);
          background: rgba(255,255,255,.03);
          color: var(--text);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .sb-timer.warn { border-color: oklch(0.66 0.22 25 / .5); color: oklch(0.78 0.18 25); }
        .sb-dot { width: 6px; height: 6px; border-radius: 50%; background: oklch(0.65 0.22 145); animation: sbpulse 1.6s ease-in-out infinite; }
        .sb-timer.warn .sb-dot { background: oklch(0.66 0.22 25); }
        @keyframes sbpulse { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
        .sb-btn {
          font-family: var(--fm); font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
          padding: 7px 16px; border-radius: 100px;
          background: transparent; border: 1px solid var(--border);
          color: var(--text); cursor: pointer; transition: border-color .15s, color .15s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .sb-btn:hover { border-color: var(--c); color: var(--c); }
        .sb-btn.danger:hover { border-color: oklch(0.66 0.22 25); color: oklch(0.78 0.18 25); }
        .sb-btn:disabled { opacity: .5; cursor: not-allowed; }
        .sb-frame {
          flex: 1; border: 0; background: #000; width: 100%; min-height: 0;
        }
        .sb-screen {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 60px 24px; text-align: center;
        }
        .sb-screen-inner { max-width: 520px; }
        .sb-screen h2 { font-family: var(--fd); font-size: 22px; color: var(--text); margin: 0 0 12px; letter-spacing: -.01em; }
        .sb-screen p  { color: var(--mid); font-size: 14px; line-height: 1.6; margin: 0 0 18px; }
        .sb-screen code { font-family: var(--fm); font-size: 12px; color: var(--c); background: rgba(255,255,255,.04); padding: 2px 6px; border-radius: 4px; }
        .sb-screen-actions { display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .sb-spin {
          width: 34px; height: 34px; margin: 0 auto 22px;
          border: 2px solid var(--border); border-top-color: var(--c);
          border-radius: 50%; animation: sbspin .8s linear infinite;
        }
        @keyframes sbspin { to { transform: rotate(360deg) } }
        .sb-phase { font-family: var(--fm); font-size: 12px; color: var(--dim); letter-spacing: .04em; }
      `}</style>

      <div className="sb-bar">
        <Link href={`/labs/${slug}`} className="sb-back">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 3L4 6l3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </Link>
        <div className="sb-title">{labTitle} · sandbox</div>
        <div className={`sb-timer${warn ? ' warn' : ''}`}>
          <span className="sb-dot" />
          {fmt(remaining)}
        </div>
        {view === 'ready' && (
          <button type="button" className="sb-btn" onClick={() => setIframeKey((k) => k + 1)}>
            Recharger
          </button>
        )}
        <button type="button" className="sb-btn danger" onClick={onEnd} disabled={pending}>
          {pending ? '…' : 'Terminer'}
        </button>
      </div>

      {view === 'ready' && sandboxUrl ? (
        <iframe
          key={iframeKey}
          className="sb-frame"
          src={sandboxUrl}
          title={`Sandbox ${labTitle}`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : view === 'starting' ? (
        <div className="sb-screen">
          <div className="sb-screen-inner">
            <div className="sb-spin" aria-hidden="true" />
            <h2>Provisioning du sandbox…</h2>
            <p className="sb-phase">{phaseLabel(phase)}</p>
          </div>
        </div>
      ) : view === 'error' ? (
        <div className="sb-screen">
          <div className="sb-screen-inner">
            <h2>Sandbox indisponible</h2>
            <p>{sandboxErrorLabel(errorCode)}</p>
            <div className="sb-screen-actions">
              <button type="button" className="sb-btn" onClick={onRetry}>Réessayer</button>
              <Link href={`/labs/${slug}`} className="sb-btn">Retour au lab</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="sb-screen">
          <div className="sb-screen-inner">
            <p className="sb-phase">Session terminée, redirection…</p>
          </div>
        </div>
      )}
    </div>
  )
}
