'use client'
import ScrollReveal from './ScrollReveal'

export default function Contact() {
  const handleSub = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const btn = form.querySelector('button')!
    btn.textContent = 'Merci ! ✓'
    btn.style.background = 'oklch(0.75 0.16 194)'
    setTimeout(() => { btn.textContent = "S'abonner"; btn.style.background = '' }, 3000)
    form.reset()
  }

  return (
    <section id="contact" data-section="contact" className="section" style={{background:'var(--bg)'}}>
      <style>{`
        .contact-wrap { max-width:640px; margin:0 auto; text-align:center; }
        .contact-wrap .stag { justify-content:center; }
        .contact-wrap .stag::before { display:none; }
        .contact-big { font-family:var(--fd); font-size:clamp(44px,5.5vw,72px); font-weight:700; letter-spacing:-.04em; line-height:.96; color:var(--text); margin-bottom:22px; }
        .contact-big .g { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .contact-sub { font-size:17px; color:var(--mid); font-weight:300; margin-bottom:52px; }
        .sub-form { display:flex; gap:10px; max-width:460px; margin:0 auto 44px; }
        .sub-input { flex:1; background:rgba(255,255,255,.05); border:1px solid var(--border); border-radius:100px; color:var(--text); font-family:var(--fb); font-size:15px; padding:14px 24px; outline:none; transition:border-color .2s,background .2s; }
        .sub-input:focus { border-color:var(--v); background:rgba(255,255,255,.08); }
        .sub-input::placeholder { color:var(--dim); }
        .socials { display:flex; gap:14px; justify-content:center; }
        .soc { width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,.04); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:var(--dim); font-family:var(--fm); font-size:10px; font-weight:700; transition:border-color .2s,color .2s,background .2s,transform .25s var(--ease); }
        .soc:hover { border-color:var(--v); color:var(--text); background:oklch(0.68 0.24 280/.1); transform:translateY(-4px); }
      `}</style>
      <div className="container">
        <div className="contact-wrap">
          <ScrollReveal><div className="stag">Newsletter</div></ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="contact-big">Apprendre<br/>ensemble,<br/><span className="g">continûment</span></h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="contact-sub">Un article chaque semaine. Du contenu technique soigné, sans spam.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <form className="sub-form" onSubmit={handleSub} aria-label="Formulaire d'abonnement">
              <input type="email" className="sub-input" placeholder="votre@email.com" required aria-label="Adresse e-mail" />
              <button type="submit" className="btn-p">S&apos;abonner</button>
            </form>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="socials">
              {[
                {label:'GitHub',text:'GH',href:'https://github.com/kim-tsr'},
                {label:'LinkedIn',text:'LI',href:'https://www.linkedin.com/in/kim-tessier-330262230/'},
              ].map(s => (
                <a key={s.text} href={s.href} className="soc" aria-label={s.label}
                   target={s.href !== '#' ? '_blank' : undefined}
                   rel={s.href !== '#' ? 'noopener noreferrer' : undefined}>{s.text}</a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
