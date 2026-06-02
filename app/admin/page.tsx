import { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/service'

export const metadata: Metadata = { title: 'Admin · dev.sec.ops' }

async function counts() {
  const supabase = createPublicClient()
  if (!supabase) return null
  const [arts, labs, projs, cats, codes] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('labs').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('slug', { count: 'exact', head: true }),
    supabase.from('access_codes').select('code', { count: 'exact', head: true }),
  ])
  return {
    articles:   arts.count   ?? 0,
    labs:       labs.count   ?? 0,
    projects:   projs.count  ?? 0,
    categories: cats.count   ?? 0,
    codes:      codes.count  ?? 0,
  }
}

const CARDS = [
  { href: '/admin/articles',   title: 'Articles',   desc: 'Rédigez, gardez gated, publiez vos tutoriels.',         accent: 'var(--v)', code: '01' },
  { href: '/admin/labs',       title: 'Labs',       desc: 'Exercices pratiques avec objectif et prérequis.',       accent: 'var(--c)', code: '02' },
  { href: '/admin/projects',   title: 'Projets',    desc: 'Portfolio open-source et outils maison.',                accent: 'var(--a)', code: '03' },
  { href: '/admin/categories', title: 'Catégories', desc: 'Rubriques transverses du blog.',                         accent: 'var(--v)', code: '04' },
  { href: '/admin/codes',      title: 'Codes',      desc: 'Codes d\'invitation pour upgrader des utilisateurs.',   accent: 'var(--c)', code: '05' },
]

export default async function AdminDashboard() {
  const c = await counts()

  return (
    <div style={{ padding:'120px 48px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`
        .adh-stag { font-family:var(--fm); font-size:10px; letter-spacing:.22em; color:var(--v); text-transform:uppercase; margin-bottom:14px; }
        .adh-title { font-family:var(--fd); font-size:clamp(34px,4vw,46px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:14px; }
        .adh-title b { background:linear-gradient(135deg,var(--v),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; }
        .adh-sub { font-size:15px; color:var(--mid); font-weight:300; line-height:1.7; max-width:600px; margin-bottom:48px; }

        .adh-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:48px; }
        @media(max-width:700px) { .adh-stats { grid-template-columns:repeat(2,1fr); } }
        .adh-stat { background:var(--bg); padding:22px 24px; }
        .adh-stat-num { font-family:var(--fd); font-size:30px; font-weight:700; line-height:1; letter-spacing:-.02em; color:var(--text); }
        .adh-stat-label { font-family:var(--fm); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); margin-top:10px; }

        .adh-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:900px) { .adh-cards { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px) { .adh-cards { grid-template-columns:1fr; } }
        .adh-card { position:relative; padding:30px 28px; border:1px solid var(--border); border-radius:14px; background:rgba(255,255,255,.025); overflow:hidden; transition:border-color .3s, transform .3s var(--ease), background .3s; display:flex; flex-direction:column; min-height:160px; }
        .adh-card:hover { border-color:color-mix(in oklab, var(--ac-col) 40%, var(--border)); transform:translateY(-3px); background:rgba(255,255,255,.04); }
        .adh-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--ac-col), transparent); opacity:0; transition:opacity .3s; }
        .adh-card:hover::before { opacity:1; }
        .adh-code { font-family:var(--fm); font-size:10px; letter-spacing:.18em; color:var(--ac-col); margin-bottom:14px; }
        .adh-name { font-family:var(--fd); font-size:20px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:6px; }
        .adh-desc { font-size:13px; color:var(--mid); line-height:1.65; font-weight:300; flex:1; }
        .adh-cta { font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--ac-col); margin-top:18px; display:inline-flex; align-items:center; gap:6px; transition:gap .2s; }
        .adh-card:hover .adh-cta { gap:12px; }
      `}</style>
      <div className="adh-stag">// admin space</div>
      <h1 className="adh-title">Gestion du <b>contenu</b></h1>
      <p className="adh-sub">
        Crée, édite et publie tout le contenu du blog. Le rôle minimum requis pour chaque article ou lab
        est défini ici — un user free verra un paywall, un user pro accède immédiatement.
      </p>

      {c && (
        <div className="adh-stats">
          <div className="adh-stat"><div className="adh-stat-num">{c.articles}</div><div className="adh-stat-label">Articles</div></div>
          <div className="adh-stat"><div className="adh-stat-num">{c.labs}</div><div className="adh-stat-label">Labs</div></div>
          <div className="adh-stat"><div className="adh-stat-num">{c.projects}</div><div className="adh-stat-label">Projets</div></div>
          <div className="adh-stat"><div className="adh-stat-num">{c.categories}</div><div className="adh-stat-label">Catégories</div></div>
          <div className="adh-stat"><div className="adh-stat-num">{c.codes}</div><div className="adh-stat-label">Codes</div></div>
        </div>
      )}

      <div className="adh-cards">
        {CARDS.map(card => (
          <Link key={card.href} href={card.href} className="adh-card" style={{ '--ac-col': card.accent } as React.CSSProperties}>
            <div className="adh-code">// {card.code}</div>
            <div className="adh-name">{card.title}</div>
            <div className="adh-desc">{card.desc}</div>
            <span className="adh-cta">
              Ouvrir
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M2 5.5h7M6.5 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
