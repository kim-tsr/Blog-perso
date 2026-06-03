'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { setPageOrigin } from '@/lib/pageOrigin'

const CARDS = [
  {
    num: '01',
    code: '// labs',
    title: 'Labs',
    desc: 'Tutoriels pratiques avec théorie, code et quiz — infrastructure, sécurité, réseau.',
    href: '/labs',
    accent: 'var(--v)',
    border: 'oklch(0.68 0.24 280/.5)',
    glow: 'radial-gradient(ellipse at 50% 0%, oklch(0.50 0.28 280/.25), transparent 70%)',
    bg: 'linear-gradient(160deg, oklch(0.10 0.08 280) 0%, var(--bg) 60%)',
  },
  {
    num: '02',
    code: '// projets',
    title: 'Projets',
    desc: 'Open-source, outils DevSecOps et expérimentations techniques.',
    href: '/projets',
    accent: 'var(--c)',
    border: 'oklch(0.75 0.16 194/.5)',
    glow: 'radial-gradient(ellipse at 50% 0%, oklch(0.50 0.18 194/.22), transparent 70%)',
    bg: 'linear-gradient(160deg, oklch(0.10 0.08 194) 0%, var(--bg) 60%)',
  },
  {
    num: '03',
    code: '// à propos',
    title: 'À propos',
    desc: 'Ingénieure DevSecOps — mon parcours, mes compétences, ma vision.',
    href: '/a-propos',
    accent: 'var(--a)',
    border: 'oklch(0.76 0.16 65/.5)',
    glow: 'radial-gradient(ellipse at 50% 0%, oklch(0.54 0.18 65/.20), transparent 70%)',
    bg: 'linear-gradient(160deg, oklch(0.10 0.08 65) 0%, var(--bg) 60%)',
  },
]

export default function GatewayCards() {
  const cards = useRef<(HTMLAnchorElement | null)[]>([])

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    const card = cards.current[i]; if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 5}deg)`
    card.style.transition = 'none'
  }
  const onLeave = (i: number) => {
    const card = cards.current[i]; if (!card) return
    card.style.transform = ''
    card.style.transition = 'transform .6s var(--ease)'
  }
  const onClick = (e: React.MouseEvent, href: string) => {
    setPageOrigin((e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100)
    void href
  }

  return (
    <section id="gateway" data-section="gateway" style={{ background: 'var(--bg)' }}>
      <style>{`
        .gw-grid { display:grid; grid-template-columns:repeat(3,1fr); min-height:82vh; gap:1px; background:var(--border); }
        .gw-card { position:relative; display:flex; flex-direction:column; justify-content:flex-end; padding:52px 44px; overflow:hidden; text-decoration:none; color:inherit; background:var(--bg); transform-style:preserve-3d; will-change:transform; transition:transform .6s var(--ease); }
        .gw-card::before { content:''; position:absolute; inset:0; background:var(--gw-glow); opacity:0; transition:opacity .5s; }
        .gw-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, transparent, var(--gw-accent), transparent); transform:scaleX(0); transition:transform .5s var(--ease); }
        .gw-card:hover::before { opacity:1; }
        .gw-card:hover::after { transform:scaleX(1); }
        .gw-num { position:absolute; bottom:-30px; right:20px; font-family:var(--fd); font-size:clamp(180px,16vw,280px); font-weight:700; color:rgba(255,255,255,0.022); line-height:1; pointer-events:none; user-select:none; transition:transform .7s var(--ease), color .5s; }
        .gw-card:hover .gw-num { transform:scale(1.08) translateY(-16px); color:rgba(255,255,255,0.038); }
        .gw-shine { position:absolute; inset:0; background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.04) 50%,transparent 65%); transform:translateX(-100%); transition:transform .7s var(--ease); pointer-events:none; }
        .gw-card:hover .gw-shine { transform:translateX(100%); }
        .gw-code { font-family:var(--fm); font-size:11px; letter-spacing:.16em; color:var(--gw-accent); text-transform:lowercase; margin-bottom:20px; opacity:.8; }
        .gw-title { font-family:var(--fd); font-size:clamp(32px,3.5vw,52px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:14px; }
        .gw-desc { font-size:15px; color:var(--mid); font-weight:300; line-height:1.65; max-width:300px; margin-bottom:32px; }
        .gw-cta { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--gw-accent); transition:gap .2s; }
        .gw-card:hover .gw-cta { gap:14px; }
        @media(max-width:900px) { .gw-grid { grid-template-columns:1fr; min-height:auto; } .gw-card { min-height:50vw; padding:36px 28px; } .gw-num { font-size:140px; } }
      `}</style>
      <div className="gw-grid">
        {CARDS.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            className="gw-card"
            ref={el => { cards.current[i] = el }}
            onMouseMove={e => onMove(e, i)}
            onMouseLeave={() => onLeave(i)}
            onClick={e => onClick(e, c.href)}
            style={{
              '--gw-accent': c.accent,
              '--gw-border': c.border,
              '--gw-glow': c.glow,
              background: c.bg,
            } as React.CSSProperties}
          >
            <div className="gw-shine" aria-hidden="true" />
            <span className="gw-num" aria-hidden="true">{c.num}</span>
            <span className="gw-code">{c.code}</span>
            <h2 className="gw-title">{c.title}</h2>
            <p className="gw-desc">{c.desc}</p>
            <span className="gw-cta">
              Découvrir
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
