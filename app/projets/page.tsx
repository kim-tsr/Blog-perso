import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ProjectCard, { PROJECT_CARD_CSS } from '@/components/ProjectCard'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { PROJECTS } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projets',
  description: 'Pipeline DevSecOps SLSA, homelab GitOps, infrastructures multi-sites, audits, recherche offensive : mes projets.',
}

export default function ProjetsPage() {
  return (
    <>
      <style>{PROJECT_CARD_CSS}</style>
      <main>
        <PageHero tag="Portfolio" title="Mes" accent="projets" sub="Douze projets, classés du plus proche de la cible DevSecOps au plus annexe." />
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container">
            <div className="pj-grid">
              {PROJECTS.map((p, i) => (
                <ScrollReveal key={p.title} delay={(i % 2) * 0.1}>
                  <ProjectCard project={p} index={i} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
