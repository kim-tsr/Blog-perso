import { CATEGORIES, getArticlesByCategory, getThemeClasses, CategorySlug } from '@/lib/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES[slug as CategorySlug]
  if (!cat) return {}
  return { title: `${cat.label} — dev.sec.ops` }
}

const CAT_GLOW: Record<string, string> = {
  infra:  'oklch(0.50 0.28 280 / .18)',
  sec:    'oklch(0.50 0.18 194 / .16)',
  reseau: 'oklch(0.54 0.18 65  / .15)',
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES[slug as CategorySlug]
  if (!cat) notFound()
  const articles = getArticlesByCategory(slug as CategorySlug)
  const { tc } = getThemeClasses(cat.theme)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        .cat-hero { padding:90px 0 60px; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
        .cat-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 20% 60%,${CAT_GLOW[slug]},transparent 65%); pointer-events:none; }
        .cat-hero-inner { max-width:760px; margin:0 auto; padding:0 48px; position:relative; }
        .cat-title { font-family:var(--fd); font-size:clamp(44px,6vw,80px); font-weight:700; letter-spacing:-.03em; line-height:1.0; color:var(--text); margin:12px 0; }
        .cat-desc-text { font-size:17px; color:var(--mid); font-weight:300; margin-top:12px; }
        .cat-grid { max-width:1120px; margin:0 auto; padding:64px 48px 100px; display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        .ac { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transition:border-color .4s,box-shadow .4s; display:block; }
        .ac:hover { border-color:rgba(255,255,255,.14); box-shadow:0 24px 64px rgba(0,0,0,.6); }
        .ac-thumb { height:210px; overflow:hidden; }
        .ac-thumb-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; transition:transform .6s var(--ease); }
        .ac:hover .ac-thumb-inner { transform:scale(1.06); }
        .ac-tl { font-family:var(--fm); font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.3); text-transform:uppercase; }
        .ac-body { padding:26px; }
        .ac-tag { font-family:var(--fm); font-size:10px; letter-spacing:.1em; text-transform:uppercase; margin-bottom:10px; }
        .ac-title { font-family:var(--fd); font-size:16px; font-weight:700; letter-spacing:-.015em; line-height:1.35; color:var(--text); margin-bottom:10px; }
        .ac-meta { display:flex; justify-content:space-between; font-size:11px; color:var(--dim); margin-top:18px; padding-top:18px; border-top:1px solid var(--border); font-family:var(--fm); }
        @media(max-width:768px) { .cat-grid { grid-template-columns:1fr; padding:32px 24px 80px; } .cat-hero-inner { padding:0 24px; } }
      `}</style>

      <nav className="ao-nav">
        <Link href="/" className="ao-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </Link>
        <Link href="/" className="ao-logo">dev.<b>sec</b>.ops</Link>
        <div style={{width:80}} />
      </nav>

      <div className="cat-hero">
        <div className="cat-hero-inner">
          <div className={`ao-tag ${tc}`}>{cat.label}</div>
          <h1 className="cat-title">{cat.label}</h1>
          <p className="cat-desc-text">{cat.desc}</p>
        </div>
      </div>

      <div className="cat-grid">
        {articles.map(a => {
          const { tc: atc, thumb, tl } = getThemeClasses(a.theme)
          return (
            <Link key={a.slug} href={`/articles/${a.slug}`} className="ac" aria-label={`Lire : ${a.title}`}>
              <div className="ac-thumb">
                <div className={`ac-thumb-inner ${thumb}`} role="img" aria-label={`Miniature ${a.tag}`}>
                  <span className="ac-tl">{tl}</span>
                </div>
              </div>
              <div className="ac-body">
                <div className={`ac-tag ${atc}`}>{a.tag}</div>
                <h2 className="ac-title">{a.title}</h2>
                <div className="ac-meta"><span>{a.date}</span><span>{a.read}</span></div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
