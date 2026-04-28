import { getAllArticles, getArticleBySlug, getThemeClasses } from '@/lib/articles'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return { title: `${article.title} — dev.sec.ops`, description: article.excerpt }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const { tc } = getThemeClasses(article.theme)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 0 }}>
      <style>{`
        .ao-hero-inner { max-width:760px; margin:0 auto; padding:0 48px; }
        .ao-hero { padding:80px 0 60px; border-bottom:1px solid var(--border); }
        .ao-title { font-family:var(--fd); font-size:clamp(32px,5vw,56px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:24px; }
        .ao-meta { display:flex; gap:20px; font-family:var(--fm); font-size:11px; color:var(--dim); }
        .ao-body { max-width:760px; margin:0 auto; padding:60px 48px 100px; }
        @media(max-width:768px) { .ao-hero-inner, .ao-body { padding-left:24px; padding-right:24px; } }
      `}</style>

      <nav className="ao-nav">
        <Link href="/" className="ao-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </Link>
        <Link href="/" className="ao-logo">dev.<b>sec</b>.ops</Link>
        <div style={{width:80}} />
      </nav>

      <div className="ao-hero">
        <div className="ao-hero-inner">
          <div className={`ao-tag ${tc}`}>{article.tag}</div>
          <h1 className="ao-title">{article.title}</h1>
          <div className="ao-meta">
            <span>{article.date}</span>
            <span>{article.read} de lecture</span>
            <span>{article.tag}</span>
          </div>
        </div>
      </div>

      <div className="ao-body prose">
        <MDXRemote source={article.content} />
      </div>
    </div>
  )
}
