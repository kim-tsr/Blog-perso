'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CONTACT } from '@/lib/site'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { href: '/projets',  label: 'Projets' },
  { href: '/technos',  label: 'Technos' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact',  label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="nav" aria-label="Navigation principale">
      <style>{`
        .nav { position: sticky; top: 0; z-index: 100; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: var(--line); display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; gap: 20px; }
        .nav-logo { font-size: 17px; font-weight: 700; letter-spacing: -.02em; }
        .nav-links { display: flex; gap: 6px; list-style: none; margin-left: auto; }
        .nav-links a { font-size: 14px; font-weight: 500; color: var(--mid); padding: 6px 12px; border-radius: 6px; }
        .nav-links a:hover { color: var(--ink); background: var(--bg2); }
        .nav-links a.active { color: var(--ink); background: var(--bg2); }
        .nav-cv { font-size: 14px; font-weight: 600; background: var(--ink); color: var(--bg); padding: 7px 16px; border-radius: 8px; }
        .nav-cv:hover { opacity: .85; }
        @media (max-width: 768px) { .nav { padding: 12px 20px; flex-wrap: wrap; } .nav-links { margin-left: 0; width: 100%; order: 3; flex-wrap: wrap; } .nav-cv { margin-left: auto; } }
      `}</style>
      <Link href="/" className="nav-logo">Kim Tessier</Link>
      <ul className="nav-links">
        {LINKS.map(l => (
          <li key={l.href}>
            <Link href={l.href} className={pathname.startsWith(l.href) ? 'active' : ''}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <ThemeToggle />
      <a href={CONTACT.cv} className="nav-cv" download>CV ↓</a>
    </nav>
  )
}
