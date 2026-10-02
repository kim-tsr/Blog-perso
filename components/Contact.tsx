import ScrollReveal from './ScrollReveal'
import { CONTACT } from '@/lib/site'

export default function Contact({ id = 'contact' }: { id?: string }) {
  const rows = [
    { k: 'Mail', v: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { k: 'LinkedIn', v: CONTACT.linkedinLabel, href: CONTACT.linkedin },
    { k: 'GitHub', v: CONTACT.githubLabel, href: CONTACT.github },
    { k: 'Localisation', v: CONTACT.location },
  ]
  return (
    <section id={id} data-section="contact" className="section" style={{ background: 'var(--bg)' }}>
      <style>{`
        .contact-wrap { max-width:640px; margin:0 auto; text-align:center; }
        .contact-wrap .stag { justify-content:center; }
        .contact-wrap .stag::before { display:none; }
        .contact-big { font-family:var(--fd); font-size:clamp(40px,5.5vw,68px); font-weight:700; letter-spacing:-.04em; line-height:.98; color:var(--text); margin-bottom:22px; }
        .contact-big .g { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .contact-sub { font-size:17px; color:var(--mid); font-weight:300; margin-bottom:40px; line-height:1.7; }
        .contact-list { list-style:none; padding:0; margin:0 auto 40px; max-width:460px; text-align:left; border-top:1px solid var(--border); }
        .contact-list li { display:flex; justify-content:space-between; gap:16px; padding:14px 0; border-bottom:1px solid var(--border); font-size:14px; }
        .contact-list .k { font-family:var(--fm); font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--dim); padding-top:3px; }
        .contact-list a { color:var(--text); transition:color .2s; overflow-wrap:anywhere; text-align:right; }
        .contact-list a:hover { color:var(--v); }
      `}</style>
      <div className="container">
        <div className="contact-wrap">
          <ScrollReveal><div className="stag">Contact</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="contact-big">Parlons de<br />votre <span className="g">stage</span></h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="contact-sub">Je recherche un stage de fin d&apos;études en DevSecOps ou en sécurité des infrastructures à partir de février 2027. Écrivez-moi par mail ou sur LinkedIn.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <ul className="contact-list">
              {rows.map(r => (
                <li key={r.k}>
                  <span className="k">{r.k}</span>
                  {r.href
                    ? <a href={r.href} {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{r.v}</a>
                    : <span>{r.v}</span>}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <a href={CONTACT.cv} className="btn-p" download>Télécharger mon CV (PDF)</a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
