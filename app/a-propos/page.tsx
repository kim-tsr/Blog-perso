import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { CONTACT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'À propos',
  description: "Kim Tessier, dernière année du cycle ingénieur cybersécurité à l'EPITA Rennes (diplôme 2027).",
}

const PARAGRAPHS = [
  "Je m'appelle Kim Tessier. Je suis en dernière année du cycle ingénieur cybersécurité à l'EPITA Rennes, diplôme en 2027. Je me spécialise dans la sécurité des infrastructures et de la chaîne logicielle : pipelines CI/CD sécurisés, Kubernetes, Infrastructure as Code et durcissement réseau.",
  "J'aime comprendre les systèmes jusqu'au bas niveau, et j'aime transmettre. Depuis juillet 2026, je fais partie de l'équipe pédagogique C/Unix de l'EPITA : je suis responsable du projet httpd, je relis les sujets, et j'encadre les Piscines C/Unix et SQL. Avant cela, j'ai été assistant sur les cours de Java, C++ et JavaScript en cycle ingénieur, et de C# en cycle préparatoire.",
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
                <p style={{ fontSize: 17, color: 'var(--mid)', lineHeight: 1.85, fontWeight: 300, marginBottom: 26 }}>{p}</p>
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
