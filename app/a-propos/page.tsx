import { Metadata } from 'next'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'À propos — dev.sec.ops',
  description: 'Kim Tessier — Étudiante Ingénieure DevSecOps, passionnée par l\'infrastructure, la cybersécurité et les réseaux.',
}

const SKILLS = [
  {
    label: 'Infrastructure',
    accent: 'var(--v)',
    bg: 'oklch(0.68 0.24 280/.12)',
    border: 'oklch(0.68 0.24 280/.25)',
    items: ['Kubernetes', 'Terraform', 'Ansible', 'Proxmox', 'Docker', 'CI/CD', 'ArgoCD'],
  },
  {
    label: 'Cybersécurité',
    accent: 'var(--c)',
    bg: 'oklch(0.75 0.16 194/.12)',
    border: 'oklch(0.75 0.16 194/.25)',
    items: ['Zero Trust', 'SIEM', 'Wazuh', 'ELK Stack', 'Hardening', 'IAM', 'Active Directory'],
  },
  {
    label: 'Réseau',
    accent: 'var(--a)',
    bg: 'oklch(0.76 0.16 65/.12)',
    border: 'oklch(0.76 0.16 65/.25)',
    items: ['WireGuard', 'OpenVPN', 'SDN', 'Firewall', 'BGP', 'VLANs', 'pfSense'],
  },
]

export default function AProposPage() {
  return (
    <>
      <main>
        {/* ── HERO ── */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg)', paddingTop: 100 }}>
          <style>{`
            .ap-orb-1 { position:absolute; width:650px; height:650px; border-radius:50%; filter:blur(100px); background:oklch(0.48 0.28 280/0.13); top:-160px; right:-120px; pointer-events:none; animation:orbF 9s ease-in-out infinite alternate; }
            .ap-orb-2 { position:absolute; width:450px; height:450px; border-radius:50%; filter:blur(100px); background:oklch(0.50 0.18 65/0.09); bottom:-80px; left:-80px; pointer-events:none; animation:orbF 11s ease-in-out infinite alternate-reverse; }
            .ap-hero-grid { display:grid; grid-template-columns:1.2fr 1fr; gap:80px; align-items:center; }
            .ap-eyebrow { font-family:var(--fm); font-size:10px; letter-spacing:.2em; color:var(--v); text-transform:uppercase; margin-bottom:24px; display:flex; align-items:center; gap:10px; opacity:0; animation:fU .8s var(--ease) .2s forwards; }
            .ap-eyebrow-line { width:24px; height:1px; background:var(--v); }
            .ap-name { font-family:var(--fd); font-size:clamp(52px,7vw,96px); font-weight:700; letter-spacing:-.04em; line-height:.92; margin-bottom:20px; }
            .ap-name-word { display:inline-block; overflow:hidden; vertical-align:bottom; }
            .ap-name-inner { display:inline-block; transform:translateY(110%); opacity:0; animation:wordIn .9s var(--ease) forwards; }
            .ap-role { font-family:var(--fm); font-size:14px; letter-spacing:.12em; color:var(--v); text-transform:uppercase; margin-bottom:32px; opacity:0; animation:fU .8s var(--ease) .8s forwards; }
            .ap-bio { font-size:17px; color:var(--mid); font-weight:300; line-height:1.75; max-width:500px; opacity:0; animation:fU .8s var(--ease) 1s forwards; }
            .ap-photo { aspect-ratio:4/5; border-radius:24px; overflow:hidden; position:relative; opacity:0; animation:fU .8s var(--ease) .4s forwards; }
            .ap-photo-bg { width:100%; height:100%; background:var(--bg3); border:1px solid var(--border); border-radius:24px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
            .ap-photo-bg::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,oklch(0.50 0.28 280/.22),transparent 55%),radial-gradient(circle at 75% 80%,oklch(0.50 0.18 65/.14),transparent 55%); }
            .ap-photo-glow { position:absolute; bottom:-40px; right:-40px; width:200px; height:200px; border-radius:50%; background:var(--gv); filter:blur(60px); pointer-events:none; }
            @media(max-width:768px) { .ap-hero-grid { grid-template-columns:1fr; } .ap-photo { max-width:280px; margin:0 auto; } }
          `}</style>
          <div className="ap-orb-1" aria-hidden="true" />
          <div className="ap-orb-2" aria-hidden="true" />
          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <div className="ap-hero-grid">
              <div>
                <div className="ap-eyebrow"><div className="ap-eyebrow-line" />Ingénieure DevSecOps</div>
                <h1 className="ap-name" aria-label="Kim Tessier">
                  <span className="ap-name-word"><span className="ap-name-inner" style={{ animationDelay: '.3s' }}>Kim</span></span>
                  <br />
                  <span className="ap-name-word"><span className="ap-name-inner" style={{ animationDelay: '.5s', background: 'linear-gradient(135deg,var(--v),var(--c))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tessier</span></span>
                </h1>
                <p className="ap-role">// Étudiante Ingénieure DevSecOps</p>
                <p className="ap-bio">
                  Passionnée par l&apos;architecture des systèmes sécurisés, je partage mes explorations sur l&apos;infrastructure,
                  la cybersécurité et les réseaux. Ce blog est un journal technique — chaque article, une étape de mon apprentissage.
                </p>
              </div>
              <div className="ap-photo" role="img" aria-label="Photo de profil Kim Tessier">
                <div className="ap-photo-bg">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                      <svg width="48" height="48" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="13" r="7" stroke="#5f5b78" strokeWidth="1.5"/><path d="M4 32c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#5f5b78" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '.15em', color: 'var(--dim)', textTransform: 'uppercase' }}>Kim Tessier</span>
                  </div>
                </div>
                <div className="ap-photo-glow" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        {/* ── BIO ── */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div style={{ maxWidth: 760 }}>
              <ScrollReveal><div className="stag">Mon parcours</div></ScrollReveal>
              <ScrollReveal clip>
                <h2 className="stitle clip-inner">La démarche<br /><span className="g">DevSecOps</span></h2>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="ssub" style={{ maxWidth: '100%', marginTop: 20, marginBottom: 24 }}>
                  Mon approche : intégrer la sécurité dès la conception, automatiser sans sacrifier la rigueur,
                  et documenter chaque découverte pour que la connaissance circule.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p style={{ fontSize: 16, color: 'var(--mid)', fontWeight: 300, lineHeight: 1.8, marginBottom: 20 }}>
                  En formation d&apos;ingénieure, je travaille quotidiennement sur des environnements Kubernetes,
                  des pipelines CI/CD sécurisés et des architectures Zero Trust. Ce blog est né de la conviction
                  qu&apos;on apprend mieux en expliquant — chaque article est une synthèse de ce que j&apos;ai dû comprendre
                  en profondeur pour pouvoir le transmettre.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <p style={{ fontSize: 16, color: 'var(--mid)', fontWeight: 300, lineHeight: 1.8 }}>
                  Mes sujets de prédilection : l&apos;orchestration de conteneurs, la détection d&apos;intrusion,
                  les architectures réseau distribuées et la philosophie DevSecOps appliquée au terrain.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        {/* ── SKILLS ── */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <style>{`
            .ap-skills-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:52px; }
            .ap-skill-group { background:rgba(255,255,255,.02); border:1px solid var(--border); border-radius:14px; padding:32px 28px; }
            .ap-skill-label { font-family:var(--fm); font-size:11px; letter-spacing:.14em; text-transform:uppercase; margin-bottom:20px; }
            .ap-tags { display:flex; flex-wrap:wrap; gap:8px; }
            .ap-tag { font-family:var(--fm); font-size:11px; letter-spacing:.06em; padding:5px 13px; border-radius:100px; transition:transform .2s; }
            .ap-tag:hover { transform:translateY(-2px); }
            @media(max-width:768px) { .ap-skills-grid { grid-template-columns:1fr; } }
          `}</style>
          <div className="container">
            <ScrollReveal><div className="stag">Compétences</div></ScrollReveal>
            <ScrollReveal clip>
              <h2 className="stitle clip-inner">Stack <span className="g">technique</span></h2>
            </ScrollReveal>
            <div className="ap-skills-grid">
              {SKILLS.map((g, i) => (
                <ScrollReveal key={g.label} delay={i * 0.1}>
                  <div className="ap-skill-group">
                    <div className="ap-skill-label" style={{ color: g.accent }}>{g.label}</div>
                    <div className="ap-tags">
                      {g.items.map(item => (
                        <span key={item} className="ap-tag" style={{ color: g.accent, background: g.bg, border: `1px solid ${g.border}` }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        {/* ── TIMELINE ── */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <style>{`
            .ap-tl { position:relative; padding-left:42px; margin-top:50px; }
            .ap-tl::before { content:''; position:absolute; left:11px; top:8px; bottom:8px; width:1px; background:linear-gradient(to bottom, var(--v), var(--c), var(--a), transparent); }
            .ap-tl-item { position:relative; padding-bottom:42px; }
            .ap-tl-item:last-child { padding-bottom:0; }
            .ap-tl-dot { position:absolute; left:-37px; top:6px; width:12px; height:12px; border-radius:50%; border:2px solid var(--tl-col); background:var(--bg); box-shadow:0 0 0 4px var(--bg), 0 0 18px var(--tl-col); }
            .ap-tl-date { font-family:var(--fm); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--tl-col); margin-bottom:8px; }
            .ap-tl-title { font-family:var(--fd); font-size:19px; font-weight:600; color:var(--text); letter-spacing:-.01em; margin-bottom:6px; }
            .ap-tl-desc { font-size:14px; color:var(--mid); line-height:1.7; font-weight:300; max-width:560px; }
            @media(max-width:768px) { .ap-tl { padding-left:28px; } .ap-tl::before { left:5px; } .ap-tl-dot { left:-26px; } }
          `}</style>
          <div className="container">
            <ScrollReveal><div className="stag">Parcours</div></ScrollReveal>
            <ScrollReveal clip>
              <h2 className="stitle clip-inner">Quelques <span className="g">étapes</span></h2>
            </ScrollReveal>
            <div className="ap-tl">
              {[
                { date: '2026 — Aujourd\'hui', title: 'Lancement de dev.sec.ops', desc: 'Création du blog pour documenter mes recherches et expérimentations en DevSecOps. Premiers articles publiés sur Kubernetes, Zero Trust et SIEM.', col: 'var(--v)' },
                { date: '2025 — Cybersécurité',  title: 'Spécialisation sécurité',  desc: 'Approfondissement de la cybersécurité défensive : SIEM (Wazuh/ELK), hardening Linux, IAM, audits Active Directory et architectures Zero Trust.', col: 'var(--c)' },
                { date: '2024 — Cloud Native',   title: 'Kubernetes & Cloud Native', desc: 'Construction d\'un homelab complet : Proxmox, Kubernetes, ArgoCD, observabilité avec Prometheus/Grafana/Loki. Premières contributions open-source.', col: 'var(--v)' },
                { date: '2023 — Réseau',         title: 'Fondations réseau',         desc: 'Maîtrise des protocoles : TCP/IP, routage dynamique (OSPF, BGP), VPN site-à-site, micro-segmentation et SDN.', col: 'var(--a)' },
                { date: '2022 — Linux',          title: 'Système & Linux',           desc: 'Apprentissage approfondi de l\'administration système : automatisation Bash, services systemd, conteneurisation Docker, scripting Python.', col: 'var(--c)' },
              ].map((it, i) => (
                <ScrollReveal key={it.title} delay={i * 0.05}>
                  <div className="ap-tl-item" style={{'--tl-col': it.col} as React.CSSProperties}>
                    <span className="ap-tl-dot" aria-hidden="true" />
                    <div className="ap-tl-date">{it.date}</div>
                    <div className="ap-tl-title">{it.title}</div>
                    <div className="ap-tl-desc">{it.desc}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        {/* ── STATS ── */}
        <section className="section" style={{ background: 'var(--bg)', paddingTop: 80, paddingBottom: 80 }}>
          <style>{`
            .ap-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
            @media(max-width:768px) { .ap-stats { grid-template-columns:repeat(2,1fr); } }
            .ap-stat { background:var(--bg); padding:32px 28px; }
            .ap-stat-num { font-family:var(--fd); font-size:42px; font-weight:700; line-height:1; letter-spacing:-.03em; }
            .ap-stat-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:12px; }
            .ap-stat-detail { font-size:12px; color:var(--mid); margin-top:6px; }
          `}</style>
          <div className="container">
            <ScrollReveal>
              <div className="ap-stats">
                <div className="ap-stat">
                  <div className="ap-stat-num" style={{ color: 'var(--v)' }}>6+</div>
                  <div className="ap-stat-label">Articles publiés</div>
                  <div className="ap-stat-detail">Et la roadmap s&apos;étend.</div>
                </div>
                <div className="ap-stat">
                  <div className="ap-stat-num" style={{ color: 'var(--c)' }}>3</div>
                  <div className="ap-stat-label">Domaines</div>
                  <div className="ap-stat-detail">Infra · Sécu · Réseau.</div>
                </div>
                <div className="ap-stat">
                  <div className="ap-stat-num" style={{ color: 'var(--a)' }}>6</div>
                  <div className="ap-stat-label">Projets actifs</div>
                  <div className="ap-stat-detail">Open-source & homelab.</div>
                </div>
                <div className="ap-stat">
                  <div className="ap-stat-num">4 ans</div>
                  <div className="ap-stat-label">D&apos;exploration</div>
                  <div className="ap-stat-detail">Linux → Cloud → SecOps.</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        <Contact />
      </main>
      <Footer />
    </>
  )
}
