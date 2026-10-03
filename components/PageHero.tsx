import ScrollReveal from './ScrollReveal'
import LightRays from './LightRays'

export default function PageHero({ tag, title, accent, sub }: { tag: string; title: string; accent: string; sub?: string }) {
  return (
    <section style={{ padding: '84px 0 40px', position: 'relative', overflow: 'hidden' }}>
      <LightRays height={420} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <ScrollReveal><div className="stag">{tag}</div></ScrollReveal>
        <ScrollReveal clip>
          <h1 className="stitle clip-inner" style={{ marginBottom: 0 }}>{title} <span className="g">{accent}</span></h1>
        </ScrollReveal>
        {sub && (
          <ScrollReveal delay={0.2}>
            <p className="ssub" style={{ marginTop: 18 }}>{sub}</p>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
