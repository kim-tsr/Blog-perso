import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import TechCloud from '@/components/TechCloud'
import { TECHNOS } from '@/lib/technos'

export const metadata: Metadata = {
  title: 'Technos',
  description: 'Les technologies que j’utilise réellement dans mes projets : CI/CD, Kubernetes, IaC, réseau, identité, sécurité offensive.',
}

export default function TechnosPage() {
  return (
    <>
      <style>{`
        .tk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        @media(max-width:900px){ .tk-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px){ .tk-grid { grid-template-columns:1fr; } }
        .tk { padding:24px; background:var(--bg); border:var(--line); box-shadow:var(--shadow); height:100%; }
        .tk h2 { font-size:17px; font-weight:650; margin-bottom:14px; }
        .tk ul { list-style:none; display:flex; flex-wrap:wrap; gap:6px; }
      `}</style>
      <main>
        <PageHero tag="Stack" title="Mes" accent="technos" sub="Neuf domaines, sans niveau ni note : seulement ce que j'utilise réellement dans mes projets." />
        <section style={{ padding: '10px 0 30px' }}>
          <div className="container"><TechCloud /></div>
        </section>
        <section className="section" style={{ paddingTop: 30 }}>
          <div className="container">
            <div className="tk-grid">
              {TECHNOS.map((t, i) => (
                <ScrollReveal key={t.domain} delay={(i % 3) * 0.1}>
                  <div className="tk">
                    <h2>{t.domain}</h2>
                    <ul>{t.items.map(it => <li key={it} className="tag">{it}</li>)}</ul>
                  </div>
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
