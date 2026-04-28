import { getAllArticleMeta } from '@/lib/articles'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Pillars from '@/components/Pillars'
import ArticlesGrid from '@/components/ArticlesGrid'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import SideNav from '@/components/SideNav'

export default function Home() {
  const articles = getAllArticleMeta().slice(0, 6)

  return (
    <>
      <SideNav />
      <main>
        <Hero />
        <div className="beam-sep" aria-hidden="true" />
        <About />
        <div className="beam-sep" aria-hidden="true" />
        <Pillars />
        <div className="beam-sep" aria-hidden="true" />
        <section id="articles" data-section="articles" className="section" style={{background:'var(--bg)'}}>
          <div className="container">
            <ArticlesGrid articles={articles} />
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  )
}
