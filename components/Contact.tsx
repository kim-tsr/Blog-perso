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
    <section id={id} style={{ borderTop: 'var(--line)' }} className="section">
      <style>{`
        .contact-wrap { max-width:640px; }
        .contact-big { font-size:clamp(34px,5vw,56px); font-weight:700; letter-spacing:-.03em; line-height:1.08; margin-bottom:18px; }
        .contact-big em { font-style:normal; color:var(--accent); }
        .contact-sub { font-size:17px; color:var(--mid); margin-bottom:36px; line-height:1.7; }
        .contact-list { list-style:none; margin:0 0 36px; border:var(--line); box-shadow:var(--shadow); background:var(--bg); }
        .contact-list li { display:flex; justify-content:space-between; gap:16px; padding:14px 20px; border-bottom:var(--line); font-size:15px; }
        .contact-list li:last-child { border-bottom:0; }
        .contact-list .k { font-size:14px; color:var(--dim); }
        .contact-list a {  overflow-wrap:anywhere; text-align:right; }
        .contact-list a:hover { color:var(--accent); }
      `}</style>
      <div className="container">
        <div className="contact-wrap">
          <ScrollReveal><div className="stag">Contact</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="contact-big">Parlons de<br />votre <em>stage</em></h2>
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
