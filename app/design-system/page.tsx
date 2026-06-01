import { Metadata } from 'next'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Design System — dev.sec.ops',
  description: 'Le langage visuel de dev.sec.ops : tokens, typographie, composants, motion.',
}

const COLOR_TOKENS = [
  { name: '--bg',     hex: '#07070c',           usage: 'Arrière-plan principal' },
  { name: '--bg2',    hex: '#0c0c15',           usage: 'Surface élevée — pre, blockquote' },
  { name: '--bg3',    hex: '#11111e',           usage: 'Surface secondaire' },
  { name: '--text',   hex: '#ede9ff',           usage: 'Texte principal' },
  { name: '--mid',    hex: '#9e9ab8',           usage: 'Texte secondaire / paragraphes' },
  { name: '--dim',    hex: '#5f5b78',           usage: 'Texte tertiaire / métadonnées' },
  { name: '--border', hex: 'rgba(255,255,255,.07)', usage: 'Bordures, séparateurs' },
]

const ACCENTS = [
  { name: '--v', token: 'oklch(0.68 0.24 280)', domain: 'Infrastructure', sample: 'var(--v)' },
  { name: '--c', token: 'oklch(0.75 0.16 194)', domain: 'Cybersécurité',  sample: 'var(--c)' },
  { name: '--a', token: 'oklch(0.76 0.16 65)',  domain: 'Réseau',         sample: 'var(--a)' },
]

const TYPE_SAMPLES = [
  { label: 'Hero', size: 'clamp(60px,8.5vw,110px)', family: 'Space Grotesk', weight: 700, css: 'font-family:var(--fd); font-size:clamp(60px,8.5vw,110px); letter-spacing:-.04em;', txt: 'Comprendre.' },
  { label: 'Display', size: 'clamp(38px,5vw,58px)', family: 'Space Grotesk', weight: 700, css: 'class="stitle"', txt: 'Titre de section' },
  { label: 'H2', size: '24px', family: 'Space Grotesk', weight: 700, css: '.prose h2', txt: 'Sous-section' },
  { label: 'Body', size: '16px', family: 'Figtree', weight: 300, css: 'body', txt: 'Un paragraphe de corps lisible pour le contenu éditorial.' },
  { label: 'Label', size: '11px', family: 'Space Mono', weight: 400, css: '.stag', txt: '// BASE DE CONNAISSANCES' },
]

const SPACING_TOKENS = [
  { name: 'xs',  px: 8 },
  { name: 'sm',  px: 14 },
  { name: 'md',  px: 24 },
  { name: 'lg',  px: 40 },
  { name: 'xl',  px: 64 },
  { name: '2xl', px: 100 },
  { name: '3xl', px: 130 },
]

const RADII = [
  { name: 'sm',   px: 6 },
  { name: 'md',   px: 10 },
  { name: 'lg',   px: 14 },
  { name: 'xl',   px: 24 },
  { name: 'pill', px: 100 },
]

const MOTION = [
  { label: 'Reveal',      detail: 'opacity 0→1 + translateY(48→0) — 900ms',  easing: 'cubic-bezier(.16,1,.3,1)' },
  { label: 'Clip reveal', detail: 'translateY(105% → 0) — 1000ms',           easing: 'cubic-bezier(.16,1,.3,1)' },
  { label: 'Hover tilt',  detail: 'perspective(700-1200) rotateX/Y ±5-10°',  easing: 'cubic-bezier(.16,1,.3,1)' },
  { label: 'Button lift', detail: 'translateY(-3px) + box-shadow glow',      easing: 'ease-out 250ms' },
]

export default function DesignSystemPage() {
  return (
    <>
      <main>
        <style>{`
          .ds-hero { padding-top:140px; padding-bottom:60px; position:relative; overflow:hidden; background:var(--bg); }
          .ds-hero::before { content:''; position:absolute; width:600px; height:500px; border-radius:50%; background:oklch(0.50 0.18 194/.10); filter:blur(110px); top:-100px; left:-150px; pointer-events:none; }
          .ds-toc { display:flex; flex-wrap:wrap; gap:8px; margin-top:36px; }
          .ds-toc a { font-family:var(--fm); font-size:11px; letter-spacing:.08em; padding:8px 18px; border-radius:100px; border:1px solid var(--border); color:var(--dim); transition:color .2s, border-color .2s; }
          .ds-toc a:hover { color:var(--text); border-color:rgba(255,255,255,.2); }

          .ds-section { padding:80px 0; border-top:1px solid var(--border); }
          .ds-section:first-of-type { border-top:none; }
          .ds-heading { display:flex; align-items:baseline; gap:16px; margin-bottom:40px; }
          .ds-heading h2 { font-family:var(--fd); font-size:32px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
          .ds-heading .num { font-family:var(--fm); font-size:11px; color:var(--v); letter-spacing:.2em; }
          .ds-lead { color:var(--mid); font-weight:300; max-width:560px; line-height:1.7; margin-bottom:40px; }

          .ds-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .ds-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .ds-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
          @media(max-width:768px) { .ds-grid-3, .ds-grid-4, .ds-grid-2 { grid-template-columns:1fr; } }

          .swatch { border:1px solid var(--border); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.02); }
          .swatch-fill { height:120px; position:relative; }
          .swatch-meta { padding:18px 20px; }
          .swatch-name { font-family:var(--fm); font-size:11px; color:var(--text); letter-spacing:.04em; }
          .swatch-hex { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:4px; }
          .swatch-usage { font-size:12px; color:var(--mid); margin-top:10px; line-height:1.5; }

          .ds-type { padding:24px 28px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); }
          .ds-type-label { font-family:var(--fm); font-size:10px; letter-spacing:.18em; color:var(--v); text-transform:uppercase; margin-bottom:12px; display:flex; justify-content:space-between; }
          .ds-type-label span:last-child { color:var(--dim); }
          .ds-type-sample { font-family:var(--fd); color:var(--text); margin-bottom:14px; line-height:1.1; }
          .ds-type-css { font-family:var(--fm); font-size:11px; color:var(--c); background:var(--bg2); border-radius:6px; padding:8px 12px; }

          .ds-space-row { display:flex; align-items:center; gap:20px; padding:14px 20px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.02); margin-bottom:10px; }
          .ds-space-bar { background:var(--v); height:14px; border-radius:3px; opacity:.7; }
          .ds-space-name { font-family:var(--fm); font-size:12px; color:var(--text); width:60px; }
          .ds-space-px { font-family:var(--fm); font-size:11px; color:var(--dim); margin-left:auto; }

          .ds-radius-card { aspect-ratio:1; border:1px solid var(--border); background:rgba(255,255,255,.03); display:flex; align-items:center; justify-content:center; font-family:var(--fm); font-size:11px; color:var(--mid); transition:border-color .3s,color .3s; }
          .ds-radius-card:hover { border-color:var(--v); color:var(--text); }

          .ds-comp { padding:36px 30px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); display:flex; flex-direction:column; gap:20px; }
          .ds-comp-title { font-family:var(--fm); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--v); }
          .ds-comp-row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }

          .ds-motion-card { padding:24px 28px; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,.02); }
          .ds-motion-label { font-family:var(--fd); font-size:15px; font-weight:600; color:var(--text); margin-bottom:6px; }
          .ds-motion-detail { font-size:13px; color:var(--mid); margin-bottom:8px; }
          .ds-motion-easing { font-family:var(--fm); font-size:10px; color:var(--c); }

          .ds-principles { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          @media(max-width:768px) { .ds-principles { grid-template-columns:1fr; } }
          .ds-principle { padding:30px 28px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); }
          .ds-principle-num { font-family:var(--fm); font-size:11px; color:var(--v); margin-bottom:14px; }
          .ds-principle h3 { font-family:var(--fd); font-size:18px; font-weight:700; color:var(--text); margin-bottom:10px; letter-spacing:-.01em; }
          .ds-principle p { font-size:14px; color:var(--mid); line-height:1.7; font-weight:300; }
        `}</style>

        <section className="ds-hero">
          <div className="container" style={{position:'relative', zIndex:1}}>
            <ScrollReveal><div className="stag">Système de design</div></ScrollReveal>
            <ScrollReveal clip>
              <h1 className="stitle clip-inner" style={{marginBottom:18}}>
                Le langage <span className="g">visuel</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="ssub" style={{maxWidth:580}}>
                Une grammaire cohérente pour communiquer la rigueur du DevSecOps :
                sobre, technique, sans concession. Chaque token a un usage défini.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="ds-toc">
                <a href="#principles">Principes</a>
                <a href="#color">Couleurs</a>
                <a href="#typography">Typographie</a>
                <a href="#spacing">Espacement</a>
                <a href="#radius">Rayons</a>
                <a href="#components">Composants</a>
                <a href="#motion">Motion</a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        {/* PRINCIPLES */}
        <section id="principles" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">01</span>
              <h2>Principes</h2>
            </div>
            <div className="ds-principles">
              <ScrollReveal>
                <div className="ds-principle">
                  <div className="ds-principle-num">// rigueur</div>
                  <h3>Précision avant ornement</h3>
                  <p>Chaque pixel a une raison. Les ombres, les flous et les couleurs servent la lecture, jamais l&apos;esbroufe.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="ds-principle">
                  <div className="ds-principle-num">// clarté</div>
                  <h3>Hiérarchie sans bavardage</h3>
                  <p>Trois accents colorés, trois familles de typographie. Le contraste vient de la composition, pas de l&apos;empilement.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="ds-principle">
                  <div className="ds-principle-num">// terrain</div>
                  <h3>Technique &amp; lisible</h3>
                  <p>Code, schémas, données : l&apos;UI doit s&apos;effacer devant le contenu et révéler la structure du sujet.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* COLOR */}
        <section id="color" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">02</span>
              <h2>Couleurs</h2>
            </div>
            <p className="ds-lead">
              Trois accents OKLCH, chacun lié à un domaine d&apos;expertise. Les surfaces neutres descendent vers le quasi-noir.
            </p>

            <div className="stag" style={{marginBottom:20}}>Accents par domaine</div>
            <div className="ds-grid-3" style={{marginBottom:50}}>
              {ACCENTS.map(a => (
                <div key={a.name} className="swatch">
                  <div className="swatch-fill" style={{background:`linear-gradient(135deg,${a.sample},${a.sample === 'var(--v)' ? 'var(--c)' : a.sample === 'var(--c)' ? 'var(--a)' : 'var(--v)'})`}} />
                  <div className="swatch-meta">
                    <div className="swatch-name">{a.name}</div>
                    <div className="swatch-hex">{a.token}</div>
                    <div className="swatch-usage">{a.domain}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="stag" style={{marginBottom:20}}>Neutres</div>
            <div className="ds-grid-4">
              {COLOR_TOKENS.map(t => (
                <div key={t.name} className="swatch">
                  <div className="swatch-fill" style={{background:t.hex, borderBottom:'1px solid var(--border)'}} />
                  <div className="swatch-meta">
                    <div className="swatch-name">{t.name}</div>
                    <div className="swatch-hex">{t.hex}</div>
                    <div className="swatch-usage">{t.usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section id="typography" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">03</span>
              <h2>Typographie</h2>
            </div>
            <p className="ds-lead">
              <strong style={{color:'var(--text)'}}>Space Grotesk</strong> structure, <strong style={{color:'var(--text)'}}>Figtree</strong> raconte, <strong style={{color:'var(--text)'}}>Space Mono</strong> ponctue.
            </p>
            <div className="ds-grid-2">
              {TYPE_SAMPLES.map(s => (
                <div key={s.label} className="ds-type">
                  <div className="ds-type-label">
                    <span>// {s.label}</span><span>{s.family} · {s.weight}</span>
                  </div>
                  <div className="ds-type-sample" style={{
                    fontSize:s.size,
                    fontFamily:s.family === 'Figtree' ? 'var(--fb)' : s.family === 'Space Mono' ? 'var(--fm)' : 'var(--fd)',
                    fontWeight:s.weight,
                    color: s.label === 'Body' ? 'var(--mid)' : s.label === 'Label' ? 'var(--v)' : 'var(--text)',
                    letterSpacing: s.label === 'Hero' || s.label === 'Display' ? '-.03em' : s.label === 'Label' ? '.18em' : undefined,
                    textTransform: s.label === 'Label' ? 'uppercase' : undefined,
                  }}>{s.txt}</div>
                  <div className="ds-type-css">{s.css}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPACING */}
        <section id="spacing" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">04</span>
              <h2>Espacement</h2>
            </div>
            <p className="ds-lead">
              Échelle progressive non-linéaire — accélération maîtrisée pour les sections.
            </p>
            <div>
              {SPACING_TOKENS.map(s => (
                <div key={s.name} className="ds-space-row">
                  <span className="ds-space-name">{s.name}</span>
                  <div className="ds-space-bar" style={{width:s.px}} />
                  <span className="ds-space-px">{s.px}px</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RADII */}
        <section id="radius" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">05</span>
              <h2>Rayons</h2>
            </div>
            <div className="ds-grid-4">
              {RADII.map(r => (
                <div key={r.name} className="ds-radius-card" style={{borderRadius:r.px}}>
                  {r.name} — {r.px}px
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPONENTS */}
        <section id="components" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">06</span>
              <h2>Composants</h2>
            </div>
            <p className="ds-lead">
              Briques réutilisables — chacune respecte la grammaire du système.
            </p>
            <div className="ds-grid-2">
              <div className="ds-comp">
                <div className="ds-comp-title">// boutons</div>
                <div className="ds-comp-row">
                  <button className="btn-p">Action principale</button>
                  <button className="btn-g">Action secondaire</button>
                </div>
              </div>
              <div className="ds-comp">
                <div className="ds-comp-title">// tags catégorie</div>
                <div className="ds-comp-row">
                  <span className="ac-tag tv" style={{fontFamily:'var(--fm)',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',background:'oklch(0.68 0.24 280/.12)',border:'1px solid oklch(0.68 0.24 280/.25)',padding:'5px 13px',borderRadius:100}}>Infrastructure</span>
                  <span className="ac-tag tc" style={{fontFamily:'var(--fm)',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',background:'oklch(0.75 0.16 194/.12)',border:'1px solid oklch(0.75 0.16 194/.25)',padding:'5px 13px',borderRadius:100}}>Sécurité</span>
                  <span className="ac-tag ta" style={{fontFamily:'var(--fm)',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',background:'oklch(0.76 0.16 65/.12)',border:'1px solid oklch(0.76 0.16 65/.25)',padding:'5px 13px',borderRadius:100}}>Réseau</span>
                </div>
              </div>
              <div className="ds-comp">
                <div className="ds-comp-title">// eyebrow / label</div>
                <div className="stag" style={{margin:0}}>Base de connaissances</div>
              </div>
              <div className="ds-comp">
                <div className="ds-comp-title">// séparateur</div>
                <div className="beam-sep" style={{width:'100%'}} aria-hidden="true" />
              </div>
              <div className="ds-comp">
                <div className="ds-comp-title">// titre section</div>
                <h3 className="stitle" style={{fontSize:32,marginBottom:0}}>
                  Titre <span className="g">accentué</span>
                </h3>
              </div>
              <div className="ds-comp">
                <div className="ds-comp-title">// citation / note</div>
                <div className="prose" style={{maxWidth:'100%'}}>
                  <blockquote><p>Une note importante qui souligne un point clé du contenu.</p></blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOTION */}
        <section id="motion" className="ds-section">
          <div className="container">
            <div className="ds-heading">
              <span className="num">07</span>
              <h2>Motion</h2>
            </div>
            <p className="ds-lead">
              Une seule courbe d&apos;easing pour tout ce qui n&apos;est pas linéaire — cohérence garantie.
            </p>
            <div className="ds-grid-2">
              {MOTION.map(m => (
                <div key={m.label} className="ds-motion-card">
                  <div className="ds-motion-label">{m.label}</div>
                  <div className="ds-motion-detail">{m.detail}</div>
                  <div className="ds-motion-easing">{m.easing}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
