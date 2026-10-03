import ScrollReveal from './ScrollReveal'
import { CONTACT } from '@/lib/site'

const SUBJECT = 'Stage de fin d’études DevSecOps — prise de contact'
const BODY = 'Bonjour Kim,\n\nJe me permets de vous contacter au sujet de votre recherche de stage.\n\n'

export default function HomeCTA() {
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`
  return (
    <section className="cta">
      <style>{`
        .cta { position:relative; padding:40px 0 120px; text-align:center; }
        .cta-box { max-width:760px; margin:0 auto; padding:56px 32px; border:1px solid var(--border); border-radius:24px;
          background:radial-gradient(70% 90% at 50% 0%, var(--glow-a), transparent 75%), color-mix(in srgb, var(--bg) 70%, transparent); }
        .cta h2 { font-size:clamp(28px,4vw,42px); font-weight:700; letter-spacing:-.03em; line-height:1.15; margin-bottom:14px; }
        .cta p { color:var(--mid); font-size:17px; max-width:520px; margin:0 auto 30px; line-height:1.7; }
        .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
      `}</style>
      <div className="container">
        <ScrollReveal>
          <div className="cta-box">
            <h2>Un stage DevSecOps à pourvoir ?</h2>
            <p>Je recherche un stage de fin d&apos;études à partir de février 2027. Écrivons-nous.</p>
            <div className="cta-btns">
              <a href={mailto} className="btn-p">Me contacter</a>
              <a href={CONTACT.cv} className="btn-g" download>Télécharger mon CV</a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
