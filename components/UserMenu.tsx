'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { Profile } from '@/lib/auth'

const ROLE_COLOR: Record<string, string> = {
  free:  'var(--dim)',
  pro:   'var(--v)',
  admin: 'var(--c)',
}

export default function UserMenu({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!profile) {
    return (
      <Link href="/auth/signin" className="nav-cta">
        Se connecter
      </Link>
    )
  }

  const initial = (profile.name || profile.email || '?').charAt(0).toUpperCase()
  const col = ROLE_COLOR[profile.role] || 'var(--dim)'

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <style>{`
        .um-trigger { display:inline-flex; align-items:center; gap:10px; padding:5px 14px 5px 6px; border-radius:100px; border:1px solid var(--border); background:rgba(255,255,255,.04); color:var(--text); font-family:var(--fb); font-size:13px; font-weight:500; cursor:pointer; transition:border-color .2s, background .2s; }
        .um-trigger:hover { border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.06); }
        .um-avatar { width:26px; height:26px; border-radius:50%; background:var(--bg3); border:1px solid var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .um-avatar img { width:100%; height:100%; object-fit:cover; }
        .um-avatar-fb { font-family:var(--fd); font-size:12px; font-weight:700; color:var(--v); }
        .um-role-dot { width:6px; height:6px; border-radius:50%; background:var(--um-col); box-shadow:0 0 8px var(--um-col); }
        .um-panel { position:absolute; top:calc(100% + 10px); right:0; min-width:260px; background:rgba(12,12,21,.96); backdrop-filter:blur(24px); border:1px solid var(--border); border-radius:14px; padding:8px; box-shadow:0 24px 64px rgba(0,0,0,.6); animation:umIn .2s var(--ease); z-index:200; }
        @keyframes umIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .um-head { padding:14px 14px 12px; border-bottom:1px solid var(--border); margin-bottom:6px; }
        .um-name { font-family:var(--fd); font-size:14px; font-weight:600; color:var(--text); margin-bottom:2px; letter-spacing:-.01em; }
        .um-email { font-family:var(--fm); font-size:11px; color:var(--dim); margin-bottom:10px; word-break:break-all; }
        .um-role { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:100px; font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--um-col); background:color-mix(in oklab, var(--um-col) 10%, transparent); border:1px solid color-mix(in oklab, var(--um-col) 25%, transparent); }
        .um-item { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px; font-family:var(--fb); font-size:13px; font-weight:500; color:var(--mid); background:transparent; border:none; border-radius:8px; cursor:pointer; transition:color .2s, background .2s; text-align:left; }
        .um-item:hover { color:var(--text); background:rgba(255,255,255,.04); }
        .um-item svg { color:var(--dim); transition:color .2s; }
        .um-item:hover svg { color:var(--text); }
        .um-divider { height:1px; background:var(--border); margin:6px 4px; }
        .um-signout { color:oklch(0.78 0.16 25); }
        .um-signout:hover { color:oklch(0.86 0.16 25); background:oklch(0.65 0.20 25 / .08); }
        .um-signout svg { color:oklch(0.78 0.16 25); }
      `}</style>
      <button className="um-trigger" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="um-avatar">
          {profile.avatar_url
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={profile.avatar_url} alt="" />
            : <span className="um-avatar-fb">{initial}</span>
          }
        </span>
        <span className="um-role-dot" style={{ '--um-col': col } as React.CSSProperties} aria-hidden="true" />
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ color:'var(--dim)', transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="um-panel" role="menu">
          <div className="um-head">
            <div className="um-name">{profile.name || 'Membre'}</div>
            <div className="um-email">{profile.email}</div>
            <span className="um-role" style={{ '--um-col': col } as React.CSSProperties}>{profile.role}</span>
          </div>
          <Link href="/account" className="um-item" role="menuitem" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>
            Mon compte
          </Link>
          {profile.role === 'admin' && (
            <Link href="/admin/codes" className="um-item" role="menuitem" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="9" rx="1"/><path d="M5.5 7h5M5.5 9.5h3"/></svg>
              Codes d&apos;accès
            </Link>
          )}
          <Link href="/blog" className="um-item" role="menuitem" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="3" width="11" height="10" rx="1"/><path d="M5 6h6M5 9h6M5 11h3"/></svg>
            Le blog
          </Link>
          <Link href="/labs" className="um-item" role="menuitem" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2v3.5L3 11.5a1 1 0 00.9 1.5h8.2a1 1 0 00.9-1.5L10 5.5V2M5 2h6"/></svg>
            Les labs
          </Link>
          <div className="um-divider" />
          <form action={signOut}>
            <button type="submit" className="um-item um-signout" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 2.5h-5a1 1 0 00-1 1v9a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7"/></svg>
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
