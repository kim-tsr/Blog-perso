'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import HeroCanvas from './HeroCanvas'

const LINES = [
  "Stage de fin d'études dès février 2027.",
  "Pipelines CI/CD sécurisés et supply chain.",
  "Kubernetes, GitOps et Infrastructure as Code.",
  "Étudiant ingénieur cybersécurité, EPITA Rennes.",
]

export default function Hero() {
  const tw = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let li = 0, ci = 0, del = false
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      if (!tw.current) return
      const txt = LINES[li]
      tw.current.textContent = del ? txt.slice(0, --ci) : txt.slice(0, ++ci)
      if (!del && ci === txt.length) { del = true; t = setTimeout(tick, 2000); return }
      if (del && ci === 0) { del = false; li = (li + 1) % LINES.length }
      t = setTimeout(tick, del ? 20 : 42)
    }
    t = setTimeout(tick, 1300)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="hero" data-section="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden', background:'var(--bg)' }}>
      <style>{`
        .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:1; }
        .orb-1 { width:700px; height:700px; background:oklch(0.48 0.28 280/0.18); top:-150px; right:-150px; animation:orbF 9s ease-in-out infinite alternate; }
        .orb-2 { width:450px; height:450px; background:oklch(0.50 0.18 194/0.14); bottom:-100px; left:-80px; animation:orbF 11s ease-in-out infinite alternate-reverse; }
        .orb-3 { width:300px; height:300px; background:oklch(0.50 0.18 65/0.10); top:40%; left:40%; animation:orbF 7s ease-in-out infinite alternate; }
        .hero-inner { position:relative; z-index:2; padding:160px 0 100px; max-width:1000px; }
        .hero-eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:32px; opacity:0; animation:fU .8s var(--ease) .2s forwards; }
        .hero-eyebrow span { font-family:var(--fm); font-size:10px; letter-spacing:.2em; color:var(--v); text-transform:uppercase; }
        .eyebrow-line { width:28px; height:1px; background:var(--v); }
        .hero-title { font-family:var(--fd); font-size:clamp(60px,8.5vw,110px); font-weight:700; line-height:.92; letter-spacing:-.04em; margin-bottom:36px; }
        .hero-word { display:inline-block; overflow:hidden; vertical-align:bottom; }
        .hero-word-inner { display:inline-block; transform:translateY(110%); opacity:0; animation:wordIn .9s var(--ease) forwards; }
        .hero-title .accent { color:transparent; -webkit-text-stroke:1px var(--v); }
        .hero-title .grad { background:linear-gradient(135deg,var(--v) 0%,var(--c) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-sub { font-size:18px; font-weight:300; color:var(--mid); max-width:500px; margin-bottom:52px; opacity:0; animation:fU .8s var(--ease) 1s forwards; }
        .hero-cursor-el { display:inline-block; width:2px; height:1em; background:var(--v); margin-left:2px; vertical-align:text-bottom; animation:blink 1s step-end infinite; }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; opacity:0; animation:fU .8s var(--ease) 1.1s forwards; }
        .hero-scroll { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); z-index:2; display:flex; flex-direction:column; align-items:center; gap:8px; opacity:0; animation:fU .8s var(--ease) 1.6s forwards; }
        .hero-scroll span { font-family:var(--fm); font-size:9px; letter-spacing:.25em; color:var(--dim); text-transform:uppercase; }
        .scroll-track { width:1px; height:40px; background:linear-gradient(to bottom,var(--dim),transparent); animation:scrollP 2s ease-in-out infinite; }
      `}</style>

      <HeroCanvas />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div className="container">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <span>Kim Tessier — Étudiant ingénieur cybersécurité</span>
          </div>
          <h1 className="hero-title" aria-label="DevSecOps. Infrastructures. Supply chain.">
            <span className="hero-word"><span className="hero-word-inner" style={{animationDelay:'.35s'}}>DevSecOps.</span></span><br />
            <span className="hero-word"><span className="hero-word-inner accent" style={{animationDelay:'.55s'}}>Infra.</span></span><br />
            <span className="hero-word"><span className="hero-word-inner grad" style={{animationDelay:'.75s'}}>Supply chain.</span></span>
          </h1>
          <p className="hero-sub">
            <span ref={tw} />
            <span className="hero-cursor-el" aria-hidden="true" />
          </p>
          <div className="hero-btns">
            <Link href="/projets" className="btn-p">
              Voir mes projets
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="/CV_Kim_Tessier.pdf" className="btn-g" download>Télécharger mon CV</a>
          </div>
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <span>Explorer</span>
        <div className="scroll-track" />
      </div>
    </section>
  )
}
