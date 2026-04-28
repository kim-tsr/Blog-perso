import ScrollReveal from './ScrollReveal'

export default function About() {
  return (
    <section id="about" data-section="about" className="section" style={{background:'var(--bg)'}}>
      <style>{`
        .about-grid { display:grid; grid-template-columns:1fr 1.1fr; gap:96px; align-items:center; }
        .about-photo { position:relative; aspect-ratio:4/5; border-radius:20px; overflow:hidden; }
        .about-photo-bg { width:100%; height:100%; background:var(--bg3); border:1px solid var(--border); border-radius:20px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
        .about-photo-bg::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,oklch(0.50 0.28 280/.22),transparent 55%),radial-gradient(circle at 75% 80%,oklch(0.50 0.18 194/.14),transparent 55%); }
        .photo-ph { display:flex; flex-direction:column; align-items:center; gap:12px; position:relative; z-index:1; }
        .photo-circle { width:80px; height:80px; border-radius:50%; border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; }
        .photo-txt { font-family:var(--fm); font-size:9px; letter-spacing:.15em; color:var(--dim); text-transform:uppercase; }
        .about-glow { position:absolute; bottom:-30px; right:-30px; width:180px; height:180px; border-radius:50%; background:var(--gv); filter:blur(50px); z-index:-1; }
        .about-badges { display:flex; flex-wrap:wrap; gap:8px; margin-top:30px; }
        .badge { background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--mid); font-size:12px; font-weight:500; padding:5px 14px; border-radius:100px; transition:border-color .2s,color .2s; }
        .badge:hover { border-color:oklch(0.68 0.24 280/.5); color:var(--text); }
        @media(max-width:768px) { .about-grid { grid-template-columns:1fr; gap:48px; } }
      `}</style>
      <div className="container">
        <div className="about-grid">
          <ScrollReveal>
            <div className="about-photo" role="img" aria-label="Photo de profil">
              <div className="about-photo-bg">
                <div className="photo-ph">
                  <div className="photo-circle" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="13" r="7" stroke="#5f5b78" strokeWidth="1.5"/><path d="M4 32c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#5f5b78" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="photo-txt">Kim Tessier</span>
                </div>
              </div>
              <div className="about-glow" aria-hidden="true" />
            </div>
          </ScrollReveal>
          <div className="about-text">
            <ScrollReveal><div className="stag">À propos</div></ScrollReveal>
            <h2 className="stitle">
              <span className="split-line"><span className="split-line-inner">Étudiant Ingénieur</span></span>
              <span className="split-line"><span className="split-line-inner"><span className="g">DevSecOps</span></span></span>
            </h2>
            <ScrollReveal delay={0.2}>
              <p className="ssub">Passionné par l&apos;architecture des systèmes sécurisés, je partage ici mes explorations sur l&apos;infrastructure, la cybersécurité et les réseaux.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="about-badges">
                {['Kubernetes','Ansible','Terraform','Zero Trust','Proxmox','CI/CD','SIEM','WireGuard', 'Active Directory'].map(b => (
                  <span key={b} className="badge">{b}</span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
