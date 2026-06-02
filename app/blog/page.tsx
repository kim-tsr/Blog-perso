import { Metadata } from 'next'
import { getAllArticleMeta } from '@/lib/articles'
import { getCurrentProfile } from '@/lib/auth'
import CategoryFilter from '@/components/CategoryFilter'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Blog — dev.sec.ops',
  description: 'Tutoriels techniques sur l\'infrastructure, la cybersécurité et le réseau.',
}

export default async function BlogPage() {
  const [articles, profile] = await Promise.all([
    getAllArticleMeta(),
    getCurrentProfile(),
  ])

  return (
    <>
      <main>
        <section style={{ paddingTop: 140, paddingBottom: 64, position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
          <style>{`
            .blog-orb { position:absolute; border-radius:50%; filter:blur(110px); pointer-events:none; }
            .blog-orb-1 { width:700px; height:500px; background:oklch(0.48 0.28 280/0.10); top:-100px; right:-150px; }
          `}</style>
          <div className="blog-orb blog-orb-1" aria-hidden="true" />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="stag">Base de connaissances</div>
            <h1 className="stitle" style={{ marginBottom: 12 }}>
              Le <span className="g">Blog</span>
            </h1>
            <p className="ssub" style={{ marginBottom: 0 }}>
              Tutoriels et guides sur l&apos;infrastructure, la cybersécurité et le réseau.
            </p>
          </div>
        </section>

        <div className="beam-sep" aria-hidden="true" />

        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <CategoryFilter allArticles={articles} userRole={profile?.role ?? null} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
