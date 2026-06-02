import { getAllArticles, getAllArticleMeta, getArticleBySlug, getThemeClasses } from '@/lib/articles'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdxComponents'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import RelatedArticles from '@/components/RelatedArticles'
import TableOfContents from '@/components/TableOfContents'
import BookmarkButton from '@/components/BookmarkButton'
import Footer from '@/components/Footer'
import Paywall from '@/components/Paywall'
import { getCurrentProfile, hasRole } from '@/lib/auth'
import { markArticleRead } from '@/lib/progress'
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/lib/site'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const all = await getAllArticles()
  return all.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  const url = `${SITE_URL}/articles/${article.slug}`
  return {
    title: `${article.title} — ${SITE_NAME}`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'fr_FR',
      authors: [SITE_AUTHOR],
      tags: [article.tag],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const profile = await getCurrentProfile()
  const allowed = hasRole(profile?.role ?? null, article.minRole)

  // Auto-marquage de la lecture si autorisé (best-effort, ne bloque pas le rendu)
  if (allowed && profile) {
    await markArticleRead(article.slug)
  }

  const { tc } = getThemeClasses(article.theme)
  const allMeta = await getAllArticleMeta()
  const related = allMeta
    .filter(a => a.slug !== article.slug && a.tag === article.tag)
    .slice(0, 3)
  const fallback = related.length < 3
    ? [...related, ...allMeta.filter(a => a.slug !== article.slug && a.tag !== article.tag).slice(0, 3 - related.length)]
    : related

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: { '@type': 'Person', name: SITE_AUTHOR },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'fr',
    keywords: [article.tag],
    url: `${SITE_URL}/articles/${article.slug}`,
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />
      <TableOfContents />
      <style>{`
        .ao-hero-inner { max-width:760px; margin:0 auto; padding:0 48px; }
        .ao-hero { padding:140px 0 60px; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
        .ao-crumb { display:inline-flex; align-items:center; gap:8px; font-family:var(--fm); font-size:11px; letter-spacing:.12em; color:var(--dim); text-transform:uppercase; margin-bottom:28px; padding:6px 14px; border-radius:100px; border:1px solid var(--border); background:rgba(255,255,255,.025); transition:color .2s, border-color .2s, background .2s; }
        .ao-crumb:hover { color:var(--text); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.04); }
        .ao-hero-orb { position:absolute; width:500px; height:400px; border-radius:50%; filter:blur(110px); top:-150px; right:-80px; pointer-events:none; opacity:.5; }
        .ao-title { font-family:var(--fd); font-size:clamp(32px,5vw,56px); font-weight:700; letter-spacing:-.03em; line-height:1.05; color:var(--text); margin-bottom:18px; }
        .ao-excerpt { font-size:17px; color:var(--mid); font-weight:300; line-height:1.7; max-width:600px; margin-bottom:28px; }
        .ao-meta { display:flex; gap:18px; font-family:var(--fm); font-size:11px; color:var(--dim); flex-wrap:wrap; align-items:center; }
        .ao-meta span { display:inline-flex; align-items:center; gap:6px; }
        .ao-meta svg { color:var(--dim); }
        .ao-lock { color:var(--v); padding:3px 10px; border-radius:100px; border:1px solid oklch(0.68 0.24 280/.3); background:oklch(0.68 0.24 280/.1); letter-spacing:.14em; }
        .ao-body { max-width:760px; margin:0 auto; padding:60px 48px 100px; }
        @media(max-width:768px) { .ao-hero-inner, .ao-body { padding-left:24px; padding-right:24px; } }
      `}</style>

      <div className="ao-hero">
        <div className="ao-hero-orb" aria-hidden="true" style={{
          background: article.theme === 'violet' ? 'oklch(0.50 0.28 280/.20)'
                    : article.theme === 'cyan'   ? 'oklch(0.50 0.18 194/.18)'
                    : 'oklch(0.54 0.18 65/.18)',
        }} />
        <div className="ao-hero-inner" style={{position:'relative', zIndex:1}}>
          <Link href="/blog" className="ao-crumb">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 3L4 6l3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tous les articles
          </Link>
          <div className={`ao-tag ${tc}`}>{article.tag}</div>
          <h1 className="ao-title">{article.title}</h1>
          {article.excerpt && <p className="ao-excerpt">{article.excerpt}</p>}
          <div className="ao-meta">
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1"/></svg>
              {article.date}
            </span>
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
              {article.read} de lecture
            </span>
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 4l4.5 3 4.5-3M1.5 4v5a1 1 0 001 1h7a1 1 0 001-1V4M1.5 4l4.5-2.5L10.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {article.tag}
            </span>
            {article.minRole !== 'free' && !allowed && (
              <span className="ao-lock">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{marginRight:4}}><rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1"/></svg>
                {article.minRole}
              </span>
            )}
          </div>
          <div style={{ marginTop: 22 }}>
            <BookmarkButton type="article" slug={article.slug} />
          </div>
        </div>
      </div>

      {allowed ? (
        <div className="ao-body prose">
          <MDXRemote source={article.content} components={mdxComponents} />
        </div>
      ) : (
        <Paywall
          required={article.minRole}
          currentRole={profile?.role ?? null}
          kind="article"
          title={article.title}
          signinNext={`/articles/${article.slug}`}
        />
      )}

      <RelatedArticles articles={fallback} />
      <Footer />
    </div>
  )
}
