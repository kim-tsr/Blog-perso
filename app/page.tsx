import Hero from '@/components/Hero'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import SideNav from '@/components/SideNav'
import ProjectCard, { PROJECT_CARD_CSS } from '@/components/ProjectCard'
import ScrollReveal from '@/components/ScrollReveal'
import Link from 'next/link'
import { PROJECTS } from '@/lib/projects'
import { TECHNOS } from '@/lib/technos'

export default function Home() {
  const featured = PROJECTS.filter(p => p.featured)
  return (
    <>
      <style>{PROJECT_CARD_CSS}{`
        .tk-prev { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:800px){ .tk-prev { grid-template-columns:1fr 1fr; } }
        .tk-prev div { padding:18px 20px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.03); font-size:14px; color:var(--text); }
        .tk-prev span { display:block; font-family:var(--fm); font-size:10px; letter-spacing:.12em; color:var(--dim); margin-top:6px; text-transform:uppercase; }
      `}</style>
      <SideNav />
      <main>
        <Hero />
        <div className="beam-sep" aria-hidden="true" />
        <section id="projets" data-section="projets" className="section">
          <div className="container">
            <ScrollReveal><div className="stag">Projets phares</div></ScrollReveal>
            <ScrollReveal clip><h2 className="stitle clip-inner">Ce que j&apos;ai <span className="g">construit</span></h2></ScrollReveal>
            <div className="pj-grid" style={{ marginTop: 40 }}>
              {featured.map((p, i) => (
                <ScrollReveal key={p.title} delay={i * 0.1}><ProjectCard project={p} index={i} /></ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={0.2}>
              <Link href="/projets" className="btn-g" style={{ marginTop: 36 }}>Voir les douze projets</Link>
            </ScrollReveal>
          </div>
        </section>
        <div className="beam-sep" aria-hidden="true" />
        <section id="technos" data-section="technos" className="section">
          <div className="container">
            <ScrollReveal><div className="stag">Stack</div></ScrollReveal>
            <ScrollReveal clip><h2 className="stitle clip-inner">Neuf domaines, <span className="g">utilisés pour de vrai</span></h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="tk-prev" style={{ marginTop: 40 }}>
                {TECHNOS.map(t => <div key={t.domain}>{t.domain}<span>{t.items.length} technos</span></div>)}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Link href="/technos" className="btn-g" style={{ marginTop: 36 }}>Toutes les technos</Link>
            </ScrollReveal>
          </div>
        </section>
        <div className="beam-sep" aria-hidden="true" />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
