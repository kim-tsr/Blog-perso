import Link from 'next/link'
import { CONTACT } from '@/lib/site'

export default function Footer() {
  return (
    <footer style={{ borderTop: 'var(--line)', background: 'var(--bg2)', color: 'var(--mid)' }}>
      <style>{`
        .ft { max-width:1120px; margin:0 auto; padding:40px; display:flex; justify-content:space-between; gap:24px; flex-wrap:wrap; font-size:14px; }
        .ft ul { list-style:none; display:flex; gap:20px; flex-wrap:wrap; }
        .ft a:hover { color: var(--ink); }
        @media (max-width:768px){ .ft { padding:32px 20px; } }
      `}</style>
      <div className="ft">
        <span>© 2026 Kim Tessier - Rennes</span>
        <ul>
          <li><Link href="/projets">Projets</Link></li>
          <li><Link href="/technos">Technos</Link></li>
          <li><Link href="/a-propos">À propos</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><a href={CONTACT.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
          <li><a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
        </ul>
      </div>
    </footer>
  )
}
