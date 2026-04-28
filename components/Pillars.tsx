'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import ScrollReveal from './ScrollReveal'
import { setCatOrigin } from '@/lib/catOrigin'

const PILLARS = [
  {
    slug: 'infra', num: '01', title: 'Infrastructure',
    desc: "Kubernetes, Terraform, CI/CD, containers — les fondations d'une infrastructure moderne, résiliente et automatisée.",
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" style={{color:'var(--v)'}} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="2"/><rect x="12" y="2" width="8" height="8" rx="2"/><rect x="2" y="12" width="8" height="8" rx="2"/><rect x="12" y="12" width="8" height="8" rx="2"/></svg>,
    linkColor: 'var(--v)',
  },
  {
    slug: 'sec', num: '02', title: 'Cybersécurité',
    desc: "Zero Trust, SIEM, détection d'intrusion, hardening — sécuriser les systèmes sans compromis sur la fluidité.",
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" style={{color:'var(--c)'}} strokeWidth="1.5" strokeLinecap="round"><path d="M11 2L3 6v5c0 4.418 3.358 8.547 8 9.5C16.642 19.547 20 15.418 20 11V6L11 2z"/></svg>,
    linkColor: 'var(--c)',
  },
  {
    slug: 'reseau', num: '03', title: 'Réseau',
    desc: "Routage, VPN, SDN, firewall — comprendre et maîtriser les flux réseau dans des architectures distribuées.",
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" style={{color:'var(--a)'}} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="3"/><path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.93 4.93l2.12 2.12M14.95 14.95l2.12 2.12M4.93 17.07l2.12-2.12M14.95 7.05l2.12-2.12"/></svg>,
    linkColor: 'var(--a)',
  },
]

export default function Pillars() {
  const router = useRouter()
  const cards = useRef<(HTMLDivElement|null)[]>([])

  const onMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const card = cards.current[i]; if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - .5
    const y = (e.clientY - r.top)  / r.height - .5
    card.style.transform = `perspective(700px) rotateY(${x*10}deg) rotateX(${-y*7}deg) translateY(-8px)`
  }
  const onLeave = (i: number) => {
    const card = cards.current[i]; if (!card) return
    card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)'
    card.style.transition = 'transform .5s var(--ease)'
  }
  const onClick = (e: React.MouseEvent, slug: string) => {
    const pct = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 }
    setCatOrigin(pct.x, pct.y)
    router.push(`/categories/${slug}`)
  }

  return (
    <section id="pillars" data-section="pillars" className="section" style={{background:'var(--bg)'}}>
      <style>{`
        .pillars-row { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:72px; }
        .pc { position:relative; padding:40px 36px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid var(--border); overflow:hidden; cursor:pointer; transition:border-color .4s,transform .5s var(--ease),box-shadow .4s; transform-style:preserve-3d; will-change:transform; }
        .pc::before { content:''; position:absolute; inset:0; background:var(--pc-glow,transparent); opacity:0; transition:opacity .4s; border-radius:inherit; }
        .pc::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--pc-col),transparent); opacity:0; transition:opacity .4s; }
        .pc:hover { border-color:var(--pc-border); }
        .pc:hover::before,.pc:hover::after { opacity:1; }
        .pc:nth-child(1) { --pc-col:var(--v); --pc-border:oklch(0.68 0.24 280/.45); --pc-glow:radial-gradient(circle at 40% 0%,oklch(0.50 0.28 280/.2),transparent 70%); }
        .pc:nth-child(2) { --pc-col:var(--c); --pc-border:oklch(0.75 0.16 194/.45); --pc-glow:radial-gradient(circle at 40% 0%,oklch(0.50 0.18 194/.18),transparent 70%); }
        .pc:nth-child(3) { --pc-col:var(--a); --pc-border:oklch(0.76 0.16 65/.45); --pc-glow:radial-gradient(circle at 40% 0%,oklch(0.54 0.18 65/.18),transparent 70%); }
        .pc-num { font-family:var(--fm); font-size:11px; letter-spacing:.12em; color:var(--pc-col); margin-bottom:24px; display:block; }
        .pc-icon { width:50px; height:50px; border-radius:12px; background:oklch(from var(--pc-col) l c h/.12); border:1px solid oklch(from var(--pc-col) l c h/.2); display:flex; align-items:center; justify-content:center; margin-bottom:22px; transition:background .3s; }
        .pc:hover .pc-icon { background:oklch(from var(--pc-col) l c h/.22); }
        .pc-title { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:12px; }
        .pc-desc { font-size:14px; color:var(--mid); line-height:1.75; font-weight:300; }
        .pc-link { display:inline-flex; align-items:center; gap:6px; margin-top:28px; font-size:13px; font-weight:600; color:var(--pc-col); transition:gap .2s; pointer-events:none; }
        .pc:hover .pc-link { gap:10px; }
        .pc-shine { position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.05) 50%,transparent 60%); transform:translateX(-100%); transition:transform .6s var(--ease); pointer-events:none; border-radius:inherit; }
        .pc:hover .pc-shine { transform:translateX(100%); }
        @media(max-width:768px) { .pillars-row { grid-template-columns:1fr; } }
      `}</style>
      <div className="container">
        <ScrollReveal><div className="stag">Les Pilliers</div></ScrollReveal>
        <ScrollReveal clip>
          <h2 className="stitle clip-inner">L&apos;architecture<br/>du blog</h2>
        </ScrollReveal>
        <div className="pillars-row">
          {PILLARS.map((p, i) => (
            <ScrollReveal key={p.slug} delay={(i+1)*0.1}>
              <div
                className="pc"
                ref={el => { cards.current[i] = el }}
                onMouseMove={e => onMove(e, i)}
                onMouseLeave={() => onLeave(i)}
                onClick={e => onClick(e, p.slug)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && router.push(`/categories/${p.slug}`)}
                aria-label={`Explorer ${p.title}`}
              >
                <div className="pc-shine" aria-hidden="true" />
                <span className="pc-num">{p.num}</span>
                <div className="pc-icon" aria-hidden="true">{p.icon}</div>
                <h3 className="pc-title">{p.title}</h3>
                <p className="pc-desc">{p.desc}</p>
                <span className="pc-link" style={{color:p.linkColor}}>
                  Explorer
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
