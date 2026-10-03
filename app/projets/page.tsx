import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ProjectsBento from '@/components/ProjectsBento'
import Footer from '@/components/Footer'
import { PROJECTS } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projets',
  description: 'Pipeline DevSecOps SLSA, GitOps sur Kubernetes, infrastructures multi-sites, audits, recherche offensive : mes projets.',
}

export default function ProjetsPage() {
  return (
    <>
      <main>
        <PageHero tag="Portfolio" title="Mes" accent="projets" sub={`${PROJECTS.length} projets, classés du plus proche de la cible DevSecOps au plus annexe.`} />
        <section className="section" style={{ paddingTop: 30 }}>
          <div className="container">
            <ProjectsBento projects={PROJECTS} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
