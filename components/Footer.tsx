import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const FOOTER_LINKS = [
  {
    label: 'Pages',
    items: [
      { href: '/projets',  name: 'Projets' },
      { href: '/technos',  name: 'Technos' },
      { href: '/a-propos', name: 'À propos' },
      { href: '/contact',  name: 'Contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
      <style>{`
        .ft-top { max-width:1120px; margin:0 auto; padding:64px 48px 36px; display:grid; grid-template-columns:1.4fr repeat(1, 1fr); gap:48px; }
        .ft-brand-block .fl { font-family:var(--fd); font-size:18px; font-weight:700; letter-spacing:-.01em; }
        .ft-brand-block .fl b { color:var(--v); }
        .ft-brand-block p { font-size:13px; color:var(--mid); margin-top:14px; line-height:1.7; font-weight:300; max-width:280px; }
        .ft-col h4 { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--v); margin-bottom:18px; font-weight:400; }
        .ft-col ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
        .ft-col a { font-size:13px; color:var(--mid); transition:color .2s; }
        .ft-col a:hover { color:var(--text); }
        .ft-bottom { border-top:1px solid var(--border); max-width:1120px; margin:0 auto; padding:22px 48px; display:flex; align-items:center; justify-content:space-between; }
        .fc { font-family:var(--fm); font-size:11px; color:var(--dim); }
        .fsoc { color:var(--dim); transition:color .2s,transform .2s; display:flex; }
        .fsoc:hover { color:var(--v); transform:translateY(-2px); }
        @media(max-width:768px) {
          .ft-top { grid-template-columns:1fr 1fr; gap:36px; padding:48px 24px 24px; }
          .ft-brand-block { grid-column:1 / -1; }
          .ft-bottom { flex-direction:column; gap:10px; text-align:center; padding:18px 24px; }
        }
      `}</style>

      <div className="ft-top">
        <div className="ft-brand-block">
          <span className="fl">dev.<b>sec</b>.ops</span>
          <p>Étudiant ingénieur cybersécurité à l&apos;EPITA Rennes. Stage de fin d&apos;études DevSecOps dès février 2027.</p>
        </div>
        {FOOTER_LINKS.map(col => (
          <div key={col.label} className="ft-col">
            <h4>{col.label}</h4>
            <ul>
              {col.items.map(it => (
                <li key={it.href}>
                  <Link href={it.href}>{it.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ft-bottom">
        <span className="fc">© 2026 Kim Tessier</span>
        <div style={{display:'flex',gap:14, alignItems:'center'}}>
          <ThemeToggle />
          <a href="https://github.com/kim-tsr" target="_blank" rel="noopener noreferrer" className="fsoc" aria-label="GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/kim-tessier-330262230/" target="_blank" rel="noopener noreferrer" className="fsoc" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
