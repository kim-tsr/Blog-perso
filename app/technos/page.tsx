import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { TECHNOS } from '@/lib/technos'

export const metadata: Metadata = {
  title: 'Technos',
  description: 'Les technologies que j’utilise réellement dans mes projets : CI/CD, Kubernetes, IaC, réseau, identité, sécurité offensive.',
}

export default function TechnosPage() {
  return (
    <>
      <style>{`
        .tk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        @media(max-width:900px){ .tk-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px){ .tk-grid { grid-template-columns:1fr; } }
        .tk { padding:26px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid var(--border); height:100%; }
        .tk h2 { font-family:var(--fm); font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--v); font-weight:400; margin-bottom:16px; }
        .tk ul { list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:6px; }
        .tk li { font-size:13px; color:var(--text); padding:4px 12px; border-radius:100px; border:1px solid var(--border); background:rgba(255,255,255,.03); }
      `}</style>
      <main>
        <PageHero tag="Stack" title="Mes" accent="technos" sub="Neuf domaines, sans niveau ni note : seulement ce que j'utilise réellement dans mes projets." />
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container">
            <div className="tk-grid">
              {TECHNOS.map((t, i) => (
                <ScrollReveal key={t.domain} delay={(i % 3) * 0.1}>
                  <div className="tk">
                    <h2>{t.domain}</h2>
                    <ul>{t.items.map(it => <li key={it}>{it}</li>)}</ul>
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
