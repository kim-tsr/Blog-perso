import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { CONTACT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'À propos',
  description: "Kim Tessier, dernière année du cycle ingénieur majeure SecDevOps à l'EPITA Rennes (diplôme 2027).",
}

const PARAGRAPHS = [
  "Je m'appelle Kim Tessier. Je suis en dernière année du cycle ingénieur majeure SecDevOps à l'EPITA Rennes, diplôme en 2027. Je me spécialise dans la sécurité des infrastructures et de la chaîne logicielle : pipelines CI/CD sécurisés, Kubernetes, Infrastructure as Code et durcissement réseau.",
  "J'aime comprendre les systèmes jusqu'au bas niveau, et j'aime transmettre. Depuis juillet 2026, je fais partie des ACU (Assistants C/Unix), l'équipe pédagogique C/Unix de l'EPITA: je relis les sujets, j'encadre les Piscines C/Unix et SQL, et je maintiens un projet en C avec toute sa chaîne CI/CD (testsuite automatisée, build et déploiement via Nix). Auparavant, j'ai été assistant YAKA (Yet Another Kind of Assistant) sur les cours de Java, C++ et JavaScript en cycle ingénieur, puis ACDC (Assistant C Dièse Caml) sur le C# et le OCaml en cycle préparatoire.",
  "À la Junior-Entreprise JECT, j'ai créé l'antenne de Rennes, puis conçu une offre de 6 prestations de cybersécurité. J'ai aussi travaillé comme assistant chercheur sur la détection d'intrusion réseau en temps réel, et passé un semestre en Computer Science à California State University, Los Angeles.",
  "En dehors de l'informatique, je m'intéresse à la géopolitique, à l'informatique quantique et à l'électronique.",
]

export default function AProposPage() {
  return (
    <>
      <main>
        <PageHero tag="Profil" title="À" accent="propos" />
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            {PARAGRAPHS.map((p, i) => (
              <ScrollReveal key={i} delay={0.05 * i}>
                <p style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.8, marginBottom: 26 }}>{p}</p>
              </ScrollReveal>
            ))}
            <ScrollReveal delay={0.2}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 30 }}>
                <a href={CONTACT.cv} className="btn-p" download>Télécharger mon CV (PDF)</a>
                <a href="/contact" className="btn-g">Me contacter</a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
