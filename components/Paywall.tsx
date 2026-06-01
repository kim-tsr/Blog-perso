import Link from 'next/link'
import { MinRole } from '@/lib/theme'
import { UserRole } from '@/lib/auth'

interface Props {
  required: MinRole
  currentRole: UserRole | null
  kind: 'article' | 'lab'
  title: string
  signinNext: string
}

const ROLE_LABEL: Record<MinRole, string> = {
  free:  'Free',
  pro:   'Pro',
  admin: 'Admin',
}

export default function Paywall({ required, currentRole, kind, title, signinNext }: Props) {
  const isAuthed = !!currentRole
  const signinHref = `/auth/signin?next=${encodeURIComponent(signinNext)}`

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 48px 80px' }}>
      <style>{`
        .pw-card { position:relative; padding:54px 48px; border:1px solid var(--border); border-radius:18px; background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015)); text-align:center; overflow:hidden; }
        .pw-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--v), var(--c), transparent); }
        .pw-card::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center top, oklch(0.50 0.28 280/.12), transparent 60%); pointer-events:none; }
        .pw-icon { position:relative; width:72px; height:72px; border-radius:50%; background:oklch(0.68 0.24 280/.12); border:1px solid oklch(0.68 0.24 280/.3); display:inline-flex; align-items:center; justify-content:center; color:var(--v); margin-bottom:28px; z-index:1; }
        .pw-badge { position:relative; display:inline-flex; align-items:center; gap:7px; padding:5px 14px; border-radius:100px; background:oklch(0.68 0.24 280/.12); border:1px solid oklch(0.68 0.24 280/.3); color:var(--v); font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; margin-bottom:22px; z-index:1; }
        .pw-badge::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--v); box-shadow:0 0 10px var(--v); }
        .pw-title { position:relative; font-family:var(--fd); font-size:28px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:14px; line-height:1.2; z-index:1; }
        .pw-sub { position:relative; font-size:15px; color:var(--mid); line-height:1.7; font-weight:300; max-width:480px; margin:0 auto 32px; z-index:1; }
        .pw-actions { position:relative; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; z-index:1; }
        .pw-features { position:relative; display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:36px; padding-top:32px; border-top:1px solid var(--border); z-index:1; }
        @media(max-width:600px) { .pw-features { grid-template-columns:1fr; } .pw-card { padding:40px 28px; } }
        .pw-feat { text-align:left; padding:0 4px; }
        .pw-feat-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--v); margin-bottom:8px; }
        .pw-feat-text { font-size:13px; color:var(--mid); line-height:1.6; font-weight:300; }
        .pw-tease { margin-top:18px; font-family:var(--fm); font-size:11px; color:var(--dim); }
      `}</style>

      <div className="pw-card">
        <span className="pw-badge">Contenu {ROLE_LABEL[required]}</span>
        <div className="pw-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="pw-title">
          {isAuthed ? 'Cet accès est réservé au niveau Pro' : 'Connectez-vous pour continuer'}
        </h2>
        <p className="pw-sub">
          {isAuthed
            ? <>« <b style={{color:'var(--text)'}}>{title}</b> » fait partie du contenu approfondi réservé aux membres Pro. Votre rôle actuel est <b style={{color:'var(--text)'}}>{ROLE_LABEL[currentRole as MinRole] ?? 'Free'}</b>.</>
            : <>« <b style={{color:'var(--text)'}}>{title}</b> » est réservé aux membres connectés ayant le rôle <b style={{color:'var(--text)'}}>{ROLE_LABEL[required]}</b>. La connexion est gratuite et prend 10 secondes.</>
          }
        </p>

        <div className="pw-actions">
          {isAuthed ? (
            <>
              <a href="mailto:kim.tessier07@gmail.com?subject=Acc%C3%A8s%20Pro%20dev.sec.ops" className="btn-p">
                Demander un accès Pro
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <Link href="/account" className="btn-g">Mon compte</Link>
            </>
          ) : (
            <>
              <Link href={signinHref} className="btn-p">
                Se connecter
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href={`/${kind === 'article' ? 'blog' : 'labs'}`} className="btn-g">
                Voir les autres {kind === 'article' ? 'articles' : 'labs'}
              </Link>
            </>
          )}
        </div>

        <div className="pw-features">
          <div className="pw-feat">
            <div className="pw-feat-label">// Inclus</div>
            <div className="pw-feat-text">Articles longs format avec étude de cas réels.</div>
          </div>
          <div className="pw-feat">
            <div className="pw-feat-label">// Inclus</div>
            <div className="pw-feat-text">Labs avancés sur les sujets sensibles : Wazuh, GitOps, Zero Trust.</div>
          </div>
          <div className="pw-feat">
            <div className="pw-feat-label">// Inclus</div>
            <div className="pw-feat-text">Accès anticipé aux articles avant publication.</div>
          </div>
        </div>

        <div className="pw-tease">// Le paiement n&apos;est pas encore en ligne. Accès Pro sur demande.</div>
      </div>
    </div>
  )
}
