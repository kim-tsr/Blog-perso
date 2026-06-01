import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vérifiez votre email — dev.sec.ops',
}

interface Props { searchParams: Promise<{ email?: string }> }

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .ce-orb { position:absolute; width:500px; height:500px; border-radius:50%; filter:blur(120px); background:oklch(0.50 0.18 194/.14); top:-100px; right:-100px; pointer-events:none; }
        .ce-card { position:relative; z-index:1; width:100%; max-width:480px; text-align:center; background:rgba(255,255,255,.025); border:1px solid var(--border); border-radius:18px; padding:48px 38px; }
        .ce-icon { width:72px; height:72px; border-radius:50%; background:oklch(0.75 0.16 194/.12); border:1px solid oklch(0.75 0.16 194/.25); display:inline-flex; align-items:center; justify-content:center; color:var(--c); margin-bottom:28px; }
        .ce-title { font-family:var(--fd); font-size:28px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:14px; }
        .ce-sub { font-size:15px; color:var(--mid); line-height:1.7; font-weight:300; margin-bottom:32px; }
        .ce-sub b { color:var(--text); font-weight:500; }
        .ce-back { color:var(--mid); font-size:13px; text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px; }
        .ce-back:hover { color:var(--text); }
      `}</style>
      <div className="ce-orb" aria-hidden="true" />
      <div className="ce-card">
        <div className="ce-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <h1 className="ce-title">Vérifiez votre boîte mail</h1>
        <p className="ce-sub">
          Un lien de connexion a été envoyé à {email ? <b>{email}</b> : 'votre adresse'}.<br/>
          Cliquez dessus pour finaliser la connexion — il expire dans 1 heure.
        </p>
        <Link href="/auth/signin" className="ce-back">← Utiliser une autre méthode</Link>
      </div>
    </main>
  )
}
