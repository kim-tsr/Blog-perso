import { Metadata } from 'next'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Roadmap — dev.sec.ops',
  description: 'Articles, projets et expérimentations à venir sur dev.sec.ops.',
}

type Status = 'shipped' | 'progress' | 'planned' | 'idea'

interface Milestone {
  quarter: string
  title: string
  status: Status
  theme: 'v' | 'c' | 'a'
  items: { title: string; type: 'article' | 'projet' | 'série' | 'tooling'; status: Status }[]
}

const MILESTONES: Milestone[] = [
  {
    quarter: 'Q2 2026',
    title: 'Fondations DevSecOps',
    status: 'progress',
    theme: 'v',
    items: [
      { title: 'Déployer Kubernetes en production : le guide complet', type: 'article', status: 'shipped' },
      { title: 'Zero Trust avec BeyondCorp — architecture pas à pas',  type: 'article', status: 'shipped' },
      { title: 'SIEM open-source : Wazuh + ELK en homelab',            type: 'article', status: 'shipped' },
      { title: 'WireGuard vs OpenVPN — quel VPN moderne choisir ?',    type: 'article', status: 'shipped' },
      { title: 'Ansible & Terraform : duo de l\'IaC',                  type: 'article', status: 'shipped' },
      { title: 'SDN avec OpenFlow — comprendre le plan de contrôle',   type: 'article', status: 'shipped' },
    ],
  },
  {
    quarter: 'Q3 2026',
    title: 'Sécurité applicative',
    status: 'progress',
    theme: 'c',
    items: [
      { title: 'Sigstore & supply chain : signer ce qu\'on déploie', type: 'article', status: 'progress' },
      { title: 'Falco runtime security en cluster Kubernetes',       type: 'article', status: 'progress' },
      { title: 'eBPF pour les non-kernels : un mental model',        type: 'article', status: 'planned' },
      { title: 'Pipeline CI/CD durci : du SAST au DAST',             type: 'série',   status: 'planned' },
      { title: 'k-leakd : détecteur de secrets dans les manifests',  type: 'projet',  status: 'progress' },
    ],
  },
  {
    quarter: 'Q4 2026',
    title: 'Réseau &amp; observabilité',
    status: 'planned',
    theme: 'a',
    items: [
      { title: 'Service mesh : Istio vs Linkerd vs Cilium',           type: 'article', status: 'planned' },
      { title: 'OpenTelemetry de A à Z — traces, metrics, logs',      type: 'série',   status: 'planned' },
      { title: 'BGP en homelab : annonce de préfixes avec BIRD',      type: 'article', status: 'planned' },
      { title: 'sec-flow : générateur de NetworkPolicies depuis trace eBPF', type: 'projet', status: 'idea' },
    ],
  },
  {
    quarter: 'Q1 2027',
    title: 'Cloud &amp; Edge',
    status: 'idea',
    theme: 'v',
    items: [
      { title: 'Talos Linux : OS immuable pour Kubernetes',            type: 'article', status: 'idea' },
      { title: 'GitOps avancé avec ArgoCD ApplicationSets',            type: 'article', status: 'idea' },
      { title: 'Multi-cluster federation — patterns et anti-patterns', type: 'article', status: 'idea' },
      { title: 'devsecops-cli : automatisation des audits de cluster', type: 'tooling', status: 'idea' },
    ],
  },
]

const STATUS_LABEL: Record<Status, string> = {
  shipped:  'Publié',
  progress: 'En cours',
  planned:  'Planifié',
  idea:     'Idée',
}

const STATUS_COLOR: Record<Status, string> = {
  shipped:  'var(--c)',
  progress: 'var(--v)',
  planned:  'var(--a)',
  idea:     'var(--dim)',
}

const TYPE_LABEL: Record<string, string> = {
  article: 'art.',
  série:   'srs.',
  projet:  'proj.',
  tooling: 'tool.',
}

export default function RoadmapPage() {
  const totalItems = MILESTONES.reduce((acc, m) => acc + m.items.length, 0)
  const shipped    = MILESTONES.reduce((acc, m) => acc + m.items.filter(i => i.status === 'shipped').length, 0)
  const progress   = MILESTONES.reduce((acc, m) => acc + m.items.filter(i => i.status === 'progress').length, 0)
  const planned    = MILESTONES.reduce((acc, m) => acc + m.items.filter(i => i.status === 'planned' || i.status === 'idea').length, 0)

  return (
    <>
      <main>
        <style>{`
          .rd-hero { padding-top:140px; padding-bottom:60px; position:relative; overflow:hidden; background:var(--bg); }
          .rd-orb { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
          .rd-orb-1 { width:700px; height:500px; background:oklch(0.48 0.28 280/0.12); top:-150px; right:-200px; }
          .rd-orb-2 { width:400px; height:400px; background:oklch(0.50 0.18 65/0.08); bottom:-200px; left:-100px; }

          .rd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); margin-top:60px; border:1px solid var(--border); border-radius:14px; overflow:hidden; }
          .rd-stat { background:var(--bg); padding:28px 32px; }
          .rd-stat-num { font-family:var(--fd); font-size:36px; font-weight:700; letter-spacing:-.02em; line-height:1; color:var(--text); }
          .rd-stat-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:10px; }
          @media(max-width:768px) { .rd-stats { grid-template-columns:repeat(2,1fr); } }

          .rd-timeline { position:relative; padding-left:48px; margin-top:40px; }
          .rd-timeline::before { content:''; position:absolute; left:14px; top:8px; bottom:8px; width:1px; background:linear-gradient(to bottom, var(--v), var(--c), var(--a), transparent); }
          .rd-ms { position:relative; padding-bottom:80px; }
          .rd-ms:last-child { padding-bottom:0; }
          .rd-ms-marker { position:absolute; left:-41px; top:6px; width:14px; height:14px; border-radius:50%; background:var(--bg); border:2px solid var(--ms-col); box-shadow:0 0 0 4px var(--bg), 0 0 24px var(--ms-col); }
          .rd-ms-marker.shipped { background:var(--ms-col); }
          .rd-ms-head { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:8px; }
          .rd-ms-q { font-family:var(--fm); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ms-col); }
          .rd-ms-status { font-family:var(--fm); font-size:10px; letter-spacing:.14em; text-transform:uppercase; padding:3px 10px; border-radius:100px; border:1px solid var(--ms-col); color:var(--ms-col); background:color-mix(in oklab, var(--ms-col) 12%, transparent); }
          .rd-ms-title { font-family:var(--fd); font-size:28px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:24px; line-height:1.15; }

          .rd-items { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
          @media(max-width:768px) { .rd-items { grid-template-columns:1fr; } .rd-timeline { padding-left:34px; } .rd-timeline::before { left:6px; } .rd-ms-marker { left:-32px; } }
          .rd-item { display:flex; align-items:flex-start; gap:14px; padding:16px 20px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.025); transition:border-color .3s, transform .3s var(--ease), background .3s; }
          .rd-item:hover { border-color:rgba(255,255,255,.14); transform:translateY(-2px); background:rgba(255,255,255,.04); }
          .rd-item-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:7px; background:var(--it-col); box-shadow:0 0 14px var(--it-col); }
          .rd-item-body { flex:1; min-width:0; }
          .rd-item-title { font-size:14px; color:var(--text); font-weight:500; line-height:1.45; }
          .rd-item-meta { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:6px; display:flex; gap:10px; letter-spacing:.06em; text-transform:uppercase; }
          .rd-item-type { color:var(--it-col); }

          .rd-cta { margin-top:80px; padding:40px 36px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.02); display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap; }
          .rd-cta-text { font-family:var(--fd); font-size:18px; font-weight:600; color:var(--text); letter-spacing:-.01em; }
          .rd-cta-sub { font-size:14px; color:var(--mid); margin-top:4px; }
        `}</style>

        <section className="rd-hero">
          <div className="rd-orb rd-orb-1" aria-hidden="true" />
          <div className="rd-orb rd-orb-2" aria-hidden="true" />
          <div className="container" style={{position:'relative', zIndex:1}}>
            <ScrollReveal><div className="stag">Ce qui arrive</div></ScrollReveal>
            <ScrollReveal clip>
              <h1 className="stitle clip-inner" style={{marginBottom:18}}>
                La <span className="g">roadmap</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="ssub" style={{maxWidth:580}}>
                Un journal public des sujets en préparation, des projets en cours et des idées qui mijotent.
                Mises à jour au fil de la veille et des retours.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="rd-stats">
                <div className="rd-stat">
                  <div className="rd-stat-num" style={{color:'var(--c)'}}>{shipped}</div>
                  <div className="rd-stat-label">Publiés</div>
                </div>
                <div className="rd-stat">
                  <div className="rd-stat-num" style={{color:'var(--v)'}}>{progress}</div>
                  <div className="rd-stat-label">En cours</div>
                </div>
                <div className="rd-stat">
                  <div className="rd-stat-num" style={{color:'var(--a)'}}>{planned}</div>
                  <div className="rd-stat-label">Planifiés</div>
                </div>
                <div className="rd-stat">
                  <div className="rd-stat-num">{totalItems}</div>
                  <div className="rd-stat-label">Total</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        <section className="section" style={{background:'var(--bg)', paddingTop:80}}>
          <div className="container">
            <div className="rd-timeline">
              {MILESTONES.map((ms, idx) => {
                const col = ms.theme === 'v' ? 'var(--v)' : ms.theme === 'c' ? 'var(--c)' : 'var(--a)'
                return (
                  <ScrollReveal key={ms.quarter} delay={idx * 0.05}>
                    <div className="rd-ms" style={{'--ms-col': col} as React.CSSProperties}>
                      <span className={`rd-ms-marker ${ms.status}`} aria-hidden="true" />
                      <div className="rd-ms-head">
                        <span className="rd-ms-q">{ms.quarter}</span>
                        <span className="rd-ms-status">{STATUS_LABEL[ms.status]}</span>
                      </div>
                      <h2 className="rd-ms-title" dangerouslySetInnerHTML={{__html: ms.title}} />
                      <div className="rd-items">
                        {ms.items.map(it => {
                          const itCol = STATUS_COLOR[it.status]
                          return (
                            <div key={it.title} className="rd-item" style={{'--it-col': itCol} as React.CSSProperties}>
                              <span className="rd-item-dot" aria-hidden="true" />
                              <div className="rd-item-body">
                                <div className="rd-item-title">{it.title}</div>
                                <div className="rd-item-meta">
                                  <span className="rd-item-type">{TYPE_LABEL[it.type] || it.type}</span>
                                  <span>·</span>
                                  <span>{STATUS_LABEL[it.status]}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>

            <ScrollReveal>
              <div className="rd-cta">
                <div>
                  <div className="rd-cta-text">Un sujet à proposer ?</div>
                  <div className="rd-cta-sub">Les meilleurs articles partent souvent de questions venues du terrain.</div>
                </div>
                <a href="mailto:kim.tessier07@gmail.com" className="btn-p">
                  Suggérer un sujet
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
