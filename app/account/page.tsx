import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import { signOut } from '../auth/actions'
import Footer from '@/components/Footer'
import RedeemForm from './RedeemForm'
import ProgressSection from './ProgressSection'
import AchievementsSection from './AchievementsSection'
import BookmarksSection from './BookmarksSection'
import { getUserProgress } from '@/lib/progress'
import { getUserBookmarks } from '@/lib/bookmarks'
import { getAllArticleMeta } from '@/lib/articles'
import { getAllLabMeta } from '@/lib/labs'

export const metadata: Metadata = {
  title: 'Mon compte — dev.sec.ops',
}

const ROLE_LABEL = {
  free:  { label: 'Free',  color: 'var(--dim)',  detail: 'Accès aux contenus publics.' },
  pro:   { label: 'Pro',   color: 'var(--v)',    detail: 'Accès aux articles & labs premium.' },
  admin: { label: 'Admin', color: 'var(--c)',    detail: 'Contrôle total — édition et gestion.' },
}

export default async function AccountPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/account')

  const role = ROLE_LABEL[profile.role]

  const [progress, allArticles, allLabs, bookmarks] = await Promise.all([
    getUserProgress(),
    getAllArticleMeta(),
    getAllLabMeta(),
    getUserBookmarks(),
  ])

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 140, paddingBottom: 60, position:'relative', overflow:'hidden' }}>
        <style>{`
          .ac-orb { position:absolute; width:600px; height:400px; border-radius:50%; filter:blur(110px); background:oklch(0.50 0.28 280/.10); top:-100px; right:-150px; pointer-events:none; }
          .ac-wrap { max-width:720px; margin:0 auto; padding:0 48px; position:relative; z-index:1; }
          @media(max-width:768px) { .ac-wrap { padding:0 24px; } }

          .ac-head { display:flex; align-items:center; gap:24px; padding-bottom:36px; border-bottom:1px solid var(--border); margin-bottom:36px; }
          .ac-avatar { width:80px; height:80px; border-radius:50%; border:1px solid var(--border); overflow:hidden; background:var(--bg3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
          .ac-avatar img { width:100%; height:100%; object-fit:cover; }
          .ac-avatar-fallback { font-family:var(--fd); font-size:28px; font-weight:700; color:var(--v); }
          .ac-name { font-family:var(--fd); font-size:28px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:4px; }
          .ac-email { font-family:var(--fm); font-size:13px; color:var(--dim); }

          .ac-card { padding:28px 30px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.025); margin-bottom:16px; }
          .ac-card-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin-bottom:14px; }
          .ac-card-row { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
          .ac-role { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:100px; font-family:var(--fm); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--rl-col); background:color-mix(in oklab, var(--rl-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--rl-col) 25%, transparent); }
          .ac-role-dot { width:6px; height:6px; border-radius:50%; background:var(--rl-col); box-shadow:0 0 8px var(--rl-col); }
          .ac-role-detail { font-size:13px; color:var(--mid); margin-top:8px; font-weight:300; }

          .ac-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:32px; }
          .ac-signout { padding:11px 24px; border-radius:100px; background:transparent; border:1px solid oklch(0.65 0.20 25 / .4); color:oklch(0.78 0.16 25); font-family:var(--fb); font-size:13px; font-weight:600; cursor:pointer; transition:border-color .2s, background .2s, color .2s; }
          .ac-signout:hover { border-color:oklch(0.65 0.20 25 / .7); background:oklch(0.65 0.20 25 / .08); color:oklch(0.84 0.16 25); }
        `}</style>
        <div className="ac-orb" aria-hidden="true" />
        <div className="ac-wrap">
          <div className="stag">Mon compte</div>
          <div className="ac-head">
            <div className="ac-avatar">
              {profile.avatar_url
                /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={profile.avatar_url} alt="" />
                : <span className="ac-avatar-fallback">{(profile.name || profile.email || '?').charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <div className="ac-name">{profile.name || 'Sans nom'}</div>
              <div className="ac-email">{profile.email}</div>
            </div>
          </div>

          <div className="ac-card">
            <div className="ac-card-label">// Rôle actuel</div>
            <div className="ac-card-row">
              <span className="ac-role" style={{ '--rl-col': role.color } as React.CSSProperties}>
                <span className="ac-role-dot" aria-hidden="true" />
                {role.label}
              </span>
              <span style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.06em' }}>id : {profile.id.slice(0,8)}…</span>
            </div>
            <div className="ac-role-detail">{role.detail}</div>
          </div>

          {progress && <ProgressSection progress={progress} allArticles={allArticles} allLabs={allLabs} />}

          {progress && <AchievementsSection progress={progress} allArticles={allArticles} allLabs={allLabs} />}

          <BookmarksSection bookmarks={bookmarks} allArticles={allArticles} allLabs={allLabs} />

          <RedeemForm />

          {profile.role === 'free' && (
            <div className="ac-card">
              <div className="ac-card-label">// Passer en Pro</div>
              <div style={{ fontSize:14, color:'var(--mid)', lineHeight:1.7, fontWeight:300 }}>
                L&apos;abonnement Pro débloque les articles approfondis et les labs avancés.
                Pas encore de code ? Écris-moi pour un accès anticipé.
              </div>
              <div style={{ marginTop:16 }}>
                <a href="mailto:kim.tessier07@gmail.com?subject=Acc%C3%A8s%20Pro%20dev.sec.ops" className="btn-g" style={{ fontSize:13 }}>
                  Demander un code Pro
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
          )}

          {profile.role === 'admin' && (
            <div className="ac-card">
              <div className="ac-card-label">// Outils admin</div>
              <div style={{ fontSize:13, color:'var(--mid)', lineHeight:1.6, fontWeight:300, marginBottom:14 }}>
                Gérez les rôles via le SQL Editor Supabase ou ajoutez prochainement un panneau dédié.
              </div>
              <code style={{ fontFamily:'var(--fm)', fontSize:11, background:'var(--bg2)', padding:'10px 14px', borderRadius:6, color:'var(--c)', display:'block', overflow:'auto' }}>
                update public.profiles set role = &apos;pro&apos; where email = &apos;user@example.com&apos;;
              </code>
            </div>
          )}

          <div className="ac-actions">
            <Link href="/" className="btn-g" style={{ fontSize:13 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M10 6H2M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Retour à l&apos;accueil
            </Link>
            <form action={signOut}>
              <button type="submit" className="ac-signout">Se déconnecter</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
