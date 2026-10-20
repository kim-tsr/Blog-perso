import Link from 'next/link'
import LightRays from './LightRays'
import { PAD_DOCS_HOME, PAD_REPO } from '@/lib/pad'

// Archive statique de la documentation MkDocs de PenetrateAndDestroy (public/pad-docs, construite depuis le dépôt public).
const doc = (path: string) => `/pad-docs/${path}`

const SECTIONS = [
  { title: 'Démarrage rapide', href: doc('demarrage-rapide.html'), text: 'Les prérequis, puis task up : de l’hôte vierge à la plateforme en ligne.' },
  { title: 'Comment tout fonctionne', href: doc('fonctionnement.html'), text: 'Le parcours d’une requête, d’un joueur et d’une instance, de bout en bout.' },
  { title: 'Guide de déploiement', href: doc('guide-deploiement.html'), text: 'Les treize phases, leurs contrôles, et quarante entrées de dépannage issues du déploiement réel.' },
  { title: 'Architecture', href: doc('architecture/index.html'), text: 'Réseau en sept zones, matrice de flux, bootstrap, secrets, scaling, supervision.' },
  { title: 'Décisions (ADR)', href: doc('adr/index.html'), text: 'Quatorze choix d’architecture, avec les alternatives écartées et pourquoi.' },
  { title: 'Composants', href: doc('composants/index.html'), text: 'Une fiche par brique : rôle, version épinglée, configuration, sécurité, pièges connus.' },
  { title: 'Runbooks', href: doc('runbooks/index.html'), text: 'Une procédure pour chaque alerte : diagnostic, causes probables, correction.' },
  { title: 'Guides manager et joueur', href: doc('manager/index.html'), text: 'Importer un challenge, suivre un événement, rejoindre une instance par le VPN.' },
] as const

export default function PadDocs() {
  return (
    <div className="kd">
      <style>{`
        .kd-hero { position:relative; padding:72px 0 48px; overflow:hidden; }
        .kd-hero .container { position:relative; z-index:1; }
        .kd-back { display:inline-flex; font-size:14px; font-weight:500; color:var(--mid); margin-bottom:26px; }
        .kd-back:hover { color:var(--ink); }
        .kd h1 { font-weight:700; font-size:clamp(36px,5.5vw,64px); line-height:1.06; letter-spacing:-.035em; margin:6px 0 22px; max-width:880px; }
        .kd-intro { color:var(--mid); font-size:18px; line-height:1.8; max-width:760px; }
        .pd-off { max-width:760px; margin-top:26px; border:1px solid var(--border); border-left:3px solid var(--accent); border-radius:12px; padding:14px 18px; color:var(--mid); font-size:15px; line-height:1.7; background:color-mix(in srgb, var(--bg) 78%, transparent); }
        .pd-cta { display:flex; flex-wrap:wrap; gap:10px; margin-top:26px; }
        .pd-cta a { font-size:15px; font-weight:600; border:1px solid var(--border); padding:11px 20px; border-radius:12px; background:color-mix(in srgb, var(--bg) 70%, transparent); transition:border-color .15s; }
        .pd-cta a.primary { background:var(--ink); color:var(--bg); border-color:var(--ink); }
        .pd-cta a:hover { border-color:var(--ink); }
        .pd-body { padding-bottom:110px; }
        .pd-body h2 { font-size:clamp(24px,2.8vw,32px); font-weight:700; letter-spacing:-.025em; margin:0 0 20px; }
        .pd-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        @media (max-width:760px) { .pd-grid { grid-template-columns:1fr; } }
        .pd-card { display:block; border:1px solid var(--border); border-radius:18px; padding:22px 24px; background:color-mix(in srgb, var(--bg) 78%, transparent); transition:border-color .15s, transform .25s var(--ease); }
        .pd-card:hover { border-color:var(--ink); transform:translateY(-2px); }
        .pd-card b { display:block; font-size:17px; font-weight:650; margin-bottom:6px; }
        .pd-card span { color:var(--mid); font-size:14.5px; line-height:1.65; }
        .pd-note { color:var(--mid); font-size:15px; line-height:1.8; max-width:760px; margin-top:28px; }
      `}</style>

      <header className="kd-hero">
        <LightRays height={460} />
        <div className="container">
          <Link href="/projets/penetrate-and-destroy" className="kd-back">← Retour au projet PenetrateAndDestroy</Link>
          <div className="stag">Documentation</div>
          <h1>La documentation de PenetrateAndDestroy</h1>
          <p className="kd-intro">
            145 pages écrites avec le code, construites par MkDocs en mode strict dans la CI, puis corrigées pendant le
            déploiement réel : chaque correctif a mis à jour le guide, les fiches des composants ou le tableau de dépannage.
            Elle explique comment la plateforme est construite, pourquoi, et comment l&apos;exploiter.
          </p>
          <p className="pd-off">
            Archive statique. Le lab a été arrêté et n&apos;est plus en ligne : les adresses de la plateforme citées dans la
            documentation (front, Authentik, NetBird, bastion) ne répondent plus. La documentation, elle, ne dépend de rien et
            reste entièrement consultable.
          </p>
          <div className="pd-cta">
            <a className="primary" href={PAD_DOCS_HOME}>Ouvrir la documentation →</a>
            <a href={PAD_REPO} target="_blank" rel="noopener noreferrer">Dépôt GitHub ↗</a>
          </div>
        </div>
      </header>

      <div className="container pd-body">
        <h2>Par où commencer</h2>
        <div className="pd-grid">
          {SECTIONS.map(s => (
            <a key={s.href} href={s.href} className="pd-card"><b>{s.title}</b><span>{s.text}</span></a>
          ))}
        </div>
        <p className="pd-note">
          La version publiée ici est construite depuis le dépôt public : les valeurs propres à mon serveur (domaine, adresses
          publiques, nom de l&apos;hôte) n&apos;y figurent pas, elles restent des valeurs d&apos;exemple. La recherche intégrée
          fonctionne hors ligne, dans le navigateur.
        </p>
      </div>
    </div>
  )
}
