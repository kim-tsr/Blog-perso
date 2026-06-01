import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signInWithProvider, signInWithMagicLink } from '../actions'
import { getCurrentProfile } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Connexion — dev.sec.ops',
  description: 'Connectez-vous pour accéder à tout le contenu.',
}

interface Props { searchParams: Promise<{ error?: string }> }

export default async function SignInPage({ searchParams }: Props) {
  const profile = await getCurrentProfile()
  if (profile) redirect('/account')

  const { error } = await searchParams
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  async function github() { 'use server'; await signInWithProvider('github') }
  async function google() { 'use server'; await signInWithProvider('google') }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .si-orb { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
        .si-orb-1 { width:500px; height:500px; background:oklch(0.50 0.28 280/.16); top:-100px; right:-100px; }
        .si-orb-2 { width:400px; height:400px; background:oklch(0.50 0.18 194/.10); bottom:-150px; left:-100px; }
        .si-card { position:relative; z-index:1; width:100%; max-width:440px; background:rgba(255,255,255,.025); border:1px solid var(--border); border-radius:18px; padding:44px 38px; backdrop-filter:blur(20px); }
        .si-eyebrow { font-family:var(--fm); font-size:10px; letter-spacing:.2em; color:var(--v); text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
        .si-eyebrow::before { content:''; width:18px; height:1px; background:var(--v); }
        .si-title { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.03em; color:var(--text); margin-bottom:10px; line-height:1.1; }
        .si-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .si-sub { font-size:14px; color:var(--mid); margin-bottom:34px; line-height:1.65; font-weight:300; }
        .si-providers { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
        .si-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:13px 20px; border-radius:100px; font-family:var(--fb); font-size:14px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), border-color .2s, background .2s; border:1px solid var(--border); background:rgba(255,255,255,.04); color:var(--text); }
        .si-btn:hover { border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.06); transform:translateY(-2px); }
        .si-divider { display:flex; align-items:center; gap:14px; margin:18px 0; font-family:var(--fm); font-size:10px; letter-spacing:.18em; color:var(--dim); text-transform:uppercase; }
        .si-divider::before, .si-divider::after { content:''; flex:1; height:1px; background:var(--border); }
        .si-magic { display:flex; flex-direction:column; gap:10px; }
        .si-input { width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:100px; color:var(--text); font-family:var(--fb); font-size:14px; padding:13px 20px; outline:none; transition:border-color .2s, background .2s; }
        .si-input:focus { border-color:var(--v); background:rgba(255,255,255,.06); }
        .si-input::placeholder { color:var(--dim); }
        .si-magic-btn { width:100%; padding:13px 20px; border-radius:100px; background:var(--v); color:#fff; border:none; font-family:var(--fb); font-size:14px; font-weight:600; cursor:pointer; transition:transform .25s var(--ease), box-shadow .3s; }
        .si-magic-btn:hover { transform:translateY(-2px); box-shadow:0 12px 36px var(--gv); }
        .si-error { padding:12px 16px; border:1px solid oklch(0.65 0.20 25 / .4); background:oklch(0.65 0.20 25 / .08); border-radius:10px; color:oklch(0.78 0.16 25); font-family:var(--fm); font-size:12px; line-height:1.55; margin-bottom:24px; }
        .si-warn { padding:12px 16px; border:1px solid oklch(0.76 0.16 65 / .35); background:oklch(0.76 0.16 65 / .08); border-radius:10px; color:oklch(0.86 0.12 65); font-size:12px; line-height:1.6; margin-bottom:24px; font-weight:300; }
        .si-footer { margin-top:28px; font-size:12px; color:var(--dim); text-align:center; line-height:1.6; }
        .si-footer a { color:var(--mid); text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px; }
        .si-footer a:hover { color:var(--text); }
      `}</style>
      <div className="si-orb si-orb-1" aria-hidden="true" />
      <div className="si-orb si-orb-2" aria-hidden="true" />

      <div className="si-card">
        <div className="si-eyebrow">Espace membre</div>
        <h1 className="si-title">Rejoindre <b>dev.sec.ops</b></h1>
        <p className="si-sub">
          Connectez-vous pour accéder aux articles, labs et contenus réservés.
          Pas encore de compte ? Le premier login le crée automatiquement.
        </p>

        {error && <div className="si-error">{error}</div>}
        {!configured && (
          <div className="si-warn">
            ⚠️ Supabase n&apos;est pas encore configuré. Suivez <code style={{fontFamily:'var(--fm)', fontSize:11, color:'var(--text)'}}>SUPABASE_SETUP.md</code> à la racine du projet.
          </div>
        )}

        <div className="si-providers">
          <form action={github}>
            <button type="submit" className="si-btn" disabled={!configured} aria-label="Se connecter avec GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Continuer avec GitHub
            </button>
          </form>
          <form action={google}>
            <button type="submit" className="si-btn" disabled={!configured} aria-label="Se connecter avec Google">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" fill="#34A853"/>
                <path d="M5.84 14.1A6.59 6.59 0 015.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A10.99 10.99 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
          </form>
        </div>

        <div className="si-divider">ou par email</div>

        <form action={signInWithMagicLink} className="si-magic">
          <input type="email" name="email" placeholder="votre@email.com" required className="si-input" disabled={!configured} aria-label="Adresse email" />
          <button type="submit" className="si-magic-btn" disabled={!configured}>
            Envoyer un magic link
          </button>
        </form>

        <div className="si-footer">
          En continuant vous acceptez les conditions du service.<br/>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </main>
  )
}
