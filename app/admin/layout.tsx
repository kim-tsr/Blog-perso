import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'

const SECTIONS = [
  { href: '/admin',            label: 'Dashboard',  exact: true },
  { href: '/admin/articles',   label: 'Articles' },
  { href: '/admin/labs',       label: 'Labs' },
  { href: '/admin/projects',   label: 'Projets' },
  { href: '/admin/categories', label: 'Catégories' },
  { href: '/admin/codes',      label: 'Codes d\'accès' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/auth/signin?next=/admin')
  if (profile.role !== 'admin') redirect('/account')

  return (
    <>
      <style>{`
        .ash-wrap { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
        @media(max-width:900px) { .ash-wrap { grid-template-columns:1fr; } }
        .ash-aside { background:rgba(255,255,255,.018); border-right:1px solid var(--border); padding:110px 22px 32px; position:sticky; top:0; height:100vh; overflow-y:auto; }
        @media(max-width:900px) { .ash-aside { position:static; height:auto; padding:100px 22px 24px; border-right:none; border-bottom:1px solid var(--border); } }
        .ash-label { font-family:var(--fm); font-size:9px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:18px; padding-left:10px; }
        .ash-nav { display:flex; flex-direction:column; gap:2px; }
        .ash-link { font-family:var(--fb); font-size:13px; font-weight:500; color:var(--mid); padding:9px 12px; border-radius:8px; transition:color .2s, background .2s; display:flex; align-items:center; justify-content:space-between; }
        .ash-link:hover { color:var(--text); background:rgba(255,255,255,.03); }
        .ash-link.active { color:var(--text); background:rgba(255,255,255,.05); }
        .ash-link.active::after { content:''; width:4px; height:4px; border-radius:50%; background:var(--v); box-shadow:0 0 8px var(--v); }
        .ash-foot { margin-top:32px; padding:14px 12px; border-top:1px solid var(--border); padding-top:18px; }
        .ash-foot-name { font-family:var(--fd); font-size:13px; color:var(--text); font-weight:600; }
        .ash-foot-role { font-family:var(--fm); font-size:10px; color:var(--c); letter-spacing:.14em; text-transform:uppercase; margin-top:4px; }
      `}</style>
      <div className="ash-wrap">
        <aside className="ash-aside">
          <div className="ash-label">// admin</div>
          <nav className="ash-nav">
            {SECTIONS.map(s => (
              <Link key={s.href} href={s.href} className="ash-link">{s.label}</Link>
            ))}
          </nav>
          <div className="ash-foot">
            <div className="ash-foot-name">{profile.name ?? profile.email}</div>
            <div className="ash-foot-role">{profile.role}</div>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </>
  )
}
