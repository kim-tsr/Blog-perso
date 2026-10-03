import Link from 'next/link'
import { CONTACT } from '@/lib/site'
import LightRays from './LightRays'
import TypingText from './TypingText'

const TITLE = 'Sécurité des infrastructures et de la chaîne logicielle.'

export default function Hero() {
  return (
    <section id="hero" style={{ position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .hero-inner { position:relative; z-index:1; padding:96px 0 90px; max-width:820px; margin:0 auto; text-align:center; }
        .hero-eyebrow { font-size:14px; font-weight:600; color:var(--accent); letter-spacing:.01em; margin-bottom:22px; }
        .hero-title { font-size:clamp(38px,6vw,68px); font-weight:700; line-height:1.08; letter-spacing:-.035em; margin-bottom:24px; }
        .hero-sub { font-size:18px; color:var(--mid); max-width:620px; margin:0 auto 36px; line-height:1.7; }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; }
        .hero-meta { display:flex; gap:28px; flex-wrap:wrap; justify-content:center; margin-top:56px; font-size:14px; color:var(--dim); }
        .hero-meta b { color:var(--ink); font-weight:600; }
      `}</style>
      <LightRays />
      <div className="container">
        <div className="hero-inner">
          <p className="hero-eyebrow">Stage de fin d&apos;études à partir de février 2027</p>
          <h1 className="hero-title">
            <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{TITLE}</span>
            <TypingText text={TITLE} />
          </h1>
          <p className="hero-sub">
            Kim Tessier, dernière année du cycle ingénieur majeure SecDevOps à l&apos;EPITA Rennes. Pipelines CI/CD sécurisés, Kubernetes, Infrastructure as Code et durcissement réseau.
          </p>
          <div className="hero-btns">
            <a href="#parcours" className="btn-p">Voir mon parcours ↓</a>
            <Link href="/projets" className="btn-g">Mes projets</Link>
          </div>
          <div className="hero-meta">
            <span><b>EPITA</b> Rennes, diplôme 2027</span>
            <span><b>Cible</b> DevSecOps / sécurité des infra</span>
            <span><b>Lieu</b> {CONTACT.location}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
