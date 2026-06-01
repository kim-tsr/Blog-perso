'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'
import { Profile } from '@/lib/auth'

const LINKS = [
  { href: '/blog',      label: 'Blog' },
  { href: '/labs',      label: 'Labs' },
  { href: '/projets',   label: 'Projets' },
  { href: '/roadmap',   label: 'Roadmap' },
  { href: '/a-propos',  label: 'À propos' },
]

export default function NavClient({ profile }: { profile: Profile | null }) {
  const nav = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => nav.current?.classList.toggle('scrolled', window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav ref={nav} id="nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '18px 48px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', transition: 'background .4s, backdrop-filter .4s',
    }}>
      <style>{`
        nav#nav.scrolled { background: rgba(7,7,12,0.75); backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); }
        .nav-links { display: flex; gap: 28px; list-style: none; }
        .nav-links a { font-size: 13px; font-weight: 500; color: var(--dim); transition: color .2s; position: relative; padding-bottom: 2px; }
        .nav-links a::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 1px; background: var(--v); transform: scaleX(0); transition: transform .25s var(--ease); }
        .nav-links a:hover { color: var(--text); }
        .nav-links a.active { color: var(--text); }
        .nav-links a.active::after { transform: scaleX(1); }
        .nav-logo { font-family: var(--fd); font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
        .nav-logo b { color: var(--v); }
        .nav-cta { border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--text); padding: 8px 22px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color .2s, background .2s; }
        .nav-cta:hover { border-color: var(--v); background: oklch(0.68 0.24 280 / 0.1); }
        @media(max-width:768px) { nav#nav { padding: 14px 24px; } .nav-links { display: none; } }
      `}</style>
      <Link href="/" className="nav-logo">dev.<b>sec</b>.ops</Link>
      <ul className="nav-links">
        {LINKS.map(l => (
          <li key={l.href}>
            <Link href={l.href} className={pathname.startsWith(l.href) ? 'active' : ''}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <UserMenu profile={profile} />
    </nav>
  )
}
