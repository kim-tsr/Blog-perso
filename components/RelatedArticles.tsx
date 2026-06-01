'use client'
import Link from 'next/link'
import { ArticleMeta, getThemeClasses } from '@/lib/theme'

export default function RelatedArticles({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null

  return (
    <section style={{ background:'var(--bg)', padding:'80px 0 100px', borderTop:'1px solid var(--border)' }}>
      <style>{`
        .rl-wrap { max-width:960px; margin:0 auto; padding:0 48px; }
        .rl-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:36px; }
        .rl-head h3 { font-family:var(--fd); font-size:22px; font-weight:700; letter-spacing:-.02em; color:var(--text); }
        .rl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:768px) { .rl-grid { grid-template-columns:1fr; } .rl-wrap { padding:0 24px; } .rl-head { flex-direction:column; align-items:flex-start; gap:12px; } }
        .rl-card { border:1px solid var(--border); border-radius:12px; padding:24px 22px; background:rgba(255,255,255,.02); transition:border-color .3s, transform .3s var(--ease), background .3s; display:flex; flex-direction:column; min-height:170px; }
        .rl-card:hover { border-color:rgba(255,255,255,.14); transform:translateY(-3px); background:rgba(255,255,255,.04); }
        .rl-tag { font-family:var(--fm); font-size:10px; letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; }
        .rl-title { font-family:var(--fd); font-size:15px; font-weight:600; letter-spacing:-.01em; line-height:1.4; color:var(--text); margin-bottom:10px; flex:1; }
        .rl-meta { font-family:var(--fm); font-size:10px; color:var(--dim); margin-top:auto; display:flex; gap:14px; }
      `}</style>
      <div className="rl-wrap">
        <div className="rl-head">
          <h3>Articles liés</h3>
          <Link href="/blog" className="btn-g" style={{padding:'10px 22px', fontSize:13}}>
            Tout le blog
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
        <div className="rl-grid">
          {articles.slice(0, 3).map(a => {
            const { tc } = getThemeClasses(a.theme)
            return (
              <Link key={a.slug} href={`/articles/${a.slug}`} className="rl-card">
                <div className={`rl-tag ${tc}`}>{a.tag}</div>
                <div className="rl-title">{a.title}</div>
                <div className="rl-meta"><span>{a.date}</span><span>{a.read}</span></div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
