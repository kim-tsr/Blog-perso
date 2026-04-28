import { getAllArticleMeta } from '@/lib/articles'
import Link from 'next/link'
import ArticlesGrid from '@/components/ArticlesGrid'
import Footer from '@/components/Footer'

export const metadata = { title: 'Tous les articles — dev.sec.ops' }

export default function AllArticles() {
  const articles = getAllArticleMeta()
  return (
    <>
      <main>
        <div style={{ paddingTop:120, paddingBottom:40, borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
          <div className="container">
            <Link href="/" className="ao-back" style={{display:'inline-flex',alignItems:'center',gap:8,color:'var(--mid)',fontSize:14,marginBottom:32}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Retour
            </Link>
            <div className="stag">Base de connaissances</div>
            <h1 className="stitle">Tous les articles</h1>
          </div>
        </div>
        <section className="section" style={{background:'var(--bg)'}}>
          <div className="container">
            <ArticlesGrid articles={articles} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
