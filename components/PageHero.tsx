import ScrollReveal from './ScrollReveal'

export default function PageHero({ tag, title, accent, sub }: { tag: string; title: string; accent: string; sub?: string }) {
  return (
    <section style={{ padding: '150px 0 60px', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <ScrollReveal><div className="stag">{tag}</div></ScrollReveal>
        <ScrollReveal clip>
          <h1 className="stitle clip-inner" style={{ marginBottom: 0 }}>{title} <span className="g">{accent}</span></h1>
        </ScrollReveal>
        {sub && (
          <ScrollReveal delay={0.2}>
            <p className="ssub" style={{ marginTop: 16, maxWidth: 620 }}>{sub}</p>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
